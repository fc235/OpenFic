from __future__ import annotations

from io import BytesIO
import zipfile

import pytest

from app.core.document_import import ImportDocument, normalize_document_import
from app.core.epub_parser import MAX_EPUB_SIZE


def _make_epub() -> bytes:
    output = BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr(
            "META-INF/container.xml",
            """<?xml version=\"1.0\"?>
            <container xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">
              <rootfiles>
                <rootfile full-path=\"OPS/content.opf\" media-type=\"application/oebps-package+xml\" />
              </rootfiles>
            </container>""",
        )
        archive.writestr(
            "OPS/content.opf",
            """<?xml version=\"1.0\"?>
            <package xmlns=\"http://www.idpf.org/2007/opf\">
              <metadata><title>Spine Book</title></metadata>
              <manifest>
                <item id=\"one\" href=\"one.xhtml\" media-type=\"application/xhtml+xml\" />
                <item id=\"two\" href=\"two.xhtml\" media-type=\"application/xhtml+xml\" />
              </manifest>
              <spine><itemref idref=\"one\" /><itemref idref=\"two\" /></spine>
            </package>""",
        )
        # ZIP member order intentionally differs from reading order in the OPF spine.
        archive.writestr(
            "OPS/two.xhtml",
            "<html><head><title>Spine Two</title></head><body><p>Second.</p></body></html>",
        )
        archive.writestr(
            "OPS/one.xhtml",
            "<html><head><title>Spine One</title></head><body><p>First.</p></body></html>",
        )
    return output.getvalue()


def _make_zip() -> bytes:
    output = BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr("zip-volume/chapter.txt", "ZIP content")
    return output.getvalue()


def _make_single_chapter_epub(
    chapter: str,
    *,
    opf_extra: str = "",
    spine_attributes: str = "",
    extra_entries: dict[str, str] | None = None,
    prefix: str = "",
) -> bytes:
    output = BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr(
            f"{prefix}META-INF/container.xml",
            f"""<?xml version=\"1.0\"?>
            <container xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">
              <rootfiles>
                <rootfile full-path=\"{prefix}OPS/content.opf\" media-type=\"application/oebps-package+xml\" />
              </rootfiles>
            </container>""",
        )
        archive.writestr(
            f"{prefix}OPS/content.opf",
            f"""<?xml version=\"1.0\"?>
            <package xmlns=\"http://www.idpf.org/2007/opf\">
              <metadata><title>Fallback title</title></metadata>
              <manifest>
                <item id=\"one\" href=\"one.xhtml\" media-type=\"application/xhtml+xml\" />
                {opf_extra}
              </manifest>
              <spine {spine_attributes}><itemref idref=\"one\" /></spine>
            </package>""",
        )
        archive.writestr(f"{prefix}OPS/one.xhtml", chapter)
        for path, entry in (extra_entries or {}).items():
            archive.writestr(f"{prefix}OPS/{path}", entry)
    return output.getvalue()


def test_normalize_ordered_txt_zip_epub_documents() -> None:
    result = normalize_document_import(
        [
            ImportDocument("first.txt", "第一章 A".encode()),
            ImportDocument("archive.zip", _make_zip()),
            ImportDocument("book.epub", _make_epub()),
        ],
        split_mode="auto",
        chunk_size=800,
        structure_mode="separate_volumes",
        merged_volume_title=None,
        chapter_title_mode="preserve",
    )

    assert [volume.title for volume in result.volumes][:2] == ["first", "zip-volume"]
    assert [chapter.title for chapter in result.volumes[-1].chapters] == [
        "Spine One",
        "Spine Two",
    ]


def test_normalize_merged_documents_uses_continuous_chapter_numbering() -> None:
    result = normalize_document_import(
        [
            ImportDocument("rain.txt", "第十章 雨夜".encode()),
            ImportDocument("return.txt", "归途".encode()),
        ],
        split_mode="auto",
        chunk_size=800,
        structure_mode="merge_volume",
        merged_volume_title="合集",
        chapter_title_mode="continuous_numbering",
    )

    assert [volume.title for volume in result.volumes] == ["合集"]
    assert [chapter.title for chapter in result.volumes[0].chapters] == [
        "第 1 章 雨夜",
        "第 2 章 归途",
    ]


def test_epub_declared_size_limit_is_100_mebibytes() -> None:
    assert MAX_EPUB_SIZE == 100 * 1024 * 1024


def test_epub_rejects_malformed_xhtml() -> None:
    content = _make_single_chapter_epub("<html><body><p>Unclosed")

    with pytest.raises(ValueError, match="EPUB XHTML 格式无效"):
        normalize_document_import(
            [ImportDocument("broken.epub", content)],
            split_mode="auto",
            chunk_size=800,
            structure_mode="separate_volumes",
            merged_volume_title=None,
            chapter_title_mode="preserve",
        )


def test_epub2_ncx_title_overrides_xhtml_title() -> None:
    content = _make_single_chapter_epub(
        "<html><head><title>Fallback chapter</title></head><body><p>Body</p></body></html>",
        opf_extra='<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />',
        spine_attributes='toc="ncx"',
        extra_entries={
            "toc.ncx": """<?xml version=\"1.0\"?>
            <ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\">
              <navMap><navPoint><navLabel><text>NCX chapter</text></navLabel>
              <content src=\"one.xhtml\" /></navPoint></navMap>
            </ncx>""",
        },
    )

    result = normalize_document_import(
        [ImportDocument("book.epub", content)],
        split_mode="auto",
        chunk_size=800,
        structure_mode="separate_volumes",
        merged_volume_title=None,
        chapter_title_mode="preserve",
    )

    assert result.volumes[0].chapters[0].title == "NCX chapter"


def test_epub_reads_members_with_normalized_archive_paths() -> None:
    content = _make_single_chapter_epub(
        "<html><head><title>Normalized</title></head><body><p>Body</p></body></html>",
        prefix="./",
    )

    result = normalize_document_import(
        [ImportDocument("book.epub", content)],
        split_mode="auto",
        chunk_size=800,
        structure_mode="separate_volumes",
        merged_volume_title=None,
        chapter_title_mode="preserve",
    )

    assert result.volumes[0].chapters[0].title == "Normalized"
