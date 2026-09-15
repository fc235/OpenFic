import asyncio
from types import SimpleNamespace

import pytest
from httpx import AsyncClient

from app.agent_runtime.runner.run_registry import AgentRunAdmissionClosed, AgentRunRegistry
from app.agent_runtime.runner import run_registry
from app.api.routers import health
from app.agent_runtime.persistence.child_runs import create_child_run
from app.storage.models.task import Task
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.fixture(autouse=True)
def registry(monkeypatch: pytest.MonkeyPatch) -> AgentRunRegistry:
    isolated = AgentRunRegistry()
    monkeypatch.setattr(run_registry, "_RUN_REGISTRY", isolated)
    return isolated


@pytest.mark.asyncio
@pytest.mark.parametrize("child", [False, True])
async def test_idle_shutdown_waits_for_running_tasks(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch, registry: AgentRunRegistry, child: bool,
) -> None:
    app = client._transport.app
    app.state.uvicorn_server = SimpleNamespace(should_exit=False)
    monkeypatch.setenv("OPENFIC_SHUTDOWN_TOKEN", "owner-token")
    task = asyncio.create_task(asyncio.Event().wait())
    try:
        if child:
            await registry.register_child("session", "child", task)
        else:
            await registry.register("session", task)
        response = await client.post("/api/v1/health/shutdown?only_if_idle=true", headers={"X-OpenFic-Shutdown-Token": "owner-token"})
        assert response.status_code == 409
        assert app.state.uvicorn_server.should_exit is False
        assert not task.cancelled()
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)


@pytest.mark.asyncio
async def test_shutdown_endpoint_requests_graceful_server_exit(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    app = client._transport.app  # type: ignore[attr-defined]
    server = SimpleNamespace(should_exit=False)
    app.state.uvicorn_server = server
    monkeypatch.setenv("OPENFIC_SHUTDOWN_TOKEN", "desktop-shutdown-token")

    response = await client.post(
        "/api/v1/health/shutdown",
        headers={"X-OpenFic-Shutdown-Token": "desktop-shutdown-token"},
    )

    assert response.status_code == 202
    assert server.should_exit is True


@pytest.mark.asyncio
async def test_shutdown_endpoint_rejects_invalid_token(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    app = client._transport.app  # type: ignore[attr-defined]
    server = SimpleNamespace(should_exit=False)
    app.state.uvicorn_server = server
    monkeypatch.setenv("OPENFIC_SHUTDOWN_TOKEN", "desktop-shutdown-token")

    response = await client.post(
        "/api/v1/health/shutdown",
        headers={"X-OpenFic-Shutdown-Token": "invalid-token"},
    )

    assert response.status_code == 404
    assert server.should_exit is False


@pytest.mark.asyncio
async def test_idle_shutdown_blocks_concurrent_admission_until_server_exit(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch, registry: AgentRunRegistry,
) -> None:
    app = client._transport.app
    app.state.uvicorn_server = SimpleNamespace(should_exit=False)
    monkeypatch.setenv("OPENFIC_SHUTDOWN_TOKEN", "owner-token")
    entered = asyncio.Event()
    release = asyncio.Event()
    async def check(_session):
        entered.set()
        await release.wait()
        return False
    monkeypatch.setattr(health, "has_persisted_active_agent_sessions", check)
    headers = {"X-OpenFic-Shutdown-Token": "owner-token"}
    shutdown = asyncio.create_task(client.post("/api/v1/health/shutdown?only_if_idle=true", headers=headers))
    candidate = asyncio.create_task(asyncio.Event().wait())
    try:
        await asyncio.wait_for(entered.wait(), 1)
        with pytest.raises(AgentRunAdmissionClosed):
            await registry.try_register_parent("mobile", candidate)
        with pytest.raises(AgentRunAdmissionClosed):
            await registry.try_register_child("mobile", "child", candidate)
        duplicate = await client.post("/api/v1/health/shutdown?only_if_idle=true", headers=headers)
        assert duplicate.status_code == 409
        with pytest.raises(AgentRunAdmissionClosed):
            await registry.try_register_parent("mobile", candidate)
        release.set()
        assert (await shutdown).status_code == 202
        assert app.state.uvicorn_server.should_exit
        with pytest.raises(AgentRunAdmissionClosed):
            await registry.try_register_parent("mobile", candidate)
    finally:
        release.set()
        shutdown.cancel()
        candidate.cancel()
        await asyncio.gather(shutdown, candidate, return_exceptions=True)


@pytest.mark.asyncio
@pytest.mark.parametrize("outcome", ["busy", "error", "cancel"])
async def test_rejected_idle_shutdown_reopens_admission(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch, registry: AgentRunRegistry, outcome: str,
) -> None:
    app = client._transport.app
    app.state.uvicorn_server = SimpleNamespace(should_exit=False)
    monkeypatch.setenv("OPENFIC_SHUTDOWN_TOKEN", "owner-token")
    entered = asyncio.Event()
    async def check(_session):
        if outcome == "error":
            raise RuntimeError("database unavailable")
        if outcome == "cancel":
            entered.set()
            await asyncio.Event().wait()
        return True
    monkeypatch.setattr(health, "has_persisted_active_agent_sessions", check)
    shutdown = asyncio.create_task(client.post("/api/v1/health/shutdown?only_if_idle=true", headers={"X-OpenFic-Shutdown-Token": "owner-token"}))
    if outcome == "cancel":
        await asyncio.wait_for(entered.wait(), 1)
        shutdown.cancel()
        with pytest.raises(asyncio.CancelledError):
            await shutdown
    elif outcome == "error":
        with pytest.raises(RuntimeError, match="database unavailable"):
            await shutdown
    else:
        assert (await shutdown).status_code == 409
    assert not app.state.uvicorn_server.should_exit
    candidate = asyncio.create_task(asyncio.Event().wait())
    try:
        assert await registry.try_register_parent("retry", candidate)
    finally:
        candidate.cancel()
        await asyncio.gather(candidate, return_exceptions=True)


@pytest.mark.asyncio
@pytest.mark.parametrize("activity", ["parent", "queued", "running", "waiting_user"])
async def test_idle_shutdown_waits_for_persisted_parent_and_child_activity(
    client: AsyncClient, session: AsyncSession, monkeypatch: pytest.MonkeyPatch,
    registry: AgentRunRegistry, activity: str,
) -> None:
    app = client._transport.app
    app.state.uvicorn_server = SimpleNamespace(should_exit=False)
    monkeypatch.setenv("OPENFIC_SHUTDOWN_TOKEN", "owner-token")
    project = await client.post("/api/v1/projects", data={"title": "Idle shutdown"})
    task = Task(project_id=project.json()["id"], title="Waiting agent", mode="agent", agent_session_id="parent", is_running=activity == "parent")
    session.add(task)
    await session.commit()
    if activity != "parent":
        await create_child_run(session, parent_session_id="parent", parent_task_id=task.id,
            parent_thread_id="parent", child_thread_id="child", agent_key="writer",
            dispatch_id="dispatch", tool_call_id="tool", request={"task": "wait"}, status=activity)
    response = await client.post("/api/v1/health/shutdown?only_if_idle=true", headers={"X-OpenFic-Shutdown-Token": "owner-token"})
    assert response.status_code == 409
    assert not app.state.uvicorn_server.should_exit
    assert await registry.try_begin_idle_shutdown()  # Busy check released the gate.
    await registry.cancel_idle_shutdown()
