"""Read explicitly linked sources; existing write tools remain project-local."""

import json

from pydantic import BaseModel, Field

from app.agent_runtime.tools.base import AgentTool
from app.agent_runtime.tools.registry import ToolRegistry
from app.agent_runtime.tools.errors import ToolExecutionError
from app.storage.database import create_session
from app.storage.services import project_reference_service as service


class SharedMaterialInput(BaseModel):
    source_project_id: str | None = Field(default=None, description="省略则列出当前项目显式引用的来源项目")
    name: str | None = Field(default=None, description="省略则列出来源条目名称；填写精确名称读取正文")


class SharedMaterialTool(AgentTool):
    access_level: str = "readonly"
    args_schema: type[BaseModel] = SharedMaterialInput
    resource: service.Resource = "characters"

    async def _execute(self, source_project_id: str | None = None, name: str | None = None) -> str:
        session = await create_session()
        try:
            if source_project_id is None:
                sources = await service.list_sources(session, self.project_id, self.resource)
                data = {"sources": [{"id": p.id, "title": p.title} for p in sources]}
            else:
                material = await service.read_shared_material(session, self.project_id, source_project_id, self.resource)
                items = material["items"]
                if name is not None:
                    items = [item for item in items if item["name"] == name]
                    if not items:
                        raise ToolExecutionError("来源中不存在该条目")
                else:
                    items = [{"id": item["id"], "name": item["name"]} for item in items]
                data = {"source_project_id": source_project_id, "readonly": True, "items": items}
            return json.dumps(data, ensure_ascii=False)
        finally:
            await session.close()


@ToolRegistry.register
class ReadSharedCharactersTool(SharedMaterialTool):
    name: str = "read_shared_characters"
    description: str = "按需读取当前项目明确引用的共享角色。先不传参数查询来源，再指定来源列出名称，最后按名称读取。共享基础设定只读，当前项目独立状态以本地角色资料为准。"
    resource: service.Resource = "characters"


@ToolRegistry.register
class ReadSharedWorldEntriesTool(SharedMaterialTool):
    name: str = "read_shared_world_entries"
    description: str = "按需读取当前项目明确引用的共享世界书。先不传参数查询来源，再指定来源列出名称，最后按名称读取。共享设定只读，不能通过当前项目写工具修改来源。"
    resource: service.Resource = "worldInfo"
