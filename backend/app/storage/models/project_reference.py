"""Explicit, non-transitive references to another project's local material."""

from sqlalchemy import Column, ForeignKey, String
from sqlmodel import Field, SQLModel


class ProjectReference(SQLModel, table=True):
    __tablename__ = "project_references"
    project_id: str = Field(sa_column=Column(String, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True))
    source_project_id: str = Field(sa_column=Column(String, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True, index=True))
    resource: str = Field(primary_key=True)
