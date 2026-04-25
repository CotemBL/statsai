"""Tiny signed-cookie session helpers (no DB)."""

from __future__ import annotations

import json
from typing import Any

from fastapi import Request, Response
from itsdangerous import BadSignature, URLSafeSerializer

from .config import settings

SESSION_COOKIE = "dd_session"
_serializer = URLSafeSerializer(settings.session_secret, salt="session")


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
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=60 * 60 * 24 * 30,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )


def clear_session(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/")


def dump_for_log(data: dict[str, Any]) -> str:
    return json.dumps(data, default=str)
