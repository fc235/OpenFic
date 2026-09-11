from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.agent_settings_lock import require_agent_settings_unlocked
from app.core.errors import NotFoundError, ValidationError
from app.storage.database import get_session
from app.storage.services import project_reference_service as service

router = APIRouter()
Session = Annotated[AsyncSession, Depends(get_session)]


class ReferenceInput(BaseModel):
    source_project_ids: list[str] = Field(max_length=100)


@router.get("/{project_id}/references/{resource}")
async def get_references(project_id: str, resource: service.Resource, session: Session):
    try:
        return await service.reference_info(session, project_id, resource)
    except NotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc


@router.put("/{project_id}/references/{resource}")
async def set_references(project_id: str, resource: service.Resource, data: ReferenceInput, session: Session):
    await require_agent_settings_unlocked(session)
    try:
        return await service.replace_sources(session, project_id, resource, data.source_project_ids)
    except NotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.get("/{project_id}/references/{resource}/{source_id}")
async def get_material(project_id: str, resource: service.Resource, source_id: str, session: Session, brief: bool = False, item_id: str | None = None):
    try:
        return await service.read_shared_material(session, project_id, source_id, resource, brief=brief, item_id=item_id)
    except NotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
