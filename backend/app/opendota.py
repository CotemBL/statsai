"""Thin async client for the OpenDota REST API."""

from __future__ import annotations

from typing import Any

import httpx

from .config import settings

_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=settings.opendota_base_url,
            timeout=httpx.Timeout(20.0, connect=10.0),
            headers={"User-Agent": "DotaDash/1.0 (+https://devin.ai)"},
        )
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


async def od_get(path: str, params: dict[str, Any] | None = None) -> Any:
    client = get_client()
    full_params = dict(params or {})
    if settings.opendota_api_key:
        full_params.setdefault("api_key", settings.opendota_api_key)
    resp = await client.get(path, params=full_params)
    resp.raise_for_status()
    return resp.json()
