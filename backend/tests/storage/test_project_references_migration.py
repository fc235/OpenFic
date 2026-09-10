import importlib

import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations


def test_reference_migration_cascades_and_preserves_projects(monkeypatch):
    migration = importlib.import_module("app.storage.migrations.versions.1025_add_project_references")
    with sa.create_engine("sqlite://").begin() as connection:
        connection.execute(sa.text("PRAGMA foreign_keys=ON"))
        connection.execute(sa.text("CREATE TABLE projects (id TEXT PRIMARY KEY)"))
        connection.execute(sa.text("INSERT INTO projects VALUES ('a'), ('b')"))
        monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(connection)))
        migration.upgrade()
        connection.execute(sa.text("INSERT INTO project_references VALUES ('a', 'b', 'characters')"))
        connection.execute(sa.text("DELETE FROM projects WHERE id='b'"))
        assert connection.execute(sa.text("SELECT count(*) FROM project_references")).scalar_one() == 0
        migration.downgrade()
        assert connection.execute(sa.text("SELECT id FROM projects")).scalar_one() == "a"
