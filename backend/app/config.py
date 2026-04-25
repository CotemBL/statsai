"""Runtime configuration loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass


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

    # Public origin where the frontend is hosted (used for OpenID realm/return).
    public_base_url: str = os.getenv("PUBLIC_BASE_URL", "http://localhost:5173")
    # Public origin where this backend is reachable. OpenID return URL goes here.
    backend_base_url: str = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")

    session_secret: str = os.getenv(
        "SESSION_SECRET", "dev-secret-change-me-please-32bytes-min"
    )

    # Permissive defaults for local dev; tighten via env in prod if desired.
    cors_origins: tuple[str, ...] = tuple(
        s.strip()
        for s in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if s.strip()
    )


settings = Settings()
