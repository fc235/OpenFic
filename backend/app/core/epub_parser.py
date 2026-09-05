"""Bounded, spine-ordered EPUB parsing."""

from __future__ import annotations

from io import BytesIO
from pathlib import PurePosixPath
import posixpath
import zipfile

from lxml import etree

from app.core.txt_parser import ParseResult, ParsedChapter, ParsedVolume, _count_words

MAX_EPUB_SIZE = 100 * 1024 * 1024
XML_PARSER = etree.XMLParser(
    resolve_entities=False,
    no_network=True,
    huge_tree=False,
    recover=False,
)
_BLOCK_TAGS = frozenset({"p", "div", "li", "h1", "h2", "h3", "h4", "h5", "h6", "br"})


def parse_epub_content(filename: str, content: bytes) -> ParseResult:
    """Parse a non-encrypted EPUB in its OPF spine order."""
    try:
        with zipfile.ZipFile(BytesIO(content)) as archive:
            members = _archive_members(archive)
            _reject_encrypted_content(archive, members)
            container = _read_xml(archive, members, "META-INF/container.xml", "EPUB 缺少容器文件")
            opf_path = _container_opf_path(container)
            package = _read_xml(archive, members, opf_path, "EPUB 缺少包定义文件")
            manifest = _manifest_paths(package, opf_path)
            spine = _spine_item_ids(package)
            toc_titles = _toc_titles(archive, members, package, manifest)
            chapters = [
                _parse_spine_chapter(
                    archive,
                    members,
                    manifest,
                    item_id,
                    toc_titles,
                )
                for item_id in spine
            ]
    except (zipfile.BadZipFile, zipfile.LargeZipFile, RuntimeError, OSError) as exc:
        raise ValueError("EPUB 无法读取，请确认文件没有损坏或加密") from exc

    if not chapters:
        raise ValueError("EPUB 没有可读取的正文")

    book_title = _first_text(package.xpath("//*[local-name()='metadata']/*[local-name()='title'][1]/text()"))
    return ParseResult(
        volumes=[ParsedVolume(title=book_title or _file_stem(filename), chapters=chapters)],
        total_word_count=sum(chapter.word_count for chapter in chapters),
        chapter_count=len(chapters),
        detected_encoding="utf-8",
    )


def _archive_members(archive: zipfile.ZipFile) -> dict[str, zipfile.ZipInfo]:
    total_size = 0
    members: dict[str, zipfile.ZipInfo] = {}
    for info in archive.infolist():
        normalized = _normalize_archive_path(info.filename)
        total_size += max(info.file_size, 0)
        if total_size > MAX_EPUB_SIZE:
            raise ValueError("EPUB 解压后的总大小超过限制（最大 100MB）")
        if not info.is_dir():
            if normalized in members:
                raise ValueError("EPUB 包含重复的文件路径")
            members[normalized] = info
    return members


def _reject_encrypted_content(
    archive: zipfile.ZipFile,
    members: dict[str, zipfile.ZipInfo],
) -> None:
    encryption_path = "META-INF/encryption.xml"
    if encryption_path not in members:
        return
    encryption = _read_xml(archive, members, encryption_path, "EPUB 加密信息无法读取")
    if encryption.xpath("//*[local-name()='EncryptedData']"):
        raise ValueError("不支持加密的 EPUB 文件")


def _read_xml(
    archive: zipfile.ZipFile,
    members: dict[str, zipfile.ZipInfo],
    path: str,
    missing_message: str,
) -> etree._Element:
    member = members.get(path)
    if member is None:
        raise ValueError(missing_message)
    try:
        return etree.fromstring(archive.read(member), parser=XML_PARSER)
    except (etree.XMLSyntaxError, ValueError, KeyError) as exc:
        raise ValueError("EPUB XML 格式无效") from exc
    except (RuntimeError, OSError, zipfile.BadZipFile) as exc:
        raise ValueError("EPUB 资源无法读取") from exc


def _container_opf_path(container: etree._Element) -> str:
    paths = container.xpath("//*[local-name()='rootfile']/@full-path")
    if not paths:
        raise ValueError("EPUB 缺少包定义路径")
    return _normalize_archive_path(paths[0])


def _manifest_paths(package: etree._Element, opf_path: str) -> dict[str, tuple[str, etree._Element]]:
    base_path = posixpath.dirname(opf_path)
    manifest: dict[str, tuple[str, etree._Element]] = {}
    for item in package.xpath("//*[local-name()='manifest']/*[local-name()='item']"):
        item_id = item.get("id")
        href = item.get("href")
        if item_id and href:
            manifest[item_id] = (_resolve_path(base_path, href), item)
    if not manifest:
        raise ValueError("EPUB 缺少资源清单")
    return manifest


