from __future__ import annotations

from io import BytesIO
import zipfile

from app.core.document_import import ImportDocument, normalize_document_import


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
