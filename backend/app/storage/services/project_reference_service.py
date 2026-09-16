"""Read shared material without granting write access to its source."""

from typing import Literal

from sqlalchemy import delete, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col

from app.core.errors import NotFoundError, ValidationError
from app.storage.models.project import Project
from app.storage.models.project_reference import ProjectReference
from app.storage.models.character import Character
from app.storage.models.world_info_entry import WorldInfoEntry
from app.storage.repos import character_repo, project_repo, world_info_repo, world_info_entry_repo

Resource = Literal["characters", "worldInfo", "chapters"]


async def delete_project_links(session: AsyncSession, project_id: str) -> None:
    await session.execute(delete(ProjectReference).where(or_(
        col(ProjectReference.project_id) == project_id,
        col(ProjectReference.source_project_id) == project_id,
    )))


async def list_sources(session: AsyncSession, project_id: str, resource: Resource):
    result = await session.execute(select(Project).join(
        ProjectReference, col(Project.id) == col(ProjectReference.source_project_id)
    ).where(col(ProjectReference.project_id) == project_id, col(ProjectReference.resource) == resource).order_by(col(Project.title), col(Project.id)))
    return list(result.scalars().all())


async def reference_info(session: AsyncSession, project_id: str, resource: Resource):
    if await project_repo.get_by_id(session, project_id) is None:
        raise NotFoundError("项目不存在")
    sources = await list_sources(session, project_id, resource)
    result = await session.execute(select(Project).join(
        ProjectReference, col(Project.id) == col(ProjectReference.project_id)
    ).where(col(ProjectReference.source_project_id) == project_id, col(ProjectReference.resource) == resource).order_by(col(Project.title), col(Project.id)))
    return {"sources": [{"id": p.id, "title": p.title} for p in sources],
            "used_by": [{"id": p.id, "title": p.title} for p in result.scalars().all()]}


async def replace_sources(session: AsyncSession, project_id: str, resource: Resource, source_ids: list[str]):
    await reference_info(session, project_id, resource)
    ids = list(dict.fromkeys(source_ids))
    if project_id in ids:
        raise ValidationError("不能引用项目自身")
    if ids:
        result = await session.execute(select(col(Project.id)).where(col(Project.id).in_(ids)))
        existing = set(result.scalars().all())
        missing = next((source_id for source_id in ids if source_id not in existing), None)
        if missing is not None:
            raise NotFoundError(f"来源项目不存在: {missing}")
    await session.execute(delete(ProjectReference).where(
        col(ProjectReference.project_id) == project_id, col(ProjectReference.resource) == resource))
    for source_id in ids:
        session.add(ProjectReference(project_id=project_id, source_project_id=source_id, resource=resource))
    await session.flush()
    return await reference_info(session, project_id, resource)


async def resolve_read_project(session: AsyncSession, project_id: str, source_id: str | None, resource: Resource) -> str:
    if source_id is None or source_id == project_id:
        return project_id
    if source_id not in {p.id for p in await list_sources(session, project_id, resource)}:
        raise NotFoundError("该项目未引用此来源资料")
    return source_id


async def read_shared_material(session: AsyncSession, project_id: str, source_id: str, resource: Resource, *, brief: bool = False, item_id: str | None = None, volume_id: str | None = None):
    if resource == "chapters":
        from app.storage.services.project_chapter_reference_service import read_chapters

        return await read_chapters(session, project_id, source_id, item_id=item_id, volume_id=volume_id)
    await resolve_read_project(session, project_id, source_id, resource)
    if brief or item_id is not None:
        if resource == "characters":
            model, content_column = Character, col(Character.description)
            condition = col(Character.project_id) == source_id
        else:
            world = await world_info_repo.get_by_project_id(session, source_id)
            if world is None:
                if item_id is not None:
                    raise NotFoundError("共享资料不存在")
                return {"items": []}
            model, content_column = WorldInfoEntry, col(WorldInfoEntry.content)
            condition = (col(WorldInfoEntry.world_info_id) == world.id) & col(WorldInfoEntry.is_enabled).is_(True)
        columns = [col(model.id), col(model.name)] if brief else [col(model.id), col(model.name), content_column.label("content")]
        statement = select(*columns).where(condition).order_by(col(model.name), col(model.id))
        if item_id is not None:
            statement = statement.where(col(model.id) == item_id)
        result = await session.execute(statement)
        items = [dict(row) for row in result.mappings().all()]
        if item_id is not None and not items:
            raise NotFoundError("共享资料不存在")
        return {"items": items}
    if resource == "characters":
        records = await character_repo.list_all_by_project(session, source_id)
        return {"items": [{"id": r.id, "name": r.name, "content": r.description} for r in records]}
    world = await world_info_repo.get_by_project_id(session, source_id)
    records = await world_info_entry_repo.list_enabled_by_world_info(session, world.id) if world else []
    return {"items": [{"id": r.id, "name": r.name, "content": r.content} for r in records]}
