# Multi-Document Chapter Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users order and import multiple TXT, Markdown, ZIP, or EPUB files when creating a project or adding new volumes to an existing project.

**Architecture:** A pure backend parser converts every ordered upload into the existing `ParseResult`/`ParsedVolume` model, then normalizes separate-volume or merged-volume output. New multipart endpoints reuse that parser; project creation delegates to the existing import service, while existing-project import uses one transaction to shift volume positions, insert all rows, record activity, and update project totals. Shared React components own ordered-file and import-option UI, while the two dialogs keep destination-specific fields.

**Tech Stack:** Python 3.12+, FastAPI, SQLModel/SQLAlchemy, `zipfile`, `lxml`, pytest; React 19, TypeScript, Radix UI, dnd-kit, TanStack Query, i18next.

## Global Constraints

- Support only `.txt`, `.md`, `.zip`, and `.epub`; DOCX and PDF remain unsupported.
- Accept at most 100 files, 50 MB per file, 100 MB uploaded in total, and 100 MB declared uncompressed archive content in total.
- Preserve the existing single-file TXT/Markdown/ZIP endpoints and behavior.
- Existing-project imports only create new volumes; placement is project end or immediately after the captured current volume.
- Merged imports either preserve parsed titles or rename them to `第 N 章 原标题`, removing any old chapter-number prefix first.
- EPUB imports follow package spine order, omit media and styling, reject invalid/encrypted books, and never resolve network resources or external XML entities.
- Keep automated coverage to four focused backend tests plus static frontend checks.

---

## File Structure

- Create `backend/app/core/document_import.py`: ordered-upload normalization, merged-volume logic, and continuous title numbering.
- Create `backend/app/core/epub_parser.py`: bounded EPUB container/OPF/spine/XHTML parsing into `ParseResult`.
- Modify `backend/app/core/project_import.py`: recognize EPUB and delegate to `epub_parser` while preserving old formats.
- Modify `backend/app/api/schemas/import_schema.py`: response fields and import option literals shared by both destinations.
- Modify `backend/app/api/routers/import_router.py`: multi-document preview and new-project confirmation endpoints.
- Create `backend/app/storage/services/project_chapter_import_service.py`: atomic import into an existing project.
- Modify `backend/app/storage/repos/volume_repo.py`: collision-safe range shift used before multi-volume insertion.
- Modify `backend/app/api/routers/chapters.py`: existing-project preview and confirmation endpoints.
- Modify `backend/pyproject.toml` and `backend/uv.lock`: declare `lxml` directly.
- Create `backend/tests/core/test_document_import.py`: two pure parser tests and an in-memory EPUB fixture builder.
- Modify `backend/tests/api/test_import.py`: two end-to-end transaction tests.
- Modify `frontend/src/features/projects/lib/import-api.ts`: ordered multipart request types and functions.
- Create `frontend/src/features/projects/components/import-file-list.tsx`: reusable file add/remove/reorder UI.
- Create `frontend/src/features/projects/components/import-document-options.tsx`: shared split/structure/title options.
- Modify `frontend/src/features/projects/components/import-dialog.tsx`: multi-file new-project workflow.
- Create `frontend/src/features/writing/components/chapter-import-dialog.tsx`: existing-project destination workflow.
- Modify `frontend/src/features/writing/components/sidebar-toolbar.tsx` and `chapter-sidebar.tsx`: entry point and current-volume capture.
- Modify `frontend/src/i18n/locales/en.json` and `zh-CN.json`: new labels, validation, progress, and results.
- Modify `docs/develop/feature-map.md`: record both import entry points and backend owners.

---

### Task 1: Ordered document parsing and EPUB support

**Files:**
- Create: `backend/app/core/document_import.py`
- Create: `backend/app/core/epub_parser.py`
- Modify: `backend/app/core/project_import.py`
- Modify: `backend/pyproject.toml`
- Modify: `backend/uv.lock`
- Test: `backend/tests/core/test_document_import.py`

**Interfaces:**
- Produces `ImportDocument(filename: str, content: bytes)`.
- Produces `normalize_document_import(documents, split_mode, chunk_size, structure_mode, merged_volume_title, chapter_title_mode) -> ParseResult`.
- Extends `parse_project_import()` to accept `.epub`.

- [ ] **Step 1: Write the failing ordered parser test**

Add an in-memory EPUB helper containing `META-INF/container.xml`, `content.opf`, and two XHTML spine items in an order different from ZIP member order. Call the wished-for pure interface and expect volumes in submitted-file order and EPUB chapters in spine order:

