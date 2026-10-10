"""Add per-agent reasoning effort.

Revision ID: 1028
Revises: 1027
"""

from alembic import op
import sqlalchemy as sa


revision = "1028"
down_revision = "1027"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("agent_definitions") as batch_op:
        batch_op.add_column(sa.Column("reasoning_effort", sa.String(length=10), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("agent_definitions") as batch_op:
        batch_op.drop_column("reasoning_effort")
