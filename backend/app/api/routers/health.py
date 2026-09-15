"""Health check and local server lifecycle routes."""

from hmac import compare_digest
from os import getenv

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.health import HealthResponse, MaintenanceResponse
from app.maintenance import maintenance_state
from app.settings import settings
from app.agent_runtime.runner.run_registry import get_agent_run_registry
from app.agent_runtime.session_activity import has_persisted_active_agent_sessions
from app.storage.database import get_session

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns the current health status and version of the API.
    """
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
    )


@router.get("/maintenance", response_model=MaintenanceResponse)
async def maintenance_check() -> MaintenanceResponse:
    """Return the local database maintenance state."""
    snapshot = maintenance_state.snapshot()
    return MaintenanceResponse(**snapshot.__dict__)


@router.post("/shutdown", status_code=status.HTTP_202_ACCEPTED)
async def request_shutdown(
    request: Request,
    shutdown_token: str | None = Header(default=None, alias="X-OpenFic-Shutdown-Token"),
    only_if_idle: bool = False,
    session: AsyncSession = Depends(get_session),
) -> None:
    """Request a graceful shutdown from the desktop process that owns this server."""
    expected_token = getenv("OPENFIC_SHUTDOWN_TOKEN")
    if (
        not expected_token
        or shutdown_token is None
        or not compare_digest(shutdown_token, expected_token)
    ):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    server = getattr(request.app.state, "uvicorn_server", None)
    if server is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
    if not only_if_idle:
        server.should_exit = True
        return

    registry = get_agent_run_registry()
    if not await registry.try_begin_idle_shutdown():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="后台任务仍在运行")
    try:
        if await has_persisted_active_agent_sessions(session):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="后台任务仍在运行")
        server.should_exit = True
    except BaseException:
        # Cancellation/error must not leave a still-serving process closed to runs.
        await registry.cancel_idle_shutdown()
        raise