```python
result = normalize_document_import(
    [
        ImportDocument("first.txt", "第一章 A".encode()),
        ImportDocument("archive.zip", zip_bytes),
        ImportDocument("book.epub", epub_bytes),
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
python -m pytest tests/core/test_document_import.py::test_normalize_ordered_txt_zip_epub_documents -q
```

Expected: collection fails because `app.core.document_import` does not exist.

- [ ] **Step 3: Implement bounded EPUB parsing**

Use `zipfile` to validate the archive and total declared member size. Parse XML with an `lxml.etree.XMLParser(resolve_entities=False, no_network=True, huge_tree=False, recover=False)`. Resolve the OPF path from `container.xml`, map manifest IDs to normalized archive paths, then iterate linear spine entries. Parse each XHTML body with `lxml.html`, remove script/style/nav elements, derive title from TOC mapping, `<title>`, first heading, or filename, and convert block boundaries to newlines. Return:

```python
ParseResult(
    volumes=[ParsedVolume(title=book_title or file_stem, chapters=chapters)],
    total_word_count=sum(chapter.word_count for chapter in chapters),
    chapter_count=len(chapters),
    detected_encoding="utf-8",
)
```

Reject missing container/package/spine, unsafe paths, encrypted entries from `META-INF/encryption.xml`, no readable body, and malformed XML with stable `ValueError` messages.

- [ ] **Step 4: Implement ordered normalization**

Define exact literals and model:

```python
ImportStructureMode = Literal["separate_volumes", "merge_volume"]
ChapterTitleMode = Literal["preserve", "continuous_numbering"]

@dataclass(frozen=True)
class ImportDocument:
    filename: str
    content: bytes
```

For each document call `parse_project_import`; when a text file returns only the parser's default `第一卷`, replace that volume title with the file stem. Separate mode concatenates volume lists. Merge mode initially flattens chapters into one `ParsedVolume` while preserving titles; continuous numbering is added only after its failing test in Step 7.

- [ ] **Step 5: Declare and lock the direct XML dependency**

Add `lxml>=6.0.0` to `[project].dependencies` and run:

```powershell
uv lock
```

Do not add EbookLib (AGPL) or EPUBLib (Python 3.13 minimum).

- [ ] **Step 6: Run the parser test and verify GREEN**

Run the same pytest node. Expected: `1 passed`.

- [ ] **Step 7: Write the failing merged-numbering parser test**

Call `normalize_document_import` with two text documents containing `第十章 雨夜` and `归途`, merge title `合集`, and `chapter_title_mode="continuous_numbering"`. Assert one volume and titles `第 1 章 雨夜`, `第 2 章 归途`. Run it and verify RED because the prefix normalization is incomplete, then implement only the required Chinese/Arabic chapter-prefix removal and rerun to GREEN.

- [ ] **Step 8: Commit the parser slice**

```powershell
git add backend/app/core/document_import.py backend/app/core/epub_parser.py backend/app/core/project_import.py backend/pyproject.toml backend/uv.lock backend/tests/core/test_document_import.py
git commit -m "feat(import): parse ordered documents and epub"
```

---

### Task 2: Multi-document APIs and atomic project insertion

**Files:**
- Modify: `backend/app/api/schemas/import_schema.py`
- Modify: `backend/app/api/routers/import_router.py`
- Create: `backend/app/storage/services/project_chapter_import_service.py`
- Modify: `backend/app/storage/repos/volume_repo.py`
- Modify: `backend/app/api/routers/chapters.py`
- Test: `backend/tests/api/test_import.py`

**Interfaces:**
- Consumes `normalize_document_import()` from Task 1.
- Produces `POST /api/v1/import/documents/preview`.
- Produces `POST /api/v1/import/documents/confirm` for new projects.
- Produces `POST /api/v1/projects/{project_id}/chapter-imports/preview`.
- Produces `POST /api/v1/projects/{project_id}/chapter-imports`.
- Produces `ProjectChapterImportResult(first_chapter_id, created_volume_ids, chapter_count, total_word_count)`.

- [ ] **Step 1: Write the failing endpoint workflow test**

Write one bounded workflow test named `test_document_import_endpoints_preserve_order_and_placement`. It first previews and confirms an ordered TXT/ZIP/EPUB new project, asserting stored volume order matches preview. It then adds a trailing volume, previews an existing-project merge, and confirms it after a captured middle volume in continuous-numbering mode, asserting the inserted volume position and `第 1 章 原标题` titles. Run it and verify RED with HTTP 404 at `/import/documents/preview`.

- [ ] **Step 2: Implement preview and new-project confirmation**

Accept `files: Annotated[list[UploadFile], File()]`, validate count/upload totals before parsing, preserve list order, and return the existing `ImportPreviewResponse`. Share a private multipart-to-`ImportDocument` reader between the four new endpoints. For `/import/documents/confirm`, parse again and pass normalized volumes to `import_service.confirm_import`. Do not modify legacy `/import/confirm` or `/import/confirm-stream`.

