"""Synchronization must remain upgradeable from installed fork databases."""

from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory


def test_new_upstream_migrations_extend_the_installed_fork_chain():
    backend = Path(__file__).resolve().parents[2]
    config = Config(str(backend / "alembic.ini"))
    config.set_main_option("script_location", str(backend / "app/storage/migrations"))
    scripts = ScriptDirectory.from_config(config)

    assert scripts.get_heads() == ["1033"]
    assert [step.revision for step in scripts.iterate_revisions("head", "1030")] == [
        "1033", "1032", "1031",
    ]
    for revision, filename in {
        "1023": "1023_add_message_page_index.py",
        "1025": "1025_add_project_references.py",
        "1027": "1027_character_relationships.py",
        "1028": "1028_add_agent_definition_reasoning_effort.py",
        "1029": "1029_add_model_provider_oauth.py",
    }.items():
        assert Path(scripts.get_revision(revision).path).name == filename
