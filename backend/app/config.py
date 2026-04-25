"""Runtime configuration loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass


def _is_fly() -> bool:
    return bool(os.getenv("FLY_APP_NAME"))


def _default_backend_url() -> str:
    if _is_fly():
        return f"https://{os.environ['FLY_APP_NAME']}.fly.dev"
    return "http://localhost:8000"


def _default_public_url() -> str:
    # When deployed on Fly we usually pair with a devinapps.com static site.
    # Allow overriding via PUBLIC_BASE_URL; otherwise fall back to local dev.
    return os.getenv("PUBLIC_BASE_URL") or "http://localhost:5173"


def _default_cors() -> str:
    if _is_fly():
        # Allow any origin during preview; tighten via CORS_ORIGINS in prod.
        return "*"
    return "http://localhost:5173,http://127.0.0.1:5173"


@dataclass(frozen=True)
class Settings:
    opendota_base_url: str = os.getenv(
        "OPENDOTA_BASE_URL", "https://api.opendota.com/api"
    )
    # Optional API key (raises rate limit). Free without one.
    opendota_api_key: str | None = os.getenv("OPENDOTA_API_KEY") or None

    # Required for resolving Steam vanity URLs and reading the user's profile
    # after the OpenID handshake. The handshake itself does NOT require a key.
    steam_api_key: str | None = os.getenv("STEAM_API_KEY") or None

    # Public origin where the frontend is hosted (used to redirect after auth).
    public_base_url: str = _default_public_url()
    # Public origin where this backend is reachable. OpenID return URL goes here.
    backend_base_url: str = os.getenv("BACKEND_BASE_URL") or _default_backend_url()

    session_secret: str = os.getenv(
        "SESSION_SECRET", "dev-secret-change-me-please-32bytes-min"
    )

    # Comma-separated list of allowed origins. "*" allows any origin (with
    # credentials disabled by Starlette).
    cors_origins: tuple[str, ...] = tuple(
        s.strip()
        for s in (os.getenv("CORS_ORIGINS") or _default_cors()).split(",")
        if s.strip()
    )


settings = Settings()