- [ ] **Step 3: Re-run the workflow test to its next RED state**

Expected: new-project assertions pass, then the test fails with HTTP 404 at `/projects/{project_id}/chapter-imports`.

- [ ] **Step 4: Implement collision-safe range insertion**

Add `make_order_gap(session, project_id, start_order, count)` to `volume_repo`. Because `(project_id, order)` is unique, first move affected rows to distinct negative temporary orders, flush, then assign their final positive orders. In `project_chapter_import_service.import_documents`, validate the project and captured volume, compute `start_order`, create volumes/chapters from normalized data, record `source="import"` activities, and increment project `chapter_count`/`word_count` once.

- [ ] **Step 5: Run the workflow test and verify GREEN**

Run:

```powershell
python -m pytest tests/api/test_import.py::test_document_import_endpoints_preserve_order_and_placement -q
```

Expected: one passed test, continuous stored orders, and merged titles preserved with new numbering.

- [ ] **Step 6: Write and satisfy the atomic failure test**

Submit one valid file followed by a file whose chapter exceeds the editor limit. Assert a 400 response and unchanged volume list, chapter count, word count, and writing activity count. Verify RED before adding the route's transaction boundary, then ensure the route/service raises before any flush becomes externally committed.

- [ ] **Step 7: Run the four backend tests**

```powershell
python -m pytest \
  tests/core/test_document_import.py::test_normalize_ordered_txt_zip_epub_documents \
  tests/core/test_document_import.py::test_merge_documents_renumbers_and_preserves_titles \
  tests/api/test_import.py::test_document_import_endpoints_preserve_order_and_placement \
  tests/api/test_import.py::test_import_documents_rolls_back_all_files -q
```

Expected: `4 passed`.

- [ ] **Step 8: Commit the backend API slice**

```powershell
git add backend/app/api/schemas/import_schema.py backend/app/api/routers/import_router.py backend/app/api/routers/chapters.py backend/app/storage/repos/volume_repo.py backend/app/storage/services/project_chapter_import_service.py backend/tests/api/test_import.py
git commit -m "feat(import): add atomic multi-document endpoints"
```

---

### Task 3: Shared ordered-file UI and API client

**Files:**
- Modify: `frontend/src/features/projects/lib/import-api.ts`
- Create: `frontend/src/features/projects/components/import-file-list.tsx`
- Create: `frontend/src/features/projects/components/import-document-options.tsx`
- Modify: `frontend/src/features/projects/components/import-dialog.css`
- Modify: `frontend/src/i18n/locales/en.json`
- Modify: `frontend/src/i18n/locales/zh-CN.json`

**Interfaces:**
- Produces `DocumentImportOptions` with `splitMode`, `chunkSize`, `structureMode`, `mergedVolumeTitle`, and `chapterTitleMode`.
- Produces `ImportFileList({ files, onChange, disabled })`.
- Produces `previewDocuments(files, options)`, `confirmDocumentProject(files, projectInfo, options)`, and `importDocumentsIntoProject(projectId, files, placement, options)`.

- [ ] **Step 1: Add typed multipart helpers**

Use one builder that appends repeated `files` fields in array order:

```ts
for (const file of files) formData.append("files", file);
formData.append("split_mode", options.splitMode);
formData.append("structure_mode", options.structureMode);
formData.append("chapter_title_mode", options.chapterTitleMode);
```

Only append `merged_volume_title` in merge mode and `after_volume_id` for after-volume placement.

- [ ] **Step 2: Build the ordered file list**

Use dnd-kit's `DndContext` and `SortableContext` with a stable client ID generated when a file is added, not file name alone. Accept multiple files and filter to `.txt,.md,.zip,.epub`; display duplicate names as separate rows. Reordering must call `onChange` with a new array in visible order.

- [ ] **Step 3: Build shared import options**

Render separate/merge segmented controls. In merge mode show required volume title plus preserve/continuous title choice. Keep the existing auto/manual split controls and chunk bounds. Export validation that returns a localized message key without making API calls.

- [ ] **Step 4: Add localized strings and styling**

Add matched English and Chinese keys for supported formats, add/remove/reorder, structure mode, merged title, chapter title mode, placement, invalid totals, progress, and result summary. Reuse current dialog spacing and sortable-row styles rather than adding a second visual system.

- [ ] **Step 5: Run static checks**

```powershell
pnpm type-check
pnpm lint
```

Expected: both exit 0.

- [ ] **Step 6: Commit the shared frontend slice**

