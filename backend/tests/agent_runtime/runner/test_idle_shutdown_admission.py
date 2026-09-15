import asyncio

import pytest

from app.agent_runtime.runner.run_registry import AgentRunAdmissionClosed, AgentRunRegistry


@pytest.mark.asyncio
@pytest.mark.parametrize("shutdown_first", [False, True])
async def test_idle_shutdown_and_task_registration_are_mutually_exclusive(shutdown_first: bool) -> None:
    registry = AgentRunRegistry()
    task = asyncio.create_task(asyncio.Event().wait())
    try:
        operations = [registry.try_register_parent("session", task), registry.try_begin_idle_shutdown()]
        if shutdown_first:
            operations.reverse()
        results = await asyncio.gather(*operations, return_exceptions=True)
        registered, draining = results[::-1] if shutdown_first else results
        assert (registered is True) is not draining
        if draining:
            assert isinstance(registered, AgentRunAdmissionClosed)
        if registered is True:
            assert await registry.has_running_tasks()
        else:
            assert not await registry.has_running_tasks()
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)


@pytest.mark.asyncio
@pytest.mark.parametrize("method", ["register", "try_register_parent", "register_child", "try_register_child"])
async def test_draining_blocks_every_registration_path_and_can_be_released(method: str) -> None:
    registry = AgentRunRegistry()
    task = asyncio.create_task(asyncio.Event().wait())
    args = ("session", "child", task) if "child" in method else ("session", task)
    register = getattr(registry, method)
    try:
        assert await registry.try_begin_idle_shutdown()
        with pytest.raises(AgentRunAdmissionClosed, match="shutting down"):
            await register(*args)
        assert not await registry.has_running_tasks()
        await registry.cancel_idle_shutdown()
        assert await register(*args) is (True if method.startswith("try_") else None)
        assert await registry.has_running_tasks()
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)


@pytest.mark.asyncio
async def test_rejected_launch_returns_retryable_error_without_starting_work(monkeypatch: pytest.MonkeyPatch) -> None:
    import inspect
    from fastapi import HTTPException
    from unittest.mock import AsyncMock
    from app.api.routers import agent_runtime

    registry = AgentRunRegistry()
    monkeypatch.setattr(agent_runtime, "get_agent_run_registry", lambda: registry)
    set_running = AsyncMock()
    monkeypatch.setattr(agent_runtime, "_set_task_running_state", set_running)
    started = False
    async def work():
        nonlocal started
        started = True
    coro = work()
    assert await registry.try_begin_idle_shutdown()
    with pytest.raises(HTTPException) as error:
        await agent_runtime._launch_task(db_session_factory=lambda: None,
            session_id="mobile", task_id="task", project_id="project", coro=coro)
    assert error.value.status_code == 503
    assert not started
    assert not await registry.has_running_tasks()
    assert inspect.getcoroutinestate(coro) == inspect.CORO_CLOSED
    assert set_running.await_args.kwargs["is_running"] is False


@pytest.mark.asyncio
async def test_continuation_cannot_bypass_closed_admission() -> None:
    from app.api.routers.agent_runtime import _replace_registered_parent_task

    registry = AgentRunRegistry()
    previous = asyncio.create_task(asyncio.sleep(0))
    await registry.register("session", previous)
    await previous
    assert await registry.try_begin_idle_shutdown()
    continuation = asyncio.create_task(asyncio.Event().wait())
    try:
        assert not await _replace_registered_parent_task(registry=registry,
            session_id="session", current_task=previous, continuation_task=continuation)
        assert not await registry.has_running_tasks()
    finally:
        continuation.cancel()
        await asyncio.gather(continuation, return_exceptions=True)


@pytest.mark.asyncio
async def test_child_resume_rejection_is_reported_and_does_not_leak_waiting_task(monkeypatch: pytest.MonkeyPatch) -> None:
    from types import SimpleNamespace
    from unittest.mock import AsyncMock
    from app.agent_runtime.tools.impls.orchestration import common

    registry = AgentRunRegistry()
    monkeypatch.setattr(common, "get_agent_run_registry", lambda: registry)
    monkeypatch.setattr(common, "_clear_child_processing_failure", AsyncMock())
    runner = SimpleNamespace(resume=AsyncMock())
    before = asyncio.all_tasks()
    assert await registry.try_begin_idle_shutdown()
    with pytest.raises(AgentRunAdmissionClosed):
        await common.ensure_child_processing(parent_session_id="parent", child_run_id="child",
            runner=runner, resume_payload={"approved": True})
    runner.resume.assert_not_awaited()
    assert asyncio.all_tasks() == before
    assert not await registry.has_running_tasks()
