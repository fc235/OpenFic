# Upstream integration on 2026-11-12

## Scope and plan

Integrate upstream main into `codex/fixed-lan-port` at `6dbecda`, accepting upstream features while preserving the fork's document import/splitting, shared project references and skills, message navigation/search, quick-start sessions, draft protection, LAN port 18473, and fork update/package destinations.

1. Reuse integration `1be8852` through upstream `34d7bf6`; merge the current fork's additional chapter-splitting commit without discarding it.
2. Fetch current upstream main and merge its subsequent changes; reconcile conflicts individually, preserving both upstream functionality and fork behavior. Keep database revision IDs unique and compatible with installed fork databases.
3. Run backend regressions, frontend checks/build/browser regressions, and desktop checks relevant to changed interfaces and packaging. Record actual results and remaining platform limits below.
4. Commit the integration and fast-forward the original branch after verification, preserving its untracked build directory. Do not publish a release or push remote branches.

## Integrated upstream

Latest upstream is `539335a851348fcd2a41a1cfdf73c09dac76fde4` (2026-11-12). The 20 commits after the reused October integration add skill management and built-in skill authoring/style distillation skills, session timeouts, right-sidebar editor/session tabs, Keenable search, model max-token defaults, Anthropic output limits, Gemini thought signatures, editor whitespace/draft fixes, persisted desktop authentication, download-source selection and Android microphone permissions. Earlier pagination, PostgreSQL, transcription and remote-client integration is retained through `1be8852`.

Resolved 27 conflicted paths individually. Kept fork version 1.3.0, existing changelog, document import/splitting, reusable `write_skill`, shared references, chapter/message navigation, quick-start sessions, consolidated General settings, lazy-loaded math/diagrams, port 18473 and fork packaging destinations. Upstream skill-management tools coexist with `write_skill`. Session timeouts have a new settings category. Lazy math loading now enables single-dollar formulas.

Desktop application updates use only `fc235/OpenFic`; upstream's AtomGit publication workflow and application-update mirror are excluded because they publish/serve another fork. Python/dependency mirror selection and fallback remain enabled. Bundled backend wheels are installed from the bundled file, with dependency-index fallback and without requiring the fork version to exist on PyPI.

## Integration regressions repaired

- Shared upstream chapter diff cards retain local clickable chapter/line navigation.
- New sidebar session tabs use UUID generation compatible with HTTP LAN origins.
- Sidebar chapter editors do not consume navigation requests intended for the main editor, including error cleanup.
- Manual chapter saves target their own editor instance; global save/find/replace handlers require focus inside that editor. A hidden editor cannot overwrite the main editor's newer draft when Ctrl+S is pressed in the body or title.
- Updated existing attachment tests to mock the new timeout-settings lookup and desktop fixtures to match new source/config interfaces. Existing tab-navigation tests now select the upstream tab role.

All three sidebar regressions and bundled-wheel index fallback were reproduced with failing tests before repair. An independent read-only review verified the fixes.

## Verification

- Complete backend suite: **2580 passed, 19 skipped**, zero failures.
- Chrome browser integration suite: **61 passed**; chapter navigation/upstream features/fixes harness: **28 passed** (89 total).
- Frontend script tests: **15 passed**; type-aware lint/type check, production build and precache generation passed.
- Desktop main/renderer TypeScript checks passed. Desktop tests: **66 passed** with the pre-existing Windows symlink-privilege test excluded after confirming its `EPERM` failure.
- Mobile TypeScript check and JavaScript tests: **5 passed**.
- Backend lock check passed offline; Alembic has one head, **1033**. Latest upstream adds no migrations, preserving the previous integration's fork migration chain. Changed conflict-resolution Python files pass Ruff. No unresolved merge entries remain.

## Limits and delivery

Android native compilation/signing and packaged Electron runtime execution were not performed. Optional backend tests account for the 19 skips; no live PostgreSQL server was provisioned for this run. Existing user databases and the running application were not migrated or restarted. The Windows symlink test requires privileges unavailable to this process.

The verified integration is committed on `codex/merge-upstream-20261112` and delivered to `codex/fixed-lan-port` by fast-forward. `codex/backup-before-upstream-20261112` retains original commit `6dbecda`. The original untracked `desktop/dist-build-3aebe78/` is preserved. No remote branch is pushed and no release is published.
