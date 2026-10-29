import io
import zipfile

import pytest

from app.core.editor_content_limits import validate_editor_content
from app.core.project_import import parse_project_import


@pytest.mark.parametrize("content,expected", [
    ("ordinary story content.", 1),
    ("ordinary story content.\n" * 2105, 2),
    ("字" * 200001, 3),
], ids=["within-limit", "line-limit", "character-limit"])
def test_import_splits_oversized_chapters_without_losing_content(content, expected):
    archive = io.BytesIO()
    with zipfile.ZipFile(archive, "w") as zipped:
        zipped.writestr("chapter.txt", content)
    result = parse_project_import("book.zip", archive.getvalue())
    chapters = result.volumes[0].chapters
    assert len(chapters) == expected
    assert "".join(chapter.content for chapter in chapters) == content.strip()
    for chapter in chapters:
        validate_editor_content(chapter.content)
