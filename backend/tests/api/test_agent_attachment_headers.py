"""Raw user documents must never execute as the application's origin."""
import io
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi import FastAPI, UploadFile
from PIL import Image
from starlette.datastructures import Headers

from app.agent_runtime import attachments


async def saved_response(tmp_path, monkeypatch, file_name, content, mime_type):
    from app.main import fastapi_app

    monkeypatch.setattr(attachments.settings, "agent_attachments_dir", tmp_path / "agent-attachments")
    session = SimpleNamespace(add=lambda _row: None, commit=AsyncMock(), refresh=AsyncMock())
    attachment = await attachments.save_agent_attachment(
        session, session_id="session", task_id="task", project_id="project",
        file=UploadFile(io.BytesIO(content), filename=file_name, headers=Headers({"content-type": mime_type})),
    )
    # Use the class actually wired into production, including when it changes.
    mount = next(route for route in fastapi_app.routes if getattr(route, "name", None) == "agent_attachments")
    app = FastAPI()
    app.mount("/agent-attachments", type(mount.app)(directory=str(attachments.ensure_agent_attachments_dir())))
    return app, f"/agent-attachments/{attachment.storage_name}"


@pytest.mark.asyncio
async def test_original_html_is_downloaded_and_sandboxed_even_for_cached_requests(tmp_path, monkeypatch):
    original = b"<html><body>Document<script>fetch('/api/v1/projects')</script></body></html>"
    app, url = await saved_response(tmp_path, monkeypatch, "document.html", original, "text/html")
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app), base_url="http://test") as client:
        response = await client.get(url)
        assert response.status_code == 200
        assert response.content == original
        assert response.headers.get("content-disposition", "").startswith("attachment")
        assert response.headers.get("x-content-type-options") == "nosniff"
        assert "sandbox" in response.headers.get("content-security-policy", "")
        assert "default-src 'none'" in response.headers.get("content-security-policy", "")
        cached = await client.get(url, headers={"If-None-Match": response.headers["etag"]})
        assert cached.status_code == 304
        assert cached.headers.get("content-disposition", "").startswith("attachment")
        assert "sandbox" in cached.headers.get("content-security-policy", "")


@pytest.mark.asyncio
async def test_valid_png_attachments_keep_inline_preview(tmp_path, monkeypatch):
    image = io.BytesIO()
    Image.new("RGB", (1, 1), "white").save(image, format="PNG")
    app, url = await saved_response(tmp_path, monkeypatch, "image.png", image.getvalue(), "image/png")
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app), base_url="http://test") as client:
        response = await client.get(url)
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"
        assert not response.headers.get("content-disposition", "").startswith("attachment")
        assert response.headers.get("x-content-type-options") == "nosniff"
        assert response.content == image.getvalue()