```powershell
git add frontend/src/features/projects/lib/import-api.ts frontend/src/features/projects/components/import-file-list.tsx frontend/src/features/projects/components/import-document-options.tsx frontend/src/features/projects/components/import-dialog.css frontend/src/i18n/locales/en.json frontend/src/i18n/locales/zh-CN.json
git commit -m "feat(import): add ordered document controls"
```

---

### Task 4: Multi-file new-project workflow

**Files:**
- Modify: `frontend/src/features/projects/components/import-dialog.tsx`

**Interfaces:**
- Consumes Task 3 components and `previewDocuments`/`confirmDocumentProject`.
- Preserves the current single-ZIP and completion callback behavior through the new ordered API.

- [ ] **Step 1: Replace single-file state with ordered file state**

Store `ImportFileItem[]`, shared options, preview request sequence, and preview data. Adding/removing/reordering or changing parse options invalidates the preview. Keep book title defaulted from the first file and do not overwrite a title the user has edited.

- [ ] **Step 2: Replace selection and split screens**

Use `ImportFileList` and `ImportDocumentOptions`; keep cover/title/description and completion screens. Disable preview when validation fails. Keep a single ZIP working through the new endpoint without showing any special migration UI.

- [ ] **Step 3: Wire preview and confirmation**

Call the multi-document endpoints, discard late preview responses by sequence number, and preserve all current state after a server error. Display indeterminate progress because the new endpoint returns only completion, not simulated percentage.

- [ ] **Step 4: Run static checks and build**

```powershell
pnpm type-check
pnpm lint
pnpm build
```

Expected: all exit 0 and generated precache completes.

- [ ] **Step 5: Commit the new-project UI**

```powershell
git add frontend/src/features/projects/components/import-dialog.tsx
git commit -m "feat(import): support ordered project documents"
```

---

### Task 5: Existing-project import dialog and integration

**Files:**
- Create: `frontend/src/features/writing/components/chapter-import-dialog.tsx`
- Modify: `frontend/src/features/writing/components/sidebar-toolbar.tsx`
- Modify: `frontend/src/features/writing/components/chapter-sidebar.tsx`
- Modify: `frontend/src/features/writing/hooks/use-volumes.ts`
- Modify: `docs/develop/feature-map.md`

**Interfaces:**
- Consumes Task 3 components and API helpers.
- `ChapterImportDialog` accepts `open`, `onOpenChange`, `projectId`, `currentVolumeId`, and `onImported(firstChapterId)`.

- [ ] **Step 1: Add the toolbar entry and capture current volume**

Add an Upload icon next to export, hidden during drag mode and protected by the existing Agent lock callback. In `ChapterSidebar`, derive current volume using `findVolumeIdForChapter(volumes, currentChapterId)` when the dialog opens and store that ID so later tab changes do not alter placement.

- [ ] **Step 2: Build the destination-specific dialog**

Compose the shared file list/options with a placement control. Disable “current volume之后” when no captured volume exists. Preview before confirmation; show created volume/chapter/word totals. On failure retain inputs; on success close, refresh volume tree, expand created volumes when IDs are returned, and select `firstChapterId`.

- [ ] **Step 3: Add query invalidation**

Add a focused TanStack mutation in `use-volumes.ts` that invalidates the target project's volume tree and project summary after success. Do not invalidate other projects or reload the page.

- [ ] **Step 4: Update the feature map**

Record the new-project and existing-project entry components, shared parser, EPUB parser, atomic service, and four endpoints so later format changes can be located quickly.

- [ ] **Step 5: Run final focused verification**

```powershell
python -m pytest tests/core/test_document_import.py tests/api/test_import.py -q
ruff check app/core/document_import.py app/core/epub_parser.py app/core/project_import.py app/api/routers/import_router.py app/api/routers/chapters.py app/storage/services/project_chapter_import_service.py app/storage/repos/volume_repo.py tests/api/test_import.py
```

From `frontend`:

```powershell
pnpm type-check
pnpm lint
pnpm build
```

Expected: all import tests pass, Ruff reports no errors, frontend checks exit 0, and the build generates its precache list.

- [ ] **Step 6: Perform the bounded manual checklist**

Verify one flow each: reorder mixed TXT/ZIP/EPUB before preview; create separate volumes; merge and continuously number; append at project end; insert after captured current volume; import one legacy ZIP. Confirm DOCX/PDF are rejected by the picker and server.

- [ ] **Step 7: Commit integration and docs**

```powershell
git add frontend/src/features/writing/components/chapter-import-dialog.tsx frontend/src/features/writing/components/sidebar-toolbar.tsx frontend/src/features/writing/components/chapter-sidebar.tsx frontend/src/features/writing/hooks/use-volumes.ts docs/develop/feature-map.md
git commit -m "feat(writing): import documents into new volumes"
```
