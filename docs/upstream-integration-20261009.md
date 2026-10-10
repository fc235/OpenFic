# Upstream fixes integrated on 2026-10-09

The adaptation starts from local `2495729` and preserves the local chapter-navigation work captured in `7639bab`. Upstream main was `77181c066378bcaab00d459ed34f49ba3af9e4c2`. Git transport was unavailable; patches were retrieved through the GitHub commit API. These are selective adaptations, not a Git merge and not a claim that all upstream main history is present.

| Upstream commit | Integrated behavior |
| --- | --- |
| `a979652` | Serialize Agent content writes and edits; include lock regression tests |
| `a22269c` | Use stable model IDs for dashboard aggregation and chart series |
| `2ba74af` | Use Anthropic clients and discovery for Anthropic-compatible catalog providers |
| `27a565f` | Preserve chained error causes and stop retrying invalid TLS certificates |
| `5d020cc` | Keep completed chapter exports until expiry |
| `07122df`, `0bf5dfc` | Keep IME confirmation and mobile Enter from sending messages |
| `73c50c0` | Stabilize editor options and allow native menus on touch devices |
| `3bdf573` | Normalize Markdown line endings; retain failed/in-flight character and world-info drafts; cancel stale detail requests |
| `c47570a` | Hide the latest change summary until the Agent round finishes |
| `2e15207` | Set application request headers and forward stable Agent session IDs to OpenCode |

Local adaptations retain ChapterNavigationHighlight, existing message navigation, working-copy storage, editor find/replace, external-link selection behavior, async token counting and fork release versions. Desktop and dependency files were unchanged during this first phase.

Additional integration regressions cover a chapter moving to a different source volume while a mutation waits for its lock, deleting a volume during chapter writes, old character GET responses arriving after successful PATCH, and SDKs overriding User-Agent during final request construction. Source-volume changes are rejected before mutation; volume deletion shares both volumes and chapters project locks. Amazon Nova uses SDK default headers, and OpenRouter uses its SDK User-Agent setting.

The remaining features were deferred during the first phase. The second phase below integrates the approved features; upstream navigation, notifications, release metadata and README updates remain excluded.

## Reproduce validation

Run the affected backend tests with the project's Python virtual environment, from `backend`:

```powershell
python -m pytest tests/agent_runtime tests/models tests/providers/test_llm_client.py tests/api/test_chapter_exports.py tests/api/test_dashboard_llm.py -q
```

From `frontend`, use installed dependencies:

```powershell
node --test scripts/*.test.mjs
node node_modules/typescript/bin/tsc -b
node node_modules/oxlint/bin/oxlint . --type-aware --type-check
node node_modules/@playwright/test/cli.js test --config playwright.harness.config.ts
node node_modules/vite-plus/bin/vp build
node scripts/generate-precachelist.mjs
```

The browser harness tests mock API responses and start their own Vite server; no running backend is needed. With system Chrome instead of downloaded Playwright Chromium, set `$env:OPENFIC_BROWSER_CHANNEL = 'chrome'` before running Playwright.

The full backend type check has a pre-existing `lxml.etree` missing-type diagnostic in `app/core/epub_parser.py`; it reproduces on the original checkout. Type checks of the changed backend application files are clean.

Validated results: 985 affected backend tests, 13 frontend script tests and 16 browser tests passed. Frontend TypeScript project checks, type-aware lint, production build and precache generation passed. Ruff and backend type checks for the changed application files passed. The production build retains its existing large-chunk warning.

## Second phase: resumed on 2026-10-10

The second phase starts from `675012e`, with the implementation checkpoint saved in `2f3ab07` on `codex/upstream-features-20261009`. It selectively adapts these additional upstream commits:

| Commit | Integrated behavior |
| --- | --- |
| `bf8e227` | UI styles applicable to the local interface |
| `cc0d0ab`, `5fbbad0` | Attachments, file-reading tools and the composer reference panel |
| `88feeb3` | Character relationships and graph view |
| `3a5c97a`, `a36c3e9`, `fc657ca` | Old-tool-output pruning, compaction settings and child-session compaction |
| `ffaf732` | Default reasoning effort settings |
| `12d27da` | OpenAI Codex OAuth provider and desktop authorization bridge |
| `94e342d` | Streamdown 2.7 and removal of the old compatibility patch |
| `9d85a5d` | Infistar provider |
| `dd83a17` | Lighter change summaries and details loaded on demand |

The fork remains version `1.2.0`. Existing message navigation, notifications, chapter navigation, shared project tools, drafts, async token counting and LAN port `18473` are preserved. The upstream navigation CSS requiring the excluded navigation implementation, Infistar sponsor README changes, upstream navigation `af02d4a`, notifications `d0e344b`, release `8fd5078` and README `77181c0` were not adopted.

Five migrations extend the existing fork history: `1026` attachments, `1027` relationships, `1028` reasoning settings, `1029` OAuth and `1030` query indexes. Local migrations `1022–1025` and their existing session/sequence index remain intact. Upgrade/downgrade/re-upgrade tests use temporary SQLite databases and preserve shared-project links.

Integration regressions additionally fixed OAuth reauthorization racing with refresh, duplicate account binding after concurrent callbacks, executable HTML attachment responses, orphan relationships after undo, Codex image block conversion, running-session file injection and a session/revision argument mix-up in lazy detail loading. These have targeted failing-then-passing tests and independent review.

The isolated checkpoint passed the complete backend suite (2106), frontend scripts (13), browser harness tests (24), frontend checks/build and changed-file backend lint/type checks. Desktop checks passed; its complete Node suite passed 43 tests with one pre-existing Windows symlink-permission failure, also reproduced in the original checkout. Full backend app type checking retains the pre-existing `lxml.etree` missing-type diagnostic.

Delivery completed in `G:/code/OpenFic` on 2026-10-10. All 239 affected paths were checked against `675012e` before applying the patch; their final contents match the reviewed worktree. Original files and status were backed up under `tmp/upstream-delivery-20261010`, including `before-delivery.zip` and a file manifest. Existing uncommitted work is preserved; the original branch and index were not changed.

Original checkout dependencies were synchronized with `uv sync --frozen` and `pnpm install --frozen-lockfile`. Fresh verification there passed the full backend suite (**2106 passed in 242.30s**), frontend scripts (**13**), browser tests (**24**), desktop authorization/notification/port/preferences regressions (**7**), frontend and desktop TypeScript checks, frontend type-aware lint, changed-file backend Ruff/ty, production build and precache generation. The existing large-chunk build warning remains. Detailed logs are saved in `tmp/upstream-delivery-20261010`.

The known pre-existing desktop symlink-permission test failure and full-app `lxml.etree` type diagnostic remain as described above. Real user database migrations and live account authorization were not invoked by the delivery checks.
