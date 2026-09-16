import pytest


async def _reference_books(client, session):
    from app.storage.models.chapter import Chapter

    ids = [(await client.post("/api/v1/projects", data={"title": title})).json()["id"]
           for title in ["Current", "Reference", "Unlinked"]]
    volumes = [(await client.get(f"/api/v1/projects/{pid}/volumes")).json()[0]
               for pid in ids]
    chapters = []
    for pid, volume in zip(ids[1:], volumes[1:]):
        chapter = Chapter(project_id=pid, volume_id=volume["id"], title="Same title",
                          content="First paragraph.\nDialogue.\nLast paragraph.", order=1,
                          word_count=42)
        session.add(chapter)
        chapters.append(chapter)
    await session.flush()
    return ids, volumes, chapters


@pytest.mark.asyncio
async def test_chapter_reference_reads_full_live_content_with_provenance(client, session):
    from sqlalchemy import update
    from app.storage.models.chapter import Chapter

    (a, b, _), volumes, (chapter, _) = await _reference_books(client, session)
    url = f"/api/v1/projects/{a}/references/chapters"
    assert (await client.put(url, json={"source_project_ids": [b]})).status_code == 200
    brief = (await client.get(f"{url}/{b}", params={"brief": True})).json()
    assert brief["source_project_id"] == b
    assert brief["source_project_title"] == "Reference"
    assert brief["readonly"] is True
    assert brief["volumes"][0]["id"] == volumes[1]["id"]
    assert brief["items"][0]["id"] == chapter.id
    assert brief["items"][0]["volume_title"] == volumes[1]["title"]
    assert "content" not in brief["items"][0]
    # Omitting brief must still not inject every chapter body.
    assert "content" not in (await client.get(f"{url}/{b}")).json()["items"][0]
    detail = (await client.get(f"{url}/{b}", params={"item_id": chapter.id})).json()
    assert detail["items"][0]["content"] == chapter.content
    await session.execute(update(Chapter).where(Chapter.id == chapter.id).values(content="Updated manuscript"))
    await session.flush()
    assert (await client.get(f"{url}/{b}", params={"item_id": chapter.id})).json()["items"][0]["content"] == "Updated manuscript"


@pytest.mark.asyncio
async def test_chapter_references_enforce_binding_and_item_ownership(client, session):
    (a, b, c), volumes, (owned, foreign) = await _reference_books(client, session)
    url = f"/api/v1/projects/{a}/references/chapters"
    assert (await client.get(f"{url}/{b}")).status_code == 404
    assert (await client.put(url, json={"source_project_ids": [b]})).status_code == 200
    await client.put(f"/api/v1/projects/{b}/references/chapters", json={"source_project_ids": [c]})
    assert (await client.get(f"{url}/{c}")).status_code == 404
    assert (await client.get(f"{url}/{b}", params={"item_id": foreign.id})).status_code == 404
    assert (await client.get(f"{url}/{b}", params={"item_id": "missing"})).status_code == 404
    assert (await client.get(f"{url}/{b}", params={"volume_id": volumes[2]["id"]})).status_code == 404
    assert (await client.get(f"{url}/{b}", params={"volume_id": volumes[1]["id"], "item_id": owned.id})).status_code == 200
    assert (await client.get(f"/api/v1/projects/{a}/references/characters/{b}")).status_code == 404
    await client.put(url, json={"source_project_ids": []})
    assert (await client.get(f"{url}/{b}", params={"item_id": owned.id})).status_code == 404
    assert (await client.get(f"/api/v1/chapters/{owned.id}")).status_code == 200


