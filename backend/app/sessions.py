"""Tiny signed-cookie session helpers (no DB)."""

from __future__ import annotations

import os
from typing import Any, Literal

from fastapi import Request, Response
from itsdangerous import BadSignature, URLSafeSerializer

from .config import settings

SESSION_COOKIE = "dd_session"
_serializer = URLSafeSerializer(settings.session_secret, salt="session")


def _cookie_kwargs() -> dict[str, Any]:
    """Pick cross-site cookie attrs based on whether the backend runs over HTTPS.

    When the public backend URL is https (typical prod deploy), the frontend may
    live on a different domain — so the session cookie must be ``SameSite=None;
    Secure`` to be sent on the cross-site /api/auth/me request after the Steam
    OpenID redirect chain.
    """

    is_https = settings.backend_base_url.startswith("https://") or os.getenv(
        "FORCE_SECURE_COOKIE"
    ) == "1"
    samesite: Literal["lax", "none"] = "none" if is_https else "lax"
    return {
        "max_age": 60 * 60 * 24 * 30,
        "httponly": True,
        "samesite": samesite,
        "secure": is_https,
        "path": "/",
    }


def read_session(request: Request) -> dict[str, Any]:
    raw = request.cookies.get(SESSION_COOKIE)
    if not raw:
        return {}
    try:
        loaded = _serializer.loads(raw)
        if isinstance(loaded, dict):
            return loaded
    except BadSignature:
        return {}
    return {}


def write_session(response: Response, data: dict[str, Any]) -> None:
    token = _serializer.dumps(data)
    response.set_cookie(SESSION_COOKIE, token, **_cookie_kwargs())


def clear_session(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/")
