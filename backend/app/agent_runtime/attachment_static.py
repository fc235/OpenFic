"""Serve original user documents as downloads while preserving safe image previews."""
import mimetypes

from starlette.responses import Response
from starlette.staticfiles import StaticFiles
from starlette.types import Scope

from app.agent_runtime.attachments import SUPPORTED_IMAGE_MIME_TYPES


class AgentAttachmentStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope: Scope) -> Response:
        response = await super().get_response(path, scope)
        response.headers["X-Content-Type-Options"] = "nosniff"
        # 304 responses omit Content-Type; keep the same policy for cached files.
        mime_type = response.headers.get("content-type") or mimetypes.guess_type(path)[0] or ""
        if mime_type.split(";", 1)[0] not in SUPPORTED_IMAGE_MIME_TYPES:
            response.headers["Content-Disposition"] = "attachment"
            response.headers["Content-Security-Policy"] = (
                "sandbox; default-src 'none'; base-uri 'none'; form-action 'none'"
            )
            response.headers["Cache-Control"] = "no-store"
        return response