@pytest.mark.asyncio
async def test_agent_reads_reference_chapters_by_stable_id_and_rechecks_links(client, session):
    import json
    from unittest.mock import AsyncMock, patch
    from app.agent_runtime.tools.registry import ToolRegistry
    from app.agent_runtime.tools.errors import ToolExecutionError
    from app.core.errors import NotFoundError

    (a, b, c), volumes, (owned, foreign) = await _reference_books(client, session)
    await client.put(f"/api/v1/projects/{a}/references/chapters", json={"source_project_ids": [b]})
    tools = ToolRegistry.get_tools(names=["read_shared_chapters"], state={"project_id": a})
    assert len(tools) == 1
    tool = tools[0]
    assert tool.access_level == "readonly"
    assert "明确要求" in tool.description
    with patch("app.agent_runtime.tools.impls.context.shared_chapters.create_session", AsyncMock(return_value=session)), patch.object(session, "close", AsyncMock()):
        assert json.loads(await tool._execute())["sources"][0]["id"] == b
        assert "content" not in json.loads(await tool._execute(b))["items"][0]
        result = json.loads(await tool._execute(b, owned.id, volumes[1]["id"]))
        assert result["source_project_title"] == "Reference"
        assert result["readonly"] is True
        assert result["items"][0]["content"] == "1|First paragraph.\n2|Dialogue.\n3|Last paragraph."
        with pytest.raises(NotFoundError):
            await tool._execute(c)
        with pytest.raises(NotFoundError):
            await tool._execute(b, foreign.id)
        with pytest.raises(ToolExecutionError):
            await tool._execute(chapter_id=owned.id)
        await client.put(f"/api/v1/projects/{a}/references/chapters", json={"source_project_ids": []})
        with pytest.raises(NotFoundError):
            await tool._execute(b, owned.id)


def test_reference_chapter_tool_available_to_writing_agents_and_has_permission():
    from app.agent_runtime.agents.definitions import get_default_agent_definition
    from app.agent_runtime.agents.tool_categories import get_tool_names_for_categories
    from app.agent_runtime.tools.permission_metadata import get_tool_permission_metadata

    for agent in ["build", "writer", "actor"]:
        names = get_tool_names_for_categories(get_default_agent_definition(agent).enabled_tool_categories)
        assert "read_shared_chapters" in names
    permission = get_tool_permission_metadata("read_shared_chapters")
    assert permission is not None
    assert permission.default_mode == "allow"


@pytest.mark.asyncio
async def test_reference_brief_and_detail_respect_source_and_unlink(client):
    a, b, c = [(await client.post("/api/v1/projects", data={"title": title})).json()["id"] for title in ["A", "B", "C"]]
    owned = (await client.post(f"/api/v1/projects/{b}/characters", data={"name": "共享角色", "description": "正文"})).json()
    foreign = (await client.post(f"/api/v1/projects/{c}/characters", data={"name": "其他角色", "description": "不能读取"})).json()
    url = f"/api/v1/projects/{a}/references/characters"
    await client.put(url, json={"source_project_ids": [b]})
    brief = await client.get(f"{url}/{b}", params={"brief": True})
    assert brief.json() == {"items": [{"id": owned["id"], "name": "共享角色"}]}
    detail = await client.get(f"{url}/{b}", params={"item_id": owned["id"]})
    assert detail.json()["items"][0]["content"] == "正文"
    assert (await client.get(f"{url}/{b}", params={"item_id": foreign["id"]})).status_code == 404
    await client.put(url, json={"source_project_ids": []})
    assert (await client.get(f"{url}/{b}", params={"item_id": owned["id"]})).status_code == 404


@pytest.mark.asyncio
async def test_reference_is_explicit_live_and_removable(client):
    ids = [(await client.post("/api/v1/projects", data={"title": title})).json()["id"] for title in ["A", "B", "C"]]
    a, b, c = ids
    character = (await client.post(f"/api/v1/projects/{b}/characters", data={"name": "林舟", "description": "基础设定"})).json()
    url = f"/api/v1/projects/{a}/references/characters"
    assert (await client.get(url + f"/{b}")).status_code == 404
    assert (await client.put(url, json={"source_project_ids": [b]})).status_code == 200
    data = (await client.get(url)).json()
    assert [p["id"] for p in data["sources"]] == [b]
    assert (await client.get(url + f"/{b}")).json()["items"][0]["content"] == "基础设定"
    await client.patch(f"/api/v1/characters/{character['id']}", data={"description": "更新后的基础设定"})
    assert (await client.get(url + f"/{b}")).json()["items"][0]["content"] == "更新后的基础设定"
    assert (await client.get(f"/api/v1/projects/{c}/references/characters/{b}")).status_code == 404
    await client.put(url, json={"source_project_ids": []})
    assert (await client.get(url + f"/{b}")).status_code == 404
    assert (await client.get(f"/api/v1/characters/{character['id']}")).status_code == 200


