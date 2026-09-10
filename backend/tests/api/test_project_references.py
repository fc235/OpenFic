import pytest


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
