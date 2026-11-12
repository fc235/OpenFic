# Upstream integration on 2026-10-25

This integration adds upstream main `34d7bf6ed57bd043e03a145ea25ee54d29b9928b` to fork `91169ab` (1.3.0). It includes the 24 commits since the previously adapted checkpoint `77181c0`: history pagination, resumable interrupted sessions, dashboard query/timezone and desktop logging fixes, provider validation/routing, Requesty, DeepSeek web search, PostgreSQL, connection tunnels, speech transcription, mobile UI, and the Android remote client.

The merge records upstream main as its second parent. Content was reconciled against the verified previous adaptation checkpoint, rather than replaying all historical fork adaptations. The original direct merge produced 94 conflicted paths and eight duplicate revision IDs; the incremental reconciliation produced 32 conflicted paths before manual resolution. Original signed commit hashes and all 24 source trees were verified when importing upstream objects; Git connectivity checks pass.

## Preserved fork behavior

- Version 1.3.0 and the fc235/OpenFic update destinations.
- Fixed LAN port 18473, desktop OAuth bridge/validation, notifications and close behavior.
- Local message navigation/search, chapter navigation/highlight, editor drafts, project references and shared tools.
- Metadata-only task PATCH responses and the legacy message paging endpoint, alongside upstream cursor paging.
- Existing OAuth credential refresh/rotation fixes and lightweight desktop-only backend wheels.

Previously discarded, uncommitted comic-workbench and skill-import work is not part of this integration. Its recovery snapshot is retained in the source checkout's stash.

## Integration repairs

The immutable fork migration chain through 1030 is retained. New migrations are 1031 (dashboard metadata/indexes), 1032 (PostgreSQL and runtime foreign-key repairs), and 1033 (attachment MIME width). PostgreSQL compatibility routing and new migration tests use these IDs. Upgrade/downgrade/re-upgrade from an installed 1030 database preserves project references, character positions/relationships, OAuth credentials and attachment content, with no foreign-key violations.

Local transcript lookup now uses PostgreSQL JSONB extraction on PostgreSQL and preserves its SQLite implementation. Cursor paging coexists with local navigation, search, result deduplication and notification lifecycles.

Windows uses Winloop for its existing CLI event-loop entry point. The upstream Proactor loop was reproduced failing with psycopg; Winloop supports PostgreSQL readers, subprocess pipes and ZMQ in one loop. It is installed only on Windows. OAuth CLI flows use the same loop factory.

Packaging retains fork update metadata and restores desktop-only wheel creation/download paths. Windows x64/ARM64 update manifests retain older x64 client aliases. The reusable build workflow includes Android, macOS and Linux targets. PyPI/AtomGit publishing was excluded; GitHub/GHCR artifacts target the fork. Manual existing-tag builds remain available.

## Verification

- Complete backend suite: **2485 passed, 18 skipped**; one upstream Windows ZMQ selector warning. Later event-loop changes are additionally covered by **33 passing CLI tests**, including a real PostgreSQL connection plus subprocess pipes.
- Live PostgreSQL 18 migration/dashboard/MIME tests: **42 passed**. Async database, transaction and checkpoint tests under the selected Windows Winloop policy: **72 passed**.
- Installed-fork migration regressions: **3 passed**, including seeded 1030 data surviving upgrade/downgrade/re-upgrade.
- Actual CLI startup with fresh temporary SQLite and PostgreSQL databases: migration, project create/read, health and graceful shutdown all passed.
- Desktop/mobile type checks and mobile shell production build passed. Mobile JavaScript tests: **5 passed**. Packaging/wheel/update contract tests: **12 passed**.
- The actual desktop-only 1.3.0 backend wheel built successfully (3.8 MB), includes migration 1033, excludes duplicated frontend assets, and passes the real Electron before-pack wheel gate.
- Independent reviews covered backend/frontend contracts, migrations, packaging, publication destinations and the Windows loop change. Actionlint and changed-file Ruff/type/whitespace checks passed.

Frontend scripts: **15 passed**. Browser integration suite: **61 passed**; original upstream/fork fixes harness: **24 passed**. Real wheel-input scroll anchoring and message navigation repeated five times each: **10 passed**. TypeScript, type-aware lint, production build and precache generation passed. Browser history fixtures now use production scroll styling and real user wheel input, preserving the visible-anchor assertion.

## Validation limits

Desktop's broad suite has three environment failures: a Windows symlink permission failure and two fixed-port tests blocked by the pre-existing process listening on 18473. That application was left running. Targeted port/auth and packaging/update tests pass.

Android native compilation/signing was not run because this host has no Java or Android SDK. The mobile TypeScript, browser shell build and JavaScript tests passed. Electron's native runtime smoke was unavailable because the existing shared dependency installation contains no Electron executable; both backend CLI runtime smokes passed. Linux/macOS/native ARM64 packages were configured and contract-checked, not compiled on this Windows x64 host. Native Windows ARM64 PostgreSQL installation is constrained by the upstream psycopg-binary wheel availability.

Full backend type checking retains the pre-existing `lxml.etree` missing-type diagnostic. No existing user database was migrated, no release was published, and no remote branch was pushed. Temporary PostgreSQL databases are isolated from user data.