@pytest.mark.asyncio
async def test_invalid_reference_does_not_replace_existing(client):
    a, b = [(await client.post("/api/v1/projects", data={"title": title})).json()["id"] for title in ["A", "B"]]
    url = f"/api/v1/projects/{a}/references/worldInfo"
    assert (await client.put(url, json={"source_project_ids": [b]})).status_code == 200
    assert (await client.put(url, json={"source_project_ids": [a]})).status_code == 400
    assert (await client.put(url, json={"source_project_ids": ["missing"]})).status_code == 404
    assert [p["id"] for p in (await client.get(url)).json()["sources"]] == [b]


@pytest.mark.asyncio
async def test_world_reference_is_not_transitive_and_omits_disabled_entries(client, session):
    from app.storage.models.world_info_entry import WorldInfoEntry
    a, b, c = [(await client.post("/api/v1/projects", data={"title": title})).json()["id"] for title in ["A", "B", "C"]]
    world = (await client.get(f"/api/v1/projects/{b}/world-info")).json()
    session.add(WorldInfoEntry(world_info_id=world["id"], uid=1, name="基础", order=1, content="共享设定"))
    session.add(WorldInfoEntry(world_info_id=world["id"], uid=2, name="隐藏", order=2, content="隐藏设定", is_enabled=False))
    await session.flush()
    await client.put(f"/api/v1/projects/{a}/references/worldInfo", json={"source_project_ids":[b]})
    await client.put(f"/api/v1/projects/{b}/references/worldInfo", json={"source_project_ids":[c]})
    result = await client.get(f"/api/v1/projects/{a}/references/worldInfo/{b}")
    assert [item["name"] for item in result.json()["items"]] == ["基础"]
    brief = await client.get(f"/api/v1/projects/{a}/references/worldInfo/{b}", params={"brief": True})
    assert [item["name"] for item in brief.json()["items"]] == ["基础"]
    assert "content" not in brief.json()["items"][0]
    detail = await client.get(f"/api/v1/projects/{a}/references/worldInfo/{b}", params={"item_id": brief.json()["items"][0]["id"]})
    assert detail.json()["items"][0]["content"] == "共享设定"
    assert (await client.get(f"/api/v1/projects/{a}/references/worldInfo/{c}")).status_code == 404
    assert (await client.get(f"/api/v1/projects/{a}/references/characters/{b}")).status_code == 404


@pytest.mark.asyncio
async def test_deleting_source_cleans_links_without_deleting_target(client, session):
    from sqlalchemy import select
    from app.storage.models.project_reference import ProjectReference
    a, b = [(await client.post("/api/v1/projects", data={"title": title})).json()["id"] for title in ["A", "B"]]
    await client.put(f"/api/v1/projects/{a}/references/characters", json={"source_project_ids":[b]})
    assert (await client.delete(f"/api/v1/projects/{b}")).status_code == 204
    assert (await client.get(f"/api/v1/projects/{a}/references/characters")).json()["sources"] == []
    assert list((await session.execute(select(ProjectReference))).scalars()) == []


@pytest.mark.asyncio
async def test_agent_reads_only_linked_material(client, session):
    import json
    from unittest.mock import AsyncMock, patch
    from app.agent_runtime.tools.impls.context.shared_material import ReadSharedCharactersTool
    from app.core.errors import NotFoundError
    a, b, c = [(await client.post("/api/v1/projects", data={"title": title})).json()["id"] for title in ["A", "B", "C"]]
    await client.post(f"/api/v1/projects/{b}/characters", data={"name":"林舟", "description":"共享设定"})
    await client.put(f"/api/v1/projects/{a}/references/characters", json={"source_project_ids":[b]})
    tool = ReadSharedCharactersTool(_state={"project_id":a})
    with patch("app.agent_runtime.tools.impls.context.shared_material.create_session", AsyncMock(return_value=session)), patch.object(session, "close", AsyncMock()):
        assert json.loads(await tool._execute())["sources"][0]["id"] == b
        assert "content" not in json.loads(await tool._execute(b))["items"][0]
        assert json.loads(await tool._execute(b, "林舟"))["items"][0]["content"] == "共享设定"
        with pytest.raises(NotFoundError):
            await tool._execute(c)
