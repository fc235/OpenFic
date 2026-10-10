import asyncio
import json
from importlib import import_module
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest


class _LockProbe:
    def __init__(self) -> None:
        self.active = 0


class _ProbeLock:
    def __init__(self, probe: _LockProbe) -> None:
        self._probe = probe

    async def __aenter__(self) -> None:
        self._probe.active += 1

    async def __aexit__(self, *_args: object) -> None:
        self._probe.active -= 1


def _lock_factory(probe: _LockProbe):
    async def acquire(_key: object) -> _ProbeLock:
        return _ProbeLock(probe)

    return acquire


def _locks_factory(probe: _LockProbe):
    async def acquire(_keys: object) -> _ProbeLock:
        return _ProbeLock(probe)

    return acquire


@pytest.mark.asyncio
@pytest.mark.parametrize("operation", ["delete_chapter", "move_chapter_to_volume"])
async def test_chapter_mutations_reject_source_volume_changed_while_waiting(
    operation, monkeypatch
):
    from app.agent_runtime.tools.errors import ToolExecutionError

    module = import_module(f"app.agent_runtime.tools.impls.chapter.{operation}")
    session = AsyncMock()
    source = SimpleNamespace(id="a", title="A", order=1)
    target = SimpleNamespace(id="c", title="C", order=3)
    original = SimpleNamespace(
        id="chapter",
        project_id="project",
        volume_id="a",
        order=1,
        title="Chapter",
        content="text",
        word_count=1,
    )
    # The locked read observes another tool's completed A -> B move.
    current = SimpleNamespace(**{**vars(original), "volume_id": "b"})
    monkeypatch.setattr(module, "create_session", AsyncMock(return_value=session))
    monkeypatch.setattr(
        module.volume_repo, "list_by_project", AsyncMock(return_value=[source, target])
    )
    monkeypatch.setattr(
        module.volume_repo,
        "get_by_id",
        AsyncMock(side_effect=lambda _s, id: source if id == "a" else target),
    )
    monkeypatch.setattr(
        module.chapter_repo, "get_by_volume_ref", AsyncMock(return_value=original)
    )
    monkeypatch.setattr(
        module.chapter_repo, "get_by_id", AsyncMock(return_value=current)
    )
    monkeypatch.setattr(
        module.chapter_repo, "list_by_volume_from_order", AsyncMock(return_value=[])
    )
    mutation = AsyncMock(return_value=current)
    monkeypatch.setattr(module.chapter_service, operation, mutation)
    monkeypatch.setattr(module, "record_chapter_diffs", AsyncMock(return_value=[]))
    monkeypatch.setattr(module, "refresh_project_stats", AsyncMock(), raising=False)
    name = (
        "DeleteChapterTool"
        if operation == "delete_chapter"
        else "MoveChapterToVolumeTool"
    )
    tool = getattr(module, name)(
        _state={
            "project_id": "project",
            "session_id": "session",
            "task_id": "task",
            "current_revision_id": "revision",
        }
    )
    args = {
        "volume_ref": {"type": "order", "value": 1},
        "chapter_ref": {"type": "order", "value": 1},
    }
    if operation == "move_chapter_to_volume":
        args["target_volume_ref"] = {"type": "order", "value": 3}
    with pytest.raises(ToolExecutionError, match="所属卷已变化"):
        await tool._execute(**args)
    mutation.assert_not_awaited()
    session.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_volume_delete_waits_for_in_flight_chapter_write(monkeypatch):
    from app.agent_runtime.tools.impls._locks import keyed_lock
    from app.agent_runtime.tools.impls.chapter import delete_volume as module

    project = "delete-volume-lock-regression"
    session = AsyncMock()
    volume = SimpleNamespace(id="volume", title="Volume", order=1)
    parsed = asyncio.Event()

    async def list_volumes(*_args):
        parsed.set()
        return [volume]

    monkeypatch.setattr(module, "create_session", AsyncMock(return_value=session))
    monkeypatch.setattr(module.volume_repo, "list_by_project", list_volumes)
    monkeypatch.setattr(module.volume_repo, "get_by_id", AsyncMock(return_value=volume))
    count = AsyncMock(return_value=0)
    monkeypatch.setattr(module.chapter_repo, "count_by_volume", count)
    monkeypatch.setattr(module.volume_service, "delete_volume", AsyncMock())
    monkeypatch.setattr(module, "refresh_project_stats", AsyncMock())
    tool = module.DeleteVolumeTool(
        _state={"project_id": project, "session_id": "session"}
    )
    lock = await keyed_lock(("chapters", project))
    await lock.acquire()
    task = asyncio.create_task(tool._execute({"type": "order", "value": 1}))
    try:
        await parsed.wait()
        await asyncio.sleep(0)
        count.assert_not_awaited()
        assert not task.done()
    finally:
        lock.release()
        await task


