# Final backend parsing fixes

## Scope

- EPUB archive paths now URL-decode before normalization, permit relative `..`
  segments that remain inside the archive, and reject only paths that normalize
  outside its root.
- Spine entries without readable textual body content (including image-only
  cover/media entries) are skipped. An EPUB still fails when every spine entry
  is unreadable.
- Every uploaded TXT, ZIP, or EPUB must contribute at least one chapter; the
  error identifies the offending filename.
- EPUB3 title mapping reads only `nav` elements marked `toc`; landmarks and
  page lists are ignored. NCX and EPUB3 mappings retain the first same-file
  title, so fragment links cannot replace the main chapter title.
- Merged volume titles are stripped and required to contain 1–200 characters.
- Explicit text `第一卷` headings are retained; only parser-generated defaults
  are replaced by the source filename.
- Document preview validates each chapter with the same 100,000-character
  editor-content limit used by confirmation.

## Tests

The existing two core and two API import test entry points were extended; no
new test functions were added. The focused RED run demonstrated the previous
NCX fragment overwrite (`NCX fragment` rather than `NCX chapter`).

Final verification from `backend`:

```powershell
python -m pytest tests/core/test_document_import.py tests/api/test_import.py -q
ruff check app/core/epub_parser.py app/core/document_import.py app/api/routers/import_router.py tests/core/test_document_import.py tests/api/test_import.py
git diff --check
```

Results: `25 passed`; Ruff reported `All checks passed!`; `git diff --check`
returned successfully.
