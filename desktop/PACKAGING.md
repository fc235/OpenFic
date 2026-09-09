# Desktop backend package

Run `pnpm build:backend` in `desktop` to produce the desktop-only wheel in
`backend/dist-desktop`. It requires `uv` on `PATH` and does not build or include
frontend assets: Electron bundles `frontend/dist` separately as `frontend-dist`.
Build the frontend and desktop code with `pnpm build` before packaging.

`pnpm package` builds this wheel before invoking Electron Builder. The packaging
gate requires exactly one wheel matching the desktop version in `dist-desktop`;
remove obsolete wheels there when changing versions.

Regular `uv build` in `backend` still produces the full server wheel and sdist
with frontend assets in `backend/dist`. Only the desktop build script sets
`OPENFIC_DESKTOP_BUILD=1`, and the flag only affects wheels. Do not publish the
desktop-only wheel to PyPI or use it as a standalone web installation.
