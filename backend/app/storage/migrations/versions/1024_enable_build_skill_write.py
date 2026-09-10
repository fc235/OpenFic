"""Enable skill creation for existing Build definitions."""

import json

from alembic import op
import sqlalchemy as sa

revision = "1024"
down_revision = "1023"
branch_labels = None
depends_on = None


def _update(add: bool) -> None:
    bind = op.get_bind()
    rows = bind.execute(sa.text(
        "SELECT id, enabled_tool_categories FROM agent_definitions WHERE key = 'build'"
    )).fetchall()
    for row in rows:
        categories = json.loads(row.enabled_tool_categories) if isinstance(row.enabled_tool_categories, str) else list(row.enabled_tool_categories)
        categories = [value for value in categories if value != "skill_write"]
        if add:
            categories.append("skill_write")
        bind.execute(sa.text(
            "UPDATE agent_definitions SET enabled_tool_categories = :categories WHERE id = :id"
        ), {"id": row.id, "categories": json.dumps(categories)})


def upgrade() -> None:
    _update(True)


def downgrade() -> None:
    _update(False)
