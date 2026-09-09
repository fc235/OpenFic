"""Cursor paging must use the session/sequence index, including upgraded databases."""

import importlib

from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine, text

from app.agent_runtime.persistence.model import AgentRunMessage


def test_model_declares_session_sequence_index():
    assert any(
        [column.name for column in index.columns] == ["session_id", "seq"]
        for index in AgentRunMessage.__table__.indexes
    )


def test_migration_preserves_rows_and_eliminates_page_sort():
    migration = importlib.import_module(
        "app.storage.migrations.versions.1023_add_message_page_index"
    )
    engine = create_engine("sqlite:///:memory:")
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE agent_run_messages (id TEXT, session_id TEXT, seq INTEGER)"))
        connection.execute(text("INSERT INTO agent_run_messages VALUES ('message', 'session', 1)"))
        with Operations.context(MigrationContext.configure(connection)):
            migration.upgrade()
            plan = connection.execute(text(
                "EXPLAIN QUERY PLAN SELECT * FROM agent_run_messages "
                "WHERE session_id = 'session' AND seq < 100 ORDER BY seq DESC LIMIT 101"
            )).all()
            details = " ".join(row[3] for row in plan)
            assert "ix_agent_run_messages_session_seq" in details
            assert "TEMP B-TREE" not in details
            migration.downgrade()
        assert connection.execute(text("SELECT id FROM agent_run_messages")).scalar_one() == "message"
    engine.dispose()
