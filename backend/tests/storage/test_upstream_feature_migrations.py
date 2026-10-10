"""Upstream migrations must extend, rather than replace, the fork's installed schema."""
from pathlib import Path
import importlib

from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine, inspect, text
from sqlmodel import Session

from app.storage.models.project import Project


def migration_config() -> Config:
    backend = Path(__file__).resolve().parents[2]
    config = Config(str(backend / "alembic.ini"))
    config.set_main_option("script_location", str(backend / "app/storage/migrations"))
    return config


def test_upstream_features_form_one_chain_after_existing_fork_migrations():
    script = ScriptDirectory.from_config(migration_config())
    assert script.get_heads() == ["1030"]
    assert [revision.revision for revision in script.iterate_revisions("1030", "1025")] == [
        "1030", "1029", "1028", "1027", "1026",
    ]
    assert script.get_revision("1025").path.endswith("1025_add_project_references.py")
    assert script.get_revision("1023").path.endswith("1023_add_message_page_index.py")


def test_existing_fork_database_upgrades_and_downgrades_without_losing_references(tmp_path, monkeypatch):
    settings_module = importlib.import_module("app.settings")
    monkeypatch.setattr(settings_module, "BACKEND_DATA_DIR", tmp_path)
    config = migration_config()
    command.upgrade(config, "1025")
    engine = create_engine(f"sqlite:///{tmp_path / 'openfic.db'}")
    try:
        with Session(engine) as session:
            session.add(Project(id="existing", title="Existing project"))
            session.add(Project(id="source", title="Shared source"))
            session.commit()
        with engine.begin() as connection:
            connection.execute(text("INSERT INTO project_references VALUES ('existing', 'source', 'characters')"))
        command.upgrade(config, "head")
        with engine.connect() as connection:
            assert connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one() == "1030"
            assert connection.execute(text("SELECT title FROM projects WHERE id='existing'")).scalar_one() == "Existing project"
            assert connection.execute(text("SELECT * FROM project_references")).one() == ("existing", "source", "characters")
            columns = {col["name"] for col in inspect(connection).get_columns("agent_attachments")}
            assert {"content", "content_length", "line_count"} <= columns
            assert "reasoning_effort" in {col["name"] for col in inspect(connection).get_columns("agent_definitions")}
            assert "credentials_encrypted" in {col["name"] for col in inspect(connection).get_columns("model_providers")}
            assert {"character_relationships", "revision_character_relationship_snapshots", "model_provider_oauth_registrations"} <= set(inspect(connection).get_table_names())
            indexes = inspect(connection).get_indexes("agent_run_messages")
            assert [index["name"] for index in indexes if index["column_names"] == ["session_id", "seq"]] == ["ix_agent_run_messages_session_seq"]
        command.downgrade(config, "1025")
        with engine.connect() as connection:
            assert connection.execute(text("SELECT * FROM project_references")).one() == ("existing", "source", "characters")
            assert "ix_agent_run_messages_session_seq" in {index["name"] for index in inspect(connection).get_indexes("agent_run_messages")}
            assert "model_provider_oauth_registrations" not in inspect(connection).get_table_names()
        command.upgrade(config, "head")
    finally:
        engine.dispose()
