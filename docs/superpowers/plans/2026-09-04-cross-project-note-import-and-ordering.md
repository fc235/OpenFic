# Cross-Project Note Import and Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow selected notes and category paths to be copied from another project, while adding persistent mixed drag ordering for notes and categories.

**Architecture:** Store a shared `order_index` on both note entity types and expose one transactional reorder operation that validates and rewrites a destination sibling sequence. Extend the existing transfer service with a read-only preview and transactional project-copy path; the frontend uses explicit selection IDs, previewed conflict actions, optimistic tree ordering, and the existing import dialog.

**Tech Stack:** FastAPI, Pydantic, SQLModel/SQLAlchemy async, Alembic, pytest, React, TypeScript, TanStack Query, dnd-kit, Radix UI, i18next.

## Global Constraints

- Preserve the existing Markdown/ZIP import and export behavior.
- Source projects are always read-only; project import is one transactional copy.
- Categories with the same title under the same target parent merge automatically.
- Conflicting notes support `rename`, `overwrite`, and `skip`, with one default plus per-source-note overrides.
- New notes are unlocked and Agent-visible; overwrite preserves the target note's lock, hidden state, and position.
- Categories and notes share one order per parent, saved immediately when dragging ends.
- Keep the existing two-level category limit.
- Add only three focused backend tests; do not add E2E unless implementation reveals an otherwise unprotected high-risk regression.
- Preserve the user's untracked `docs/develop/feature-map.md` and the separate quick-start worktree.

---

## File Structure

- `backend/app/storage/migrations/versions/1022_add_note_order_index.py`: schema migration and deterministic backfill.
- `backend/app/storage/models/note.py`: persisted order fields.
- `backend/app/api/schemas/note.py`: order, reorder, project-import request/response contracts.
- `backend/app/storage/services/note_service.py`: mixed sibling ordering, append indices, and atomic move/reorder validation.
- `backend/app/storage/services/note_transfer_service.py`: project-import selection normalization, preview planning, conflicts, and transactional copy.
- `backend/app/api/routers/notes.py`: project-import and reorder endpoints.
- `backend/tests/api/test_notes.py`: exactly three focused tests added by this feature.
- `frontend/src/lib/note.types.ts`: camelCase contracts for ordering and project import.
- `frontend/src/lib/api-client.ts`: snake_case conversion and new requests.
- `frontend/src/features/writing/hooks/use-notes.ts`: optimistic reorder mutation and cache rollback.
- `frontend/src/features/writing/components/note-tree-order.ts`: pure mixed-tree flattening and reorder helpers.
- `frontend/src/features/writing/components/note-tree.tsx`: drag intent and submission.
- `frontend/src/features/writing/components/note-tree-item.tsx`: before/inside/after drop feedback.
- `frontend/src/features/writing/components/note-project-import-tree.tsx`: checkbox tree with cascading and half-selected states.
- `frontend/src/features/writing/components/note-import-conflicts.tsx`: global and per-note conflict controls.
- `frontend/src/features/writing/components/note-import-dialog.tsx`: source tabs and project-import state machine.
- `frontend/src/features/writing/components/note-import-dialog.css`: layout and drop indicators.
- `frontend/src/features/writing/components/note-sidebar.tsx`: new reorder callback and import refresh wiring.
- `frontend/src/i18n/locales/zh-CN.json`, `frontend/src/i18n/locales/en.json`: user-visible copy.

---

### Task 1: Persist a shared mixed note-tree order

**Files:**
- Create: `backend/app/storage/migrations/versions/1022_add_note_order_index.py`
- Modify: `backend/app/storage/models/note.py`
- Modify: `backend/app/api/schemas/note.py`
- Modify: `backend/app/storage/services/note_service.py`

**Interfaces:**
- Produces: `Note.order_index: int`, `NoteCategory.order_index: int`.
- Produces: `next_order_index(session, project_id, parent_id) -> int` for all creation/import callers.
- Produces: `order_index` in `NoteResponse`, `NoteListItem`, `NoteCategoryResponse`, and `NoteCategoryItem`.

