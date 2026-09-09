"""Agent 运行时消息持久化的 CRUD。"""

import json
from collections.abc import Sequence
from datetime import UTC, datetime
from typing import cast

from sqlalchemy import delete, func, or_, select, true
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col

from app.agent_runtime.persistence.errors import (
    PersistenceLoadError,
    PersistenceWriteError,
)
from app.agent_runtime.persistence.model import AgentRunMessage
from app.agent_runtime.persistence.types import (
    PersistedMessage,
    Role,
    Status,
)
from app.core.ids import generate_id


def _row_to_dto(row: AgentRunMessage) -> PersistedMessage:
    """将 ORM 行转换为外部 DTO，反序列化 JSON 字段。"""
    return PersistedMessage(
        id=row.id,
        session_id=row.session_id,
        task_id=row.task_id,
        project_id=row.project_id,
        role=cast(Role, row.role),
        agent_id=row.agent_id,
        content=row.content,
        reasoning=row.reasoning,
        reasoning_duration_ms=row.reasoning_duration_ms,
        tool_calls=json.loads(row.tool_calls) if row.tool_calls else None,
        tool_call_id=row.tool_call_id,
        tool_name=row.tool_name,
        status=cast(Status, row.status),
        message_type=row.message_type or "message",
        display_channel=row.display_channel or "list",
        llm_visibility=row.llm_visibility or "visible",
        seq=row.seq,
        metadata=json.loads(row.message_metadata or "{}"),
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


async def next_seq(session: AsyncSession, session_id: str) -> int:
    """返回该 session 下一个可用 seq；同一 session 内单调递增。"""
    try:
        result = await session.execute(
            select(func.max(col(AgentRunMessage.seq))).where(
                col(AgentRunMessage.session_id) == session_id
            )
        )
        current = result.scalar_one_or_none()
        return 0 if current is None else current + 1
    except SQLAlchemyError as e:
        raise PersistenceLoadError(
            f"next_seq failed for session {session_id}"
        ) from e


async def insert_message(
    session: AsyncSession,
    *,
    session_id: str,
    task_id: str,
    project_id: str,
    role: Role,
    status: Status,
    content: str = "",
    reasoning: str | None = None,
    reasoning_duration_ms: int | None = None,
    tool_calls: list[dict] | None = None,
    tool_call_id: str | None = None,
    tool_name: str | None = None,
    agent_id: str | None = None,
    message_type: str = "message",
    display_channel: str = "list",
    llm_visibility: str = "visible",
    metadata: dict | None = None,
    message_id: str | None = None,
    created_at: datetime | None = None,
) -> PersistedMessage:
    """写入一条消息并 commit；返回 PersistedMessage（含分配的 seq）。"""
    try:
        # 在写入前先把读路径的错误归一化为写错误，避免 PersistenceLoadError 泄露到写 API
        try:
            seq = await next_seq(session, session_id)
        except PersistenceLoadError as e:
            raise PersistenceWriteError(
                f"insert_message failed to allocate seq for session {session_id}"
            ) from e
        now = created_at or datetime.now(UTC)
        row = AgentRunMessage(
            id=message_id or generate_id(),
            session_id=session_id,
            task_id=task_id,
            project_id=project_id,
            role=role,
            agent_id=agent_id,
            content=content,
            reasoning=reasoning,
            reasoning_duration_ms=reasoning_duration_ms,
            tool_calls=json.dumps(tool_calls) if tool_calls is not None else None,
            tool_call_id=tool_call_id,
            tool_name=tool_name,
            status=status,
            message_type=message_type,
            display_channel=display_channel,
            llm_visibility=llm_visibility,
            seq=seq,
            message_metadata=json.dumps(metadata or {}),
            created_at=now,
            updated_at=now,
        )
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return _row_to_dto(row)
    except SQLAlchemyError as e:
        await session.rollback()
        raise PersistenceWriteError(
            f"insert_message failed for session {session_id} role={role}"
        ) from e


async def list_by_session(
    session: AsyncSession, session_id: str
) -> list[PersistedMessage]:
    """按 seq 升序返回该 session 的全部消息。"""
    try:
        result = await session.execute(
            select(AgentRunMessage)
            .where(col(AgentRunMessage.session_id) == session_id)
            .order_by(col(AgentRunMessage.seq).asc())
        )
        rows = result.scalars().all()
        return [_row_to_dto(r) for r in rows]
    except SQLAlchemyError as e:
        raise PersistenceLoadError(
            f"list_by_session failed for session {session_id}"
        ) from e


async def list_session_page(
    session: AsyncSession,
    session_id: str,
    *,
    limit: int,
    before_seq: int | None = None,
) -> tuple[list[PersistedMessage], bool]:
    """Read a bounded window without splitting an adjacent node-end/tool pair.

    Such a pair projects in reverse order, so include one extra message when
    necessary. At most limit + 2 rows are read, including the cursor lookahead.
    """
    if not 1 <= limit <= 200 or (before_seq is not None and before_seq < 0):
        raise ValueError("Invalid message page bounds")
    query = select(AgentRunMessage).where(col(AgentRunMessage.session_id) == session_id)
    if before_seq is not None:
        query = query.where(col(AgentRunMessage.seq) < before_seq)
    try:
        result = await session.execute(query.order_by(col(AgentRunMessage.seq).desc()).limit(limit + 2))
        rows = result.scalars().all()
        count = limit
        if (
            len(rows) > limit
            and rows[limit - 1].role == "tool"
            and rows[limit].message_type == "node_end"
        ):
            count += 1
        return [_row_to_dto(row) for row in reversed(rows[:count])], len(rows) > count
    except SQLAlchemyError as exc:
        raise PersistenceLoadError(f"list_session_page failed for session {session_id}") from exc


async def tool_context_before(
    session: AsyncSession,
    session_id: str,
    *,
    before_seq: int,
    tool_call_ids: set[str],
    internal_agent_ids: set[str],
) -> tuple[dict[str, dict], set[str]]:
    """Fetch only arguments needed by tools whose caller is outside this page.

    JSON is inspected in SQLite, so previous message bodies are never loaded.
    Later callers win if a legacy session reused a tool call id.
    """
    if not tool_call_ids:
        return {}, set()
    calls = func.json_each(AgentRunMessage.tool_calls).table_valued("value")
    call_id = func.json_extract(calls.c.value, "$.id")
    args = func.json_extract(calls.c.value, "$.args")
    query = (
        select(call_id, args, col(AgentRunMessage.agent_id))
        .select_from(AgentRunMessage)
        .join(calls, true())
        .where(
            col(AgentRunMessage.session_id) == session_id,
            col(AgentRunMessage.seq) < before_seq,
            col(AgentRunMessage.role) == "assistant",
            call_id.in_(tool_call_ids),
        )
        .order_by(col(AgentRunMessage.seq).asc())
    )
    result = await session.execute(query)
    arguments: dict[str, dict] = {}
    internal_calls: set[str] = set()
    for identifier, raw_args, agent_id in result:
        if agent_id in internal_agent_ids:
            internal_calls.add(identifier)
        else:
            internal_calls.discard(identifier)
        if isinstance(raw_args, str):
            try:
                parsed = json.loads(raw_args)
            except ValueError:
                continue
            if isinstance(parsed, dict):
                arguments[identifier] = parsed
    return arguments, internal_calls


async def session_has_tool_names(
    session: AsyncSession, session_id: str, tool_names: set[str],
) -> bool:
    """Check projection context without reading historical message bodies."""
    calls = func.json_each(AgentRunMessage.tool_calls).table_valued("value")
    has_call = (
        select(1).select_from(calls)
        .where(func.json_extract(calls.c.value, "$.name").in_(tool_names))
        .correlate(AgentRunMessage).exists()
    )
    result = await session.execute(
        select(col(AgentRunMessage.id))
        .where(
            col(AgentRunMessage.session_id) == session_id,
            or_(col(AgentRunMessage.tool_name).in_(tool_names), has_call),
        ).limit(1)
    )
    return result.scalar_one_or_none() is not None


async def list_by_sessions(
    session: AsyncSession,
    session_ids: Sequence[str],
    *,
    roles: Sequence[str] | None = None,
    tool_names: Sequence[str] | None = None,
) -> dict[str, list[PersistedMessage]]:
    """按 session 批量加载消息，并在内存中按 session 分组。"""
    normalized_ids = list(dict.fromkeys(session_id for session_id in session_ids if session_id))
    normalized_tool_names = list(
        dict.fromkeys(tool_name for tool_name in tool_names or () if tool_name)
    )
    if not normalized_ids:
        return {}
    try:
        query = select(AgentRunMessage).where(
            col(AgentRunMessage.session_id).in_(normalized_ids)
        )
        if roles and normalized_tool_names:
            query = query.where(
                or_(
                    col(AgentRunMessage.role).in_(roles),
                    col(AgentRunMessage.tool_name).in_(normalized_tool_names),
                )
            )
        elif roles:
            query = query.where(col(AgentRunMessage.role).in_(roles))
        elif normalized_tool_names:
            query = query.where(col(AgentRunMessage.tool_name).in_(normalized_tool_names))
        query = query.order_by(
            col(AgentRunMessage.session_id),
            col(AgentRunMessage.seq).asc(),
        )
        result = await session.execute(query)
        messages_by_session: dict[str, list[PersistedMessage]] = {}
        for row in result.scalars().all():
            messages_by_session.setdefault(row.session_id, []).append(_row_to_dto(row))
        return messages_by_session
    except SQLAlchemyError as e:
        raise PersistenceLoadError(
            f"list_by_sessions failed for {len(normalized_ids)} sessions"
        ) from e


async def delete_from_seq(
    session: AsyncSession, session_id: str, seq: int
) -> int:
    """硬删 seq >= 指定值的所有行；返回删除条数。用于业务 revision rollback。"""
    try:
        result = await session.execute(
            delete(AgentRunMessage).where(
                col(AgentRunMessage.session_id) == session_id,
                col(AgentRunMessage.seq) >= seq,
            )
        )
        await session.flush()
        return getattr(result, "rowcount", 0) or 0
    except SQLAlchemyError as e:
        await session.rollback()
        raise PersistenceWriteError(
            f"delete_from_seq failed for session {session_id} seq>={seq}"
        ) from e


async def delete_pending_by_session(
    session: AsyncSession, session_id: str
) -> int:
    """删除该 session 所有 status='pending' 的 user 行；返回删除条数。"""
    try:
        result = await session.execute(
            delete(AgentRunMessage).where(
                col(AgentRunMessage.session_id) == session_id,
                col(AgentRunMessage.role) == "user",
                col(AgentRunMessage.status) == "pending",
            )
        )
        await session.commit()
        return getattr(result, "rowcount", 0) or 0
    except SQLAlchemyError as e:
        await session.rollback()
        raise PersistenceWriteError(
            f"delete_pending_by_session failed for session {session_id}"
        ) from e


async def update_status(
    session: AsyncSession, message_id: str, status: Status
) -> None:
    """更新单条消息的 status + updated_at。"""
    try:
        row = await session.get(AgentRunMessage, message_id)
        if row is None:
            raise PersistenceWriteError(
                f"update_status: message {message_id} not found"
            )
        row.status = status
        row.updated_at = datetime.now(UTC)
        session.add(row)
        await session.commit()
    except PersistenceWriteError:
        await session.rollback()
        raise
    except SQLAlchemyError as e:
        await session.rollback()
        raise PersistenceWriteError(
            f"update_status failed for message {message_id}"
        ) from e


async def update_latest_tool_message_content(
    session: AsyncSession,
    *,
    session_id: str,
    tool_call_id: str,
    content: str,
) -> None:
    try:
        result = await session.execute(
            select(AgentRunMessage)
            .where(
                col(AgentRunMessage.session_id) == session_id,
                col(AgentRunMessage.role) == "tool",
                col(AgentRunMessage.tool_call_id) == tool_call_id,
            )
            .order_by(col(AgentRunMessage.seq).desc())
            .limit(1)
        )
        row = result.scalar_one_or_none()
        if row is None:
            raise PersistenceWriteError(
                f"update_latest_tool_message_content: tool message not found for {tool_call_id}"
            )
        row.content = content
        row.updated_at = datetime.now(UTC)
        session.add(row)
        await session.commit()
    except PersistenceWriteError:
        await session.rollback()
        raise
    except SQLAlchemyError as e:
        await session.rollback()
        raise PersistenceWriteError(
            f"update_latest_tool_message_content failed for tool_call_id {tool_call_id}"
        ) from e


async def delete_by_id(session: AsyncSession, message_id: str) -> bool:
    """按 id 硬删一条；返回是否实际删除。API 层异常回滚 pending 用。"""
    try:
        result = await session.execute(
            delete(AgentRunMessage).where(col(AgentRunMessage.id) == message_id)
        )
        await session.commit()
        return (getattr(result, "rowcount", 0) or 0) > 0
    except SQLAlchemyError as e:
        await session.rollback()
        raise PersistenceWriteError(
            f"delete_by_id failed for message {message_id}"
        ) from e