@pytest.mark.asyncio
async def test_keyed_locks_serialize_keys_in_stable_order() -> None:
    from app.agent_runtime.tools.impls._locks import keyed_locks

    active = 0
    max_active = 0
    entered = asyncio.Event()

    async def critical_section() -> None:
        nonlocal active, max_active
        active += 1
        max_active = max(max_active, active)
        entered.set()
        await asyncio.sleep(0)
        active -= 1

    async def run(keys: list[object]) -> None:
        async with keyed_locks(keys):
            await critical_section()

    first = asyncio.create_task(run(["volume-a", "volume-b"]))
    second = asyncio.create_task(run(["volume-b", "volume-a"]))
    await entered.wait()
    await asyncio.gather(first, second)

    assert max_active == 1


@pytest.mark.asyncio
async def test_delete_chapter_runs_mutation_inside_volume_lock() -> None:
    from app.agent_runtime.tools.impls.chapter.delete_chapter import DeleteChapterTool

    probe = _LockProbe()
    session = AsyncMock()
    volume = SimpleNamespace(id="volume-1", title="第一卷", order=1)
    chapter = SimpleNamespace(
        id="chapter-1",
        project_id="project-1",
        volume_id="volume-1",
        title="第一章",
        content="内容",
        word_count=2,
        order=1,
    )

    async def delete_chapter(*_args: object, **_kwargs: object) -> None:
        assert probe.active == 1

    async def get_by_id(_session: object, item_id: str):
        return volume if item_id == volume.id else chapter

    tool = DeleteChapterTool(
        _state={
            "project_id": "project-1",
            "session_id": "session-1",
            "task_id": "task-1",
            "current_revision_id": "revision-1",
        }
    )
    with (
        patch(
            "app.agent_runtime.tools.impls.chapter.delete_chapter.create_session",
            new=AsyncMock(return_value=session),
        ),
        patch(
            "app.agent_runtime.tools.impls.chapter.delete_chapter.keyed_lock",
            new=_lock_factory(probe),
            create=True,
        ),
        patch(
            "app.agent_runtime.tools.impls.chapter.delete_chapter.volume_repo.list_by_project",
            new=AsyncMock(return_value=[volume]),
        ),
        patch(
            "app.agent_runtime.tools.impls.chapter.delete_chapter.chapter_repo.get_by_volume_ref",
            new=AsyncMock(return_value=chapter),
        ),
        patch(
            "app.agent_runtime.tools.impls.chapter.delete_chapter.volume_repo.get_by_id",
            side_effect=get_by_id,
        ),
        patch(
            "app.agent_runtime.tools.impls.chapter.delete_chapter.chapter_repo.get_by_id",
            side_effect=get_by_id,
        ),
        patch(
            "app.agent_runtime.tools.impls.chapter.delete_chapter.chapter_repo.list_by_volume_from_order",
            new=AsyncMock(return_value=[chapter]),
        ),
        patch(
            "app.agent_runtime.tools.impls.chapter.delete_chapter.chapter_service.delete_chapter",
            side_effect=delete_chapter,
        ),
        patch(
            "app.agent_runtime.tools.impls.chapter.delete_chapter.record_chapter_diffs",
            new=AsyncMock(return_value=[]),
        ),
        patch(
            "app.agent_runtime.tools.impls.chapter.delete_chapter.record_agent_activity_for_change",
            new=AsyncMock(),
        ),
    ):
        result = await tool._execute(
            volume_ref={"type": "order", "value": 1},
            chapter_ref={"type": "order", "value": 1},
        )

    assert json.loads(result)["success"] is True


@pytest.mark.asyncio
async def test_write_plan_runs_replacement_inside_session_lock() -> None:
    from app.agent_runtime.tools.impls.plan.write_plan import WritePlanTool

    probe = _LockProbe()
    session = AsyncMock()

    async def write_plan(*_args: object, **_kwargs: object) -> dict:
        assert probe.active == 1
        return {"todos": []}

    tool = WritePlanTool(_state={"session_id": "session-1"})
    with (
        patch(
            "app.agent_runtime.tools.impls.plan.write_plan.create_session",
            new=AsyncMock(return_value=session),
        ),
        patch(
            "app.agent_runtime.tools.impls.plan.write_plan.keyed_lock",
            new=_lock_factory(probe),
            create=True,
        ),
        patch(
            "app.agent_runtime.plan.service.write_plan",
            side_effect=write_plan,
        ),
    ):
        result = await tool._execute([])

    assert result == ""