- [ ] **Step 1: Add the migration**

Create revision `1022`, down-revision `1021`. Add non-null `order_index` columns with a temporary server default of `0`; backfill each project's root and each category parent in the same order users currently see—categories ordered by `(title, id)`, followed by notes ordered by `(title, id)`—then remove the server defaults. Downgrade drops both columns.

```python
from sqlalchemy.engine import Connection

revision = "1022"
down_revision = "1021"

def _backfill_mixed_order(connection: Connection) -> None:
    categories = connection.execute(sa.text(
        "SELECT id, project_id, parent_id, title FROM note_categories "
        "ORDER BY project_id, parent_id, title, id"
    )).mappings().all()
    notes = connection.execute(sa.text(
        "SELECT id, project_id, category_id, title FROM notes "
        "ORDER BY project_id, category_id, title, id"
    )).mappings().all()
    groups: dict[tuple[str, str | None], list[tuple[str, str]]] = {}
    for row in categories:
        groups.setdefault((row["project_id"], row["parent_id"]), []).append(("note_categories", row["id"]))
    for row in notes:
        groups.setdefault((row["project_id"], row["category_id"]), []).append(("notes", row["id"]))
    for siblings in groups.values():
        for index, (table, item_id) in enumerate(siblings):
            connection.execute(
                sa.text(f"UPDATE {table} SET order_index = :index WHERE id = :item_id"),
                {"index": index, "item_id": item_id},
            )

def upgrade() -> None:
    op.add_column("note_categories", sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("notes", sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"))
    connection = op.get_bind()
    _backfill_mixed_order(connection)
    with op.batch_alter_table("note_categories") as batch:
        batch.alter_column("order_index", server_default=None)
    with op.batch_alter_table("notes") as batch:
        batch.alter_column("order_index", server_default=None)
```

- [ ] **Step 2: Expose the fields in models and schemas**

```python
class NoteCategory(SQLModel, table=True):
    order_index: int = Field(default=0)

class Note(SQLModel, table=True):
    order_index: int = Field(default=0)
```

Add `order_index: int` to all four response models so `model_validate()` continues to be the single conversion path.

- [ ] **Step 3: Assign append positions on creation and return sorted trees**

Implement one helper over both repositories and call it from `create_note()` and `create_category()`:

```python
async def next_order_index(
    session: AsyncSession, project_id: str, parent_id: str | None
) -> int:
    categories = await note_category_repo.list_by_project(session, project_id)
    notes = await note_repo.list_by_project(session, project_id, include_hidden=True)
    values = [c.order_index for c in categories if c.parent_id == parent_id]
    values.extend(n.order_index for n in notes if n.category_id == parent_id)
    return max(values, default=-1) + 1
```

Sort every `cat_by_parent[parent_id]` and `notes_by_category[parent_id]` by `(order_index, id)`. The frontend will merge those already-numbered arrays, so the API shape remains backward compatible.

- [ ] **Step 4: Run migration and existing note tests**

Run:

```powershell
Set-Location backend
uv run alembic upgrade head
uv run pytest tests/api/test_notes.py -q
```

Expected: migration reaches `1022`; all existing note tests pass without adding a new test for field plumbing.

- [ ] **Step 5: Commit**

```powershell
git add backend/app/storage/migrations/versions/1022_add_note_order_index.py backend/app/storage/models/note.py backend/app/api/schemas/note.py backend/app/storage/services/note_service.py
git commit -m "feat(notes): persist mixed tree order"
```

---

### Task 2: Add one atomic move-and-reorder operation

**Files:**
- Modify: `backend/app/api/schemas/note.py`
- Modify: `backend/app/storage/services/note_service.py`
- Modify: `backend/app/api/routers/notes.py`
- Test: `backend/tests/api/test_notes.py`

**Interfaces:**
- Consumes: persisted `order_index` and `next_order_index()` from Task 1.
- Produces: `reorder_item(session, project_id, item_kind, item_id, target_category_id, ordered_siblings) -> NoteTreeResult`.
- Produces: `POST /projects/{project_id}/note-items/reorder`, returning `NoteTreeResponse`.