def _spine_item_ids(package: etree._Element) -> list[str]:
    spine = package.xpath("//*[local-name()='spine']")
    if not spine:
        raise ValueError("EPUB 缺少阅读顺序")
    item_ids = [
        item.get("idref")
        for item in spine[0].xpath("./*[local-name()='itemref']")
        if item.get("linear", "yes") != "no" and item.get("idref")
    ]
    if not item_ids:
        raise ValueError("EPUB 缺少可读取的阅读顺序")
    return item_ids


def _toc_titles(
    archive: zipfile.ZipFile,
    members: dict[str, zipfile.ZipInfo],
    package: etree._Element,
    manifest: dict[str, tuple[str, etree._Element]],
) -> dict[str, str]:
    nav_items = [
        (path, item)
        for path, item in manifest.values()
        if "nav" in item.get("properties", "").split()
    ]
    spine = package.xpath("//*[local-name()='spine'][1]")
    if spine and spine[0].get("toc") in manifest:
        nav_items.append(manifest[spine[0].get("toc")])

    titles: dict[str, str] = {}
    for nav_path, item in nav_items:
        if nav_path not in members:
            continue
        document = _read_xml(archive, members, nav_path, "EPUB 目录文件无法读取")
        base_path = posixpath.dirname(nav_path)
        if item.get("media-type") == "application/x-dtbncx+xml":
            for nav_point in document.xpath("//*[local-name()='navPoint']"):
                sources = nav_point.xpath("./*[local-name()='content'][1]/@src")
                title = _first_text(
                    nav_point.xpath(
                        "./*[local-name()='navLabel']/*[local-name()='text']//text()"
                    )
                )
                if sources and title:
                    titles[_resolve_path(base_path, sources[0])] = title
            continue
        for link in document.xpath("//*[local-name()='a'][@href]"):
            target = _resolve_path(base_path, link.get("href"))
            title = " ".join(link.itertext()).strip()
            if title:
                titles[target] = title
    return titles


def _parse_spine_chapter(
    archive: zipfile.ZipFile,
    members: dict[str, zipfile.ZipInfo],
    manifest: dict[str, tuple[str, etree._Element]],
    item_id: str,
    toc_titles: dict[str, str],
) -> ParsedChapter:
    if item_id not in manifest:
        raise ValueError("EPUB 阅读顺序引用了缺失资源")
    path, _item = manifest[item_id]
    member = members.get(path)
    if member is None:
        raise ValueError("EPUB 阅读顺序资源不存在")
    try:
        document = etree.fromstring(archive.read(member), parser=XML_PARSER)
    except (etree.XMLSyntaxError, ValueError, KeyError) as exc:
        raise ValueError("EPUB XHTML 格式无效") from exc
    except (RuntimeError, OSError, zipfile.BadZipFile) as exc:
        raise ValueError("EPUB 资源无法读取") from exc
    bodies = document.xpath("//*[local-name()='body']")
    if not bodies:
        raise ValueError("EPUB 章节缺少正文")
    body = bodies[0]
    for element in body.xpath(".//*[self::script or self::style or self::nav]"):
        element.drop_tree()
    content = _body_text(body)
    if not content:
        raise ValueError("EPUB 章节没有可读取的正文")
    title = (
        toc_titles.get(path)
        or _first_text(document.xpath("//*[local-name()='title']/text()"))
        or _first_text(body.xpath(".//*[self::h1 or self::h2 or self::h3][1]//text()"))
        or PurePosixPath(path).stem
    )
    return ParsedChapter(title=title, content=content, word_count=_count_words(content))


def _body_text(body: etree._Element) -> str:
    for element in body.iter():
        if (
            isinstance(element.tag, str)
            and etree.QName(element).localname.lower() in _BLOCK_TAGS
        ):
            element.tail = f"\n{element.tail or ''}"
    text = "".join(body.itertext())
    return "\n".join(
        " ".join(line.split()) for line in text.splitlines() if line.strip()
    )


def _resolve_path(base_path: str, href: str) -> str:
    href_path = href.split("#", 1)[0]
    return _normalize_archive_path(posixpath.join(base_path, href_path))


def _normalize_archive_path(path: str) -> str:
    normalized = path.replace("\\", "/")
    pure_path = PurePosixPath(normalized)
    if pure_path.is_absolute() or ".." in pure_path.parts:
        raise ValueError("EPUB 包含不安全的文件路径")
    parts = [part for part in pure_path.parts if part not in {"", "."}]
    if not parts:
        raise ValueError("EPUB 包含无效的文件路径")
    return "/".join(parts)


def _first_text(values: list[str]) -> str:
    return " ".join(value.strip() for value in values if value.strip()).strip()


def _file_stem(filename: str) -> str:
    return PurePosixPath(filename.replace("\\", "/")).stem or "第一卷"
