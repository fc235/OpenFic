import pytest
from pydantic import ValidationError

from app.agent_runtime.tools.impls.skill.write_skill import WriteSkillInput, save_skill
from app.agent_runtime.agents.definitions import load_agent_definition
from app.storage.services import skill_service


@pytest.mark.asyncio
async def test_save_and_bind_preserves_existing_skills(session):
    first = await save_skill(session, WriteSkillInput(name="文风", summary="续写", content="保持视角", agent_key="writer"))
    second = await save_skill(session, WriteSkillInput(name="文风", summary="审稿", content="检查视角", agent_key="writer", references=[{"title": "样例", "content": "正文"}]))
    assert first.name == "文风"
    assert second.name == "文风 (2)"
    assert (await skill_service.get_skill(session, first.id)).content == "保持视角"
    definition = await load_agent_definition(session, "writer")
    assert first.id in definition.enabled_skills and second.id in definition.enabled_skills
    assert second.is_enabled
    assert (await skill_service.list_reference_docs(session, second.id))[0].content == "正文"


@pytest.mark.asyncio
async def test_save_without_binding_is_disabled(session):
    skill = await save_skill(session, WriteSkillInput(name="文风", summary="续写", content="保持视角"))
    assert not skill.is_enabled


@pytest.mark.asyncio
async def test_invalid_target_creates_nothing(session):
    from app.agent_runtime.tools.errors import ToolExecutionError
    before = await skill_service.list_skills(session)
    with pytest.raises(ToolExecutionError):
        await save_skill(session, WriteSkillInput(name="文风", summary="续写", content="保持视角", agent_key="missing-agent"))
    assert (await skill_service.list_skills(session)).total == before.total


@pytest.mark.parametrize("field", ["name", "summary", "content"])
def test_blank_input_rejected(field):
    args = dict(name="文风", summary="续写", content="保持视角")
    args[field] = "  "
    with pytest.raises(ValidationError):
        WriteSkillInput(**args)


@pytest.mark.asyncio
async def test_new_binding_not_readable_in_current_snapshot(session):
    from app.agent_runtime.tools.errors import ToolExecutionError
    from app.agent_runtime.tools.impls.skill.skill import _resolve_authorized_skill
    skill = await save_skill(session, WriteSkillInput(name="文风", summary="续写", content="保持视角", agent_key="writer"))
    with pytest.raises(ToolExecutionError):
        await _resolve_authorized_skill(session, {"active_agent": "writer", "skill_binding_snapshot": []}, skill.name)
    assert (await _resolve_authorized_skill(session, {"active_agent": "writer"}, skill.name)).id == skill.id


@pytest.mark.asyncio
async def test_tool_rolls_back_on_reference_failure():
    from unittest.mock import AsyncMock, patch
    from app.agent_runtime.tools.impls.skill.write_skill import WriteSkillTool
    db = AsyncMock()
    with patch("app.agent_runtime.tools.impls.skill.write_skill.create_session", AsyncMock(return_value=db)), patch(
        "app.agent_runtime.tools.impls.skill.write_skill.save_skill", AsyncMock(side_effect=RuntimeError("reference failed"))
    ):
        with pytest.raises(RuntimeError):
            await WriteSkillTool()._execute(name="文风", summary="续写", content="保持视角")
    db.rollback.assert_awaited_once()
    db.commit.assert_not_awaited()
    db.close.assert_awaited_once()


def test_upgrade_preserves_custom_categories_and_only_enables_build():
    import importlib
    import json
    from unittest.mock import patch
    import sqlalchemy as sa
    migration = importlib.import_module("app.storage.migrations.versions.1024_enable_build_skill_write")
    with sa.create_engine("sqlite://").begin() as connection:
        connection.execute(sa.text("CREATE TABLE agent_definitions (id TEXT, key TEXT, enabled_tool_categories TEXT)"))
        connection.execute(sa.text("INSERT INTO agent_definitions VALUES (:id, :key, :categories)"), [
            {"id": "1", "key": "build", "categories": '["chapter_read"]'},
            {"id": "2", "key": "writer", "categories": '["chapter_read"]'},
        ])
        with patch.object(migration.op, "get_bind", return_value=connection):
            migration.upgrade()
            migration.upgrade()
            rows = connection.execute(sa.text("SELECT enabled_tool_categories FROM agent_definitions ORDER BY id")).scalars().all()
            assert json.loads(rows[0]) == ["chapter_read", "skill_write"]
            assert json.loads(rows[1]) == ["chapter_read"]
            migration.downgrade()
            assert json.loads(connection.execute(sa.text("SELECT enabled_tool_categories FROM agent_definitions WHERE id = '1'")).scalar_one()) == ["chapter_read"]