- [ ] **Step 1: Write the single mixed-order backend test**

Add `test_reorder_mixed_note_items_and_reject_cycle`. Create two root categories and one root note, submit a mixed order with the note between the categories, assert a fresh GET returns the three matching `order_index` values, then try moving the first category into its child and assert HTTP 400 without changing the stored tree.

```python
payload = {
    "kind": "note",
    "item_id": note_id,
    "target_category_id": None,
    "ordered_siblings": [
        {"kind": "category", "item_id": first_category_id},
        {"kind": "note", "item_id": note_id},
        {"kind": "category", "item_id": second_category_id},
    ],
}
response = await client.post(f"/api/v1/projects/{project_id}/note-items/reorder", json=payload)
assert response.status_code == 200
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `Set-Location backend; uv run pytest tests/api/test_notes.py::test_reorder_mixed_note_items_and_reject_cycle -q`

Expected: FAIL with 404 because the reorder route does not exist.

- [ ] **Step 3: Define the request schema**

```python
class NoteSiblingRef(BaseModel):
    kind: Literal["category", "note"]
    item_id: str

class NoteItemReorder(BaseModel):
    kind: Literal["category", "note"]
    item_id: str
    target_category_id: str | None = None
    ordered_siblings: list[NoteSiblingRef] = Field(min_length=1)
