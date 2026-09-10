"""Add explicit project reference links."""

from alembic import op
import sqlalchemy as sa

revision = "1025"
down_revision = "1024"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("project_references",
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("source_project_id", sa.String(), sa.ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("resource", sa.String(), primary_key=True),
    )
    op.create_index("ix_project_references_source_project_id", "project_references", ["source_project_id"])


def downgrade():
    op.drop_table("project_references")
