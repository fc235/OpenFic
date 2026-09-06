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


def _make_epub_with_spine_entries(
    *,
    opf_path: str,
    entries: dict[str, str],
    manifest: str,
    spine: str,
) -> bytes:
    output = BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr(
            "META-INF/container.xml",
            f"""<?xml version="1.0"?>
            <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
              <rootfiles><rootfile full-path="{opf_path}" /></rootfiles>
            </container>""",
        )
        archive.writestr(
            "OPS/content.opf",
            f"""<?xml version="1.0"?>
            <package xmlns="http://www.idpf.org/2007/opf">
              <metadata><title>Edge Cases</title></metadata>
              <manifest>{manifest}</manifest><spine>{spine}</spine>
            </package>""",
        )
        for path, value in entries.items():
            archive.writestr(path, value)
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

    assert MAX_EPUB_SIZE == 100 * 1024 * 1024
    malformed_content = _make_single_chapter_epub("<html><body><p>Unclosed")
    with pytest.raises(ValueError, match="EPUB XHTML 格式无效"):
        normalize_document_import(
            [ImportDocument("broken.epub", malformed_content)],
            split_mode="auto",
            chunk_size=800,
            structure_mode="separate_volumes",
            merged_volume_title=None,
            chapter_title_mode="preserve",
        )

    namespaced_content = _make_single_chapter_epub(
        """<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>
        <p>Before<nav>Navigation</nav>After</p><script>Ignored script</script>
        <style>Ignored style</style><h1>Heading fallback</h1><p>Visible</p>
        </body></html>""",
    )
    ncx_content = _make_single_chapter_epub(
        "<html><head><title>Fallback chapter</title></head><body><p>Body</p></body></html>",
        opf_extra='<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />',
        spine_attributes='toc="ncx"',
        extra_entries={
            "toc.ncx": """<?xml version=\"1.0\"?>
            <ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\">
              <navMap><navPoint><navLabel><text>NCX chapter</text></navLabel>
              <content src=\"one.xhtml\" /></navPoint>
              <navPoint><navLabel><text>NCX fragment</text></navLabel>
              <content src=\"one.xhtml#part\" /></navPoint></navMap>
            </ncx>""",
        },
    )
    normalized_content = _make_single_chapter_epub(
        "<html><head><title>Normalized</title></head><body><p>Body</p></body></html>",
        prefix="./",
    )
    for content, expected_title, expected_content in [
        (
            namespaced_content,
            "Heading fallback",
            "BeforeAfter\nHeading fallback\nVisible",
        ),
        (ncx_content, "NCX chapter", "Body"),
        (normalized_content, "Normalized", "Body"),
    ]:
        parsed = normalize_document_import(
            [ImportDocument("book.epub", content)],
            split_mode="auto",
            chunk_size=800,
            structure_mode="separate_volumes",
            merged_volume_title=None,
            chapter_title_mode="preserve",
        )
        chapter = parsed.volumes[0].chapters[0]
        assert chapter.title == expected_title
        assert chapter.content == expected_content

    escaped_path_content = _make_epub_with_spine_entries(
        opf_path="OPS/../OPS/content.opf",
        entries={
            "OPS/chapter one.xhtml": "<html><body><p>Decoded path</p></body></html>",
        },
        manifest='<item id="one" href="chapter%20one.xhtml" media-type="application/xhtml+xml" />',
        spine='<itemref idref="one" />',
    )
    percent_member_content = _make_epub_with_spine_entries(
        opf_path="OPS/content.opf",
        entries={
            "OPS/chapter%20one.xhtml": "<html><head><title>Percent member</title></head><body><p>Percent</p></body></html>",
            "OPS/chapter one.xhtml": "<html><head><title>Space member</title></head><body><p>Space</p></body></html>",
        },
        manifest="""
            <item id="percent" href="chapter%2520one.xhtml" media-type="application/xhtml+xml" />
            <item id="space" href="chapter%20one.xhtml" media-type="application/xhtml+xml" />
        """,
        spine='<itemref idref="percent" /><itemref idref="space" />',
    )
    image_and_text_content = _make_epub_with_spine_entries(
        opf_path="OPS/content.opf",
        entries={
            "OPS/cover.xhtml": "<html><body><img src=\"cover.jpg\" /></body></html>",
            "OPS/main.xhtml": "<html><body><p>Readable chapter</p></body></html>",
        },
        manifest="""
            <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml" />
            <item id="main" href="main.xhtml" media-type="application/xhtml+xml" />
        """,
        spine='<itemref idref="cover" /><itemref idref="main" />',
    )
    image_only_content = _make_epub_with_spine_entries(
        opf_path="OPS/content.opf",
        entries={
            "OPS/cover.xhtml": "<html><body><img src=\"cover.jpg\" /></body></html>",
        },
        manifest='<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml" />',
        spine='<itemref idref="cover" />',
    )
    toc_content = _make_epub_with_spine_entries(
        opf_path="OPS/content.opf",
        entries={
            "OPS/one.xhtml": "<html><head><title>HTML title</title></head><body><p>Body</p></body></html>",
            "OPS/nav.xhtml": """
                <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body>
                  <nav epub:type="toc"><a href="one.xhtml">Main TOC title</a><a href="one.xhtml#part">Fragment title</a></nav>
                  <nav epub:type="landmarks"><a href="one.xhtml">Landmark title</a></nav>
                  <nav epub:type="page-list"><a href="one.xhtml">Page title</a></nav>
                </body></html>""",
        },
        manifest="""
            <item id="one" href="one.xhtml" media-type="application/xhtml+xml" />
            <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
        """,
        spine='<itemref idref="one" />',
    )
    for content, expected_title in [
        (escaped_path_content, "chapter one"),
        (image_and_text_content, "main"),
        (toc_content, "Main TOC title"),
    ]:
        parsed = normalize_document_import([ImportDocument("book.epub", content)])
        assert [chapter.title for chapter in parsed.volumes[0].chapters] == [expected_title]
    percent_member_result = normalize_document_import(
        [ImportDocument("book.epub", percent_member_content)]
    )
    assert [chapter.title for chapter in percent_member_result.volumes[0].chapters] == [
        "Percent member",
        "Space member",
    ]

    with pytest.raises(ValueError, match="EPUB 没有可读取的正文"):
        normalize_document_import([ImportDocument("cover.epub", image_only_content)])
    unsafe_encoded_path = _make_epub_with_spine_entries(
        opf_path="OPS/content.opf",
        entries={},
        manifest='<item id="one" href="%2e%2e/%2e%2e/out.xhtml" media-type="application/xhtml+xml" />',
        spine='<itemref idref="one" />',
    )
    with pytest.raises(ValueError, match="EPUB.*文件路径"):
        normalize_document_import([ImportDocument("unsafe.epub", unsafe_encoded_path)])

    explicit_volume = normalize_document_import(
        [ImportDocument("named.txt", "第一卷\n第一章 正文".encode())]
    )
    assert explicit_volume.volumes[0].title == "第一卷"
    with pytest.raises(ValueError, match="images.zip"):
        normalize_document_import(
            [
                ImportDocument("valid.txt", "第一章 正文".encode()),
                ImportDocument("images.zip", _make_zip().replace(b"chapter.txt", b"cover__.png")),
            ]
        )


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