```

- [ ] **Step 4: Implement transactional validation and renumbering**

In `reorder_item()`, load all project categories and notes once, reject foreign IDs, duplicate refs, missing destination siblings, self/descendant moves, and depth overflow. Build the expected target IDs after applying the requested parent change; require exact set equality with `ordered_siblings`. Update the moved entity's parent, assign each target ref its list index, compact the old source parent if it differs, and return `list_notes()` without committing.

Keep `move_item()` temporarily for API compatibility, but route new UI behavior through `reorder_item()`.

- [ ] **Step 5: Add the route and response conversion**

```python
@router.post(
    "/projects/{project_id}/note-items/reorder",
    response_model=NoteTreeResponse,
)
async def reorder_item(
    project_id: str,
    data: NoteItemReorder,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> NoteTreeResponse:
    tree = await note_service.reorder_item(
        session, project_id, data.kind, data.item_id,
        data.target_category_id, data.ordered_siblings,
    )
    await background_service.commit_and_notify(session)
    return _to_note_tree_response(tree)
```

Extract the existing list route's tree-to-schema mapping into `_to_note_tree_response()` and reuse it here.

- [ ] **Step 6: Run the focused test**

Run: `Set-Location backend; uv run pytest tests/api/test_notes.py::test_reorder_mixed_note_items_and_reject_cycle -q`

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add backend/app/api/schemas/note.py backend/app/storage/services/note_service.py backend/app/api/routers/notes.py backend/tests/api/test_notes.py
git commit -m "feat(notes): reorder mixed tree items"
```

---

### Task 3: Implement project-to-project preview and copy

**Files:**
- Modify: `backend/app/api/schemas/note.py`
- Modify: `backend/app/storage/services/note_transfer_service.py`
- Modify: `backend/app/api/routers/notes.py`
- Test: `backend/tests/api/test_notes.py`

**Interfaces:**
- Consumes: `next_order_index()` and ordered note/category models.
- Produces: `plan_project_note_import(...) -> ProjectNoteImportPlan` used by both preview and execution.
- Produces: `preview_project_note_import(...) -> ProjectNoteImportPlan` and `import_notes_from_project(...) -> ProjectNoteImportResult`.
- Produces: preview and execute routes under `/projects/{target_project_id}/notes/import/project`.

- [ ] **Step 1: Add the two remaining backend tests**

Add `test_import_notes_from_project_with_selection_merge_and_override`: build source and target trees; send explicit selected IDs that omit one descendant; verify preview includes required ancestors, merges a same-name category, applies one per-note `overwrite` over a default `rename`, and execution creates only selected content in source order. Assert the new note is unlocked and visible while the overwritten target keeps its flags and index.

Add `test_import_notes_from_project_rejects_foreign_selection_atomically`: include an ID from a third project, assert HTTP 400, then GET the target tree and assert it is unchanged.

```python
request = {
    "source_project_id": source_id,
    "selected_category_ids": [source_category_id],
    "selected_note_ids": [source_conflict_id, source_plain_id],
    "default_conflict_strategy": "rename",
    "conflict_overrides": {source_conflict_id: "overwrite"},
}
preview = await client.post(
    f"/api/v1/projects/{target_id}/notes/import/project/preview", json=request
)
result = await client.post(
    f"/api/v1/projects/{target_id}/notes/import/project", json=request
)
```

- [ ] **Step 2: Run both tests and confirm failure**

Run:

```powershell
Set-Location backend
uv run pytest tests/api/test_notes.py::test_import_notes_from_project_with_selection_merge_and_override tests/api/test_notes.py::test_import_notes_from_project_rejects_foreign_selection_atomically -q
```

Expected: both FAIL with 404.

- [ ] **Step 3: Define project-import API contracts**

```python
NoteConflictStrategy = Literal["rename", "overwrite", "skip"]
NoteImportAction = Literal["create", "rename", "overwrite", "skip"]

class ProjectNoteImportRequest(BaseModel):
    source_project_id: str
    selected_category_ids: list[str] = Field(default_factory=list)
    selected_note_ids: list[str] = Field(default_factory=list)
    default_conflict_strategy: NoteConflictStrategy = "rename"
    conflict_overrides: dict[str, NoteConflictStrategy] = Field(default_factory=dict)

class ProjectNoteImportAction(BaseModel):
    source_note_id: str
    source_path: str
    target_title: str
    action: NoteImportAction

class ProjectNoteImportPreviewResponse(BaseModel):
    categories: list[NoteCategoryItem]
    actions: list[ProjectNoteImportAction]
    create_category_count: int
    merge_category_count: int
    create_note_count: int
    overwrite_note_count: int
    skip_note_count: int

class ProjectNoteImportResponse(BaseModel):
    created_category_count: int
    merged_category_count: int
    created_note_count: int
    renamed_note_count: int
    overwritten_note_count: int
    skipped_note_count: int
```

- [ ] **Step 4: Build one shared import planner**

Add internal immutable plan records for category actions and note actions. `plan_project_note_import()` must:

1. reject identical/missing projects and any selected/override ID outside the source;
2. reject an empty effective selection;
3. add only ancestors required by selected categories or notes;
4. process categories in `(depth, order_index, id)` order and map same-title siblings to existing targets;
5. process selected notes by `(order_index, id)`, resolving the override or default strategy;
6. choose rename suffixes as `Title (2)`, `Title (3)` using names already present or planned in that target parent;
7. validate imported content with `validate_editor_content()`.

Preview converts the plan without writes. Execution consumes the same plan structures, creates categories/notes with contiguous append indices, overwrites only title/content, records writing activity for created/updated notes, flushes but does not commit, and returns final counts.

- [ ] **Step 5: Add preview and execute routes**

```python
@router.post("/projects/{target_project_id}/notes/import/project/preview")
async def preview_project_note_import(
    target_project_id: str,
    data: ProjectNoteImportRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await note_transfer_service.preview_project_note_import(session, target_project_id, data)

@router.post("/projects/{target_project_id}/notes/import/project")
async def import_notes_from_project(
    target_project_id: str,
    data: ProjectNoteImportRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await note_transfer_service.import_notes_from_project(session, target_project_id, data)
    await background_service.commit_and_notify(session)
    return result
```

Map `NotFoundError` to 404 and request/selection conflicts to 400 exactly as existing note-import routes do.

- [ ] **Step 6: Run all three feature tests**

Run: `Set-Location backend; uv run pytest tests/api/test_notes.py -q`

Expected: existing tests and the three newly added focused tests pass.

- [ ] **Step 7: Commit**

```powershell
git add backend/app/api/schemas/note.py backend/app/storage/services/note_transfer_service.py backend/app/api/routers/notes.py backend/tests/api/test_notes.py
git commit -m "feat(notes): import selected notes from projects"
```

---

### Task 4: Add frontend contracts and optimistic reorder data flow

**Files:**
- Modify: `frontend/src/lib/note.types.ts`
- Modify: `frontend/src/lib/api-client.ts`
- Modify: `frontend/src/features/writing/hooks/use-notes.ts`
- Create: `frontend/src/features/writing/components/note-tree-order.ts`

**Interfaces:**
- Consumes: backend request/response contracts from Tasks 2–3.
- Produces: `reorderNoteItem(projectId, request)`, `previewProjectNoteImport(projectId, request)`, and `importNotesFromProject(projectId, request)`.
- Produces: `useReorderNoteItem(projectId)` with optimistic cache replacement/rollback.
- Produces: pure `getMixedChildren()`, `flattenOrderedTree()`, and `applyTreeReorder()` helpers.

- [ ] **Step 1: Add camelCase types**

Add `orderIndex` to note/category types and define:

```typescript
export type NoteItemKind = "category" | "note";
export interface NoteSiblingRef { kind: NoteItemKind; itemId: string }
export interface NoteItemReorder extends NoteSiblingRef {
  targetCategoryId: string | null;
  orderedSiblings: NoteSiblingRef[];
}
export type NoteConflictStrategy = "rename" | "overwrite" | "skip";
export interface ProjectNoteImportRequest {
  sourceProjectId: string;
  selectedCategoryIds: string[];
  selectedNoteIds: string[];
  defaultConflictStrategy: NoteConflictStrategy;
  conflictOverrides: Record<string, NoteConflictStrategy>;
}
```

Mirror all preview action/count and final result fields from Task 3 in camelCase.

- [ ] **Step 2: Implement API transformations**

Update existing note/category transformers with `orderIndex: raw.order_index as number`. Add explicit snake_case request conversion and camelCase response conversion for all three new endpoints. Do not alter multipart `previewNoteImport()` or `importNotes()`.

```typescript
export async function reorderNoteItem(projectId: string, data: NoteItemReorder) {
  const response = await apiClient.post(`/projects/${projectId}/note-items/reorder`, {
    kind: data.kind,
    item_id: data.itemId,
    target_category_id: data.targetCategoryId,
    ordered_siblings: data.orderedSiblings.map((item) => ({ kind: item.kind, item_id: item.itemId })),
  });
  return transformNoteTree(response.data);
}
```

- [ ] **Step 3: Add pure tree-order helpers**

`getMixedChildren(categories, notes)` returns discriminated items sorted by `(orderIndex, kind, id)`. `flattenOrderedTree()` replaces the category-first implementation in `note-tree.tsx`. `applyTreeReorder(tree, request)` removes the active item, updates its parent ID, inserts it according to `orderedSiblings`, and rewrites local `orderIndex` values without mutating the prior cache object.

- [ ] **Step 4: Replace the move mutation**

Add `useReorderNoteItem` beside the existing `useMoveNoteItem` so this task does not break current call sites. `mutationFn` calls `reorderNoteItem`; `onMutate` cancels `['note-tree', projectId]`, stores the previous tree, and applies `applyTreeReorder`; `onError` restores it and shows `writing.noteMoveFailed`; `onSuccess` replaces cache with the authoritative returned tree instead of issuing an extra fetch. Task 5 switches the sidebar and can then remove `useMoveNoteItem` and the old client function.

- [ ] **Step 5: Run static checks**

Run: `Set-Location frontend; pnpm type-check`

Expected: PASS because the existing move hook remains available until Task 5.

- [ ] **Step 6: Commit**

```powershell
git add frontend/src/lib/note.types.ts frontend/src/lib/api-client.ts frontend/src/features/writing/hooks/use-notes.ts frontend/src/features/writing/components/note-tree-order.ts
git commit -m "feat(notes): add import and reorder client contracts"
```

---

### Task 5: Make the note tree sortable between and inside categories

**Files:**
- Modify: `frontend/src/features/writing/components/note-tree.tsx`
- Modify: `frontend/src/features/writing/components/note-tree-item.tsx`
- Modify: `frontend/src/features/writing/components/note-sidebar.tsx`
- Modify: `frontend/src/features/writing/components/note-import-dialog.css`

**Interfaces:**
- Consumes: `flattenOrderedTree()`, `getMixedChildren()`, `NoteItemReorder`, and `useReorderNoteItem()` from Task 4.
- Produces: `onReorder(request: NoteItemReorder) -> Promise<void>` note-tree prop.

- [ ] **Step 1: Add explicit drop intents**

Each draggable row exposes its `kind`, `itemId`, `parentId`, and depth. Add three droppable IDs per row—`${kind}:${id}:before`, `${kind}:${id}:inside` for categories only, and `${kind}:${id}:after`—with visible top/bottom line or category-body highlight. Keep mouse/touch activation constraints unchanged.

```typescript
type DropPosition = "before" | "inside" | "after";
interface NoteDropData {
  itemKind: NoteItemKind;
  itemId: string;
  parentId: string | null;
  depth: number;
  position: DropPosition;
}
```

- [ ] **Step 2: Convert drag end into one complete sibling request**

For `inside`, target the category and append the active item. For `before`/`after`, target the hovered item's parent and insert adjacent to it. Use the full mixed children list after local removal/insertion to build `orderedSiblings`. Preserve the current client-side depth and descendant early warnings; the backend remains authoritative.

```typescript
const request: NoteItemReorder = {
  kind: activeItem.kind,
  itemId: activeItem.id,
  targetCategoryId,
  orderedSiblings: nextSiblings.map(({ kind, id }) => ({ kind, itemId: id })),
};
void onReorder(request);
```

- [ ] **Step 3: Wire the sidebar to the new mutation**

Replace the current three-argument `handleMove` with a one-argument reorder handler calling `reorderMutation.mutateAsync(request)`. Remove the now-unused `useMoveNoteItem`, `moveNoteItem`, `NoteItemMove`, and `NoteMoveResult` frontend symbols after confirming there are no other callers. Keep Agent-lock gating and existing error toast behavior intact.

- [ ] **Step 4: Run frontend checks**

Run:

```powershell
Set-Location frontend
pnpm type-check
pnpm lint
```

Expected: both PASS.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/features/writing/components/note-tree.tsx frontend/src/features/writing/components/note-tree-item.tsx frontend/src/features/writing/components/note-sidebar.tsx frontend/src/features/writing/components/note-import-dialog.css
git commit -m "feat(notes): drag to reorder note tree"
```

---

### Task 6: Build the cross-project import dialog flow

**Files:**
- Create: `frontend/src/features/writing/components/note-project-import-tree.tsx`
- Create: `frontend/src/features/writing/components/note-import-conflicts.tsx`
- Modify: `frontend/src/features/writing/components/note-import-dialog.tsx`
- Modify: `frontend/src/features/writing/components/note-import-dialog.css`
- Modify: `frontend/src/features/writing/components/note-sidebar.tsx`
- Modify: `frontend/src/i18n/locales/zh-CN.json`
- Modify: `frontend/src/i18n/locales/en.json`

**Interfaces:**
- Consumes: `fetchProjects()`, `fetchNoteTree()`, `previewProjectNoteImport()`, and `importNotesFromProject()`.
- Produces: the complete user flow while retaining the existing `NoteImportDialog` props and file-import callbacks.

- [ ] **Step 1: Implement the selectable source tree**

Render mixed ordered children with checkboxes. A category click toggles all descendants; child deselection recalculates ancestors as checked/unchecked/indeterminate. Export explicit `selectedCategoryIds` and `selectedNoteIds`, including checked empty categories but excluding unchecked descendants.

```typescript
interface NoteProjectImportTreeProps {
  tree: NoteTreeResponse;
  selectedCategoryIds: Set<string>;
  selectedNoteIds: Set<string>;
  onSelectionChange(categoryIds: Set<string>, noteIds: Set<string>): void;
}
```

- [ ] **Step 2: Implement conflict controls**

Render a global Radix select for `rename | overwrite | skip`. For every preview action caused by a name collision, render a per-note select whose value is `conflictOverrides[sourceNoteId] ?? defaultConflictStrategy`; changing it updates the override map and requests a fresh preview.

```typescript
interface NoteImportConflictsProps {
  actions: ProjectNoteImportAction[];
  defaultStrategy: NoteConflictStrategy;
  overrides: Record<string, NoteConflictStrategy>;
  onDefaultChange(value: NoteConflictStrategy): void;
  onOverrideChange(noteId: string, value: NoteConflictStrategy): void;
}
```

- [ ] **Step 3: Extend the dialog state machine without changing file import**

Add source mode `file | project`. In project mode, fetch project pages until all accessible projects are available, exclude `projectId`, load the chosen source tree, collect explicit selection, call preview, then execute the same request. Disable confirmation for no project, no selection, loading, or errors. On failure, retain selection and strategies. On success, show created/renamed/overwritten/skipped and created/merged category counts.

Do not render a lock/hidden preservation choice. Do not share `file`, `FileReader`, or multipart state with project mode beyond common loading/error/completion presentation.

- [ ] **Step 4: Refresh only the target tree**

Keep `onSuccess` backward compatible by widening its result union or add a separate internal completion callback. In `note-sidebar.tsx`, invalidate `['note-tree', projectId]` after project import; do not invalidate or mutate the source project's note cache.

- [ ] **Step 5: Add concise localized copy and styles**

Add Chinese and English keys for source tabs, project picker, selection hints, preview statistics, conflict strategies, per-note override, and final counts. Add only layout rules needed for the scrollable selection tree, conflict list, half-selected checkbox alignment, and drop indicators.

- [ ] **Step 6: Run the complete reduced verification set**

Run:

```powershell
Set-Location backend
uv run pytest tests/api/test_notes.py -q
uv run ruff check app/api/schemas/note.py app/api/routers/notes.py app/storage/models/note.py app/storage/services/note_service.py app/storage/services/note_transfer_service.py tests/api/test_notes.py

Set-Location ../frontend
pnpm type-check
pnpm lint
pnpm build
```

Expected: every command exits 0. Do not run the repository-wide backend type checker because its known unrelated failure in `backend/app/retrieval/engine.py:348` is outside this feature.

- [ ] **Step 7: Perform one manual core-flow check**

Create source and target projects, select a category while deselecting one child, preview one conflict, override its strategy, import, drag one mixed sibling, refresh, and verify the imported selection and order persist. Also open file mode once and confirm Markdown/ZIP selection still reaches the existing preview.

- [ ] **Step 8: Commit**

```powershell
git add frontend/src/features/writing/components/note-project-import-tree.tsx frontend/src/features/writing/components/note-import-conflicts.tsx frontend/src/features/writing/components/note-import-dialog.tsx frontend/src/features/writing/components/note-import-dialog.css frontend/src/features/writing/components/note-sidebar.tsx frontend/src/i18n/locales/zh-CN.json frontend/src/i18n/locales/en.json
git commit -m "feat(notes): add cross-project import flow"
```

---

## Final Review Checklist

- [ ] `git diff --check` reports no whitespace errors.
- [ ] `git status --short` contains only intended feature files plus the pre-existing untracked `docs/develop/feature-map.md`.
- [ ] Exactly three focused backend tests were added for this feature.
- [ ] No E2E was added unless a concrete high-risk UI behavior required it and the reason is documented in the final handoff.
- [ ] Existing file import/export endpoints and UI remain intact.
- [ ] Source project records remain unchanged after preview and execution.
- [ ] New notes reset lock/hidden state; overwrite preserves the target state and order.
- [ ] Mixed note/category order survives refresh and failed requests roll back optimistic UI state.
