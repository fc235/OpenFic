# Upstream integration, 2026-10-25

Goal: integrate upstream main `34d7bf6` while preserving the fork's existing features and databases.

The user authorized integration after reviewing the direct merge trial. Conflicts retain upstream new capabilities and compatible local features. Previously discarded uncommitted comic/skill work stays discarded. Existing fork version 1.3.0, fixed LAN port 18473, message/chapter navigation, project references, drafts, OAuth fixes and notifications remain supported.

Use the verified previous adaptation checkpoint `77181c0` as the three-way content base. Record upstream HEAD as a real merge parent so subsequent synchronization uses normal ancestry. This applies the 24 new commits without reintroducing previously excluded upstream navigation and duplicate old migrations.

- [x] Backend: reconcile task/session persistence, continuation and API schemas; preserve local quick-start behavior; incorporate upstream tests and dependencies.
- [x] Frontend: retain local navigation and drafts alongside history pagination, voice input, mobile settings, dashboard timezone and model routing changes; synchronize dependencies and run checks.
- [x] Desktop/mobile: retain fixed local port and OAuth bridge alongside new remote access, logging, health and mobile client behavior; run desktop checks.
- [x] Migrations: retain existing revisions through 1030, adapt new upstream 1027–1029 to 1031–1033, verify unique linear history and upgrade existing SQLite data; ensure PostgreSQL repair migration targets the fork's schema.
- [x] Release/CI: retain fork identity and version while adapting upstream packaging and mobile capabilities without activating upstream-specific publication destinations.
- [x] Validation: migration regression first, backend full suite, frontend script/browser/type/build checks, desktop tests/type checks; inspect combined changes and independently review integration risks.

No live database migrations, external publication, or pushes are part of this task. Keep the reviewable integration in this worktree and finish the local merge only after validation.
