"""Live chapter reads through explicit project references, without source writes."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col

from app.core.errors import NotFoundError
from app.storage.models.chapter import Chapter
from app.storage.models.volume import Volume
from app.storage.repos import project_repo
from app.storage.services.project_reference_service import resolve_read_project


async def read_chapters(
    session: AsyncSession,
    project_id: str,
    source_id: str,
    *,
    item_id: str | None = None,
    volume_id: str | None = None,
) -> dict:
    await resolve_read_project(session, project_id, source_id, "chapters")
    source = await project_repo.get_by_id(session, source_id)
    if source is None:
        raise NotFoundError("来源项目不存在")

    volume_statement = select(
        col(Volume.id), col(Volume.title), col(Volume.order)
    ).where(col(Volume.project_id) == source_id).order_by(col(Volume.order), col(Volume.id))
    if volume_id is not None:
        volume_statement = volume_statement.where(col(Volume.id) == volume_id)
    volumes = [dict(row) for row in (await session.execute(volume_statement)).mappings()]
    if volume_id is not None and not volumes:
        raise NotFoundError("来源卷不存在")

    # Lists select metadata columns only; even large source books stay out of context.
    columns = [
        col(Chapter.id), col(Chapter.title).label("name"), col(Chapter.order),
        col(Chapter.volume_id), col(Volume.title).label("volume_title"),
        col(Chapter.word_count), col(Chapter.updated_at),
    ]
    if item_id is not None:
        columns.append(col(Chapter.content))
    statement = select(*columns).join(
        Volume, col(Chapter.volume_id) == col(Volume.id)
    ).where(
        col(Chapter.project_id) == source_id, col(Volume.project_id) == source_id
    ).order_by(col(Volume.order), col(Chapter.order), col(Chapter.id))
    if volume_id is not None:
        statement = statement.where(col(Chapter.volume_id) == volume_id)
    if item_id is not None:
        statement = statement.where(col(Chapter.id) == item_id)
    items = [dict(row) for row in (await session.execute(statement)).mappings()]
    if item_id is not None and not items:
        raise NotFoundError("来源章节不存在")
    return {
        "source_project_id": source.id,
        "source_project_title": source.title,
        "readonly": True,
        "volumes": volumes,
        "items": items,
    }
