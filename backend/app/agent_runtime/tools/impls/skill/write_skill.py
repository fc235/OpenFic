"""Create reusable skills without replacing existing settings."""

import json
from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent_runtime.agents.definitions import load_agent_definition
from app.agent_runtime.tools.base import AgentTool
from app.agent_runtime.tools.errors import ToolExecutionError
from app.agent_runtime.tools.impls._locks import keyed_lock
from app.agent_runtime.tools.registry import ToolRegistry
from app.storage.database import create_session
from app.storage.services import agent_definition_service, skill_reference_doc_service, skill_service

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100_000)]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=180)]


class SkillReferenceInput(BaseModel):
    title: Name
    content: Text


class WriteSkillInput(BaseModel):
    name: Name = Field(description="技能名称")
    summary: Text = Field(description="技能适用场景与用途简介")
    content: Text = Field(description="技能完整操作步骤、约束与验收要求")
    agent_key: Name | None = Field(default=None, description="仅用户要求绑定时填写目标 Agent key，例如 build、writer、reviewer；省略则保存为未启用技能")
    references: list[SkillReferenceInput] = Field(default_factory=list, max_length=20, description="可选参考文档")


async def save_skill(session: AsyncSession, data: WriteSkillInput):
    definition = None
    if data.agent_key:
        try:
            definition = await load_agent_definition(session, data.agent_key)
        except KeyError as exc:
            raise ToolExecutionError(f"智能体不存在: {data.agent_key}") from exc
    skill = await skill_service.create_skill(
        session, name=data.name, summary=data.summary, content=data.content,
        is_enabled=definition is not None,
    )
    for ref in data.references:
        await skill_reference_doc_service.create_reference_doc(
            session, skill.id, title=ref.title, content=ref.content,
        )
    if definition is not None:
        await agent_definition_service.update_definition(
            session, definition.key, enabled_skills=[*definition.enabled_skills, skill.id],
        )
    return skill


@ToolRegistry.register
class WriteSkillTool(AgentTool):
    name: str = "write_skill"
    description: str = (
        "用户要求保存可复用方法为技能时，将技能写入设置，可选绑定指定 Agent。"
        "同名自动编号，不覆盖已有技能。未指定绑定则保存为未启用。"
        "新绑定用于后续执行，不改变当前执行的技能列表。"
        "这是全局设置，章节或会话回滚不会删除技能。"
    )
    access_level: str = "write"
    args_schema: type[BaseModel] = WriteSkillInput

    async def _execute(self, **kwargs) -> str:
        data = WriteSkillInput.model_validate(kwargs)
        async with await keyed_lock("agent-save-skill"):
            session = await create_session()
            try:
                skill = await save_skill(session, data)
                result = json.dumps({
                    "success": True, "skill_id": skill.id, "name": skill.name,
                    "agent_key": data.agent_key, "is_enabled": skill.is_enabled,
                    "message": "已保存至设置；绑定在后续执行中加载" if data.agent_key else "已保存至设置，尚未启用或绑定",
                }, ensure_ascii=False)
                await session.commit()
                return result
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
