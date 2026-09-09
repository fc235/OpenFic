"""Index session history for cursor pagination.

Revision ID: 1023
Revises: 1022
"""

from alembic import op

revision = "1023"
down_revision = "1022"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_agent_run_messages_session_seq", "agent_run_messages", ["session_id", "seq"]
    )


def downgrade() -> None:
    op.drop_index("ix_agent_run_messages_session_seq", table_name="agent_run_messages")
