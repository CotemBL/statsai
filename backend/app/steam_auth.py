"""Steam OpenID 2.0 'Sign in through Steam' implementation.

Reference: https://partner.steamgames.com/doc/features/auth#website
The handshake itself does NOT require a Steam Web API key. We only need the key
afterwards if we want to fetch the user's profile (name + avatar) via
ISteamUser/GetPlayerSummaries.
"""

from __future__ import annotations

import re
import urllib.parse
from typing import Any

import httpx

from .config import settings

OPENID_NS = "http://specs.openid.net/auth/2.0"
STEAM_OPENID_LOGIN = "https://steamcommunity.com/openid/login"
STEAM_ID_RE = re.compile(r"^https?://steamcommunity\.com/openid/id/(\d+)$")


def build_login_url(*, return_url: str, realm: str) -> str:
    params = {
        "openid.ns": OPENID_NS,
        "openid.mode": "checkid_setup",
        "openid.return_to": return_url,
        "openid.realm": realm,
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    }
    return f"{STEAM_OPENID_LOGIN}?{urllib.parse.urlencode(params)}"


async def verify_response(query_params: dict[str, str]) -> str | None:
    """Verify the OpenID response with Steam and return the 64-bit Steam ID."""

    payload: dict[str, str] = {}
    for key, value in query_params.items():
        if key.startswith("openid."):
            payload[key] = value
    if payload.get("openid.mode") != "id_res":
        return None
    payload["openid.mode"] = "check_authentication"

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(STEAM_OPENID_LOGIN, data=payload)
        if resp.status_code != 200:
            return None
        body = resp.text
        if "is_valid:true" not in body:
            return None

    claimed = query_params.get("openid.claimed_id", "")
    match = STEAM_ID_RE.match(claimed)
    if not match:
        return None
    return match.group(1)


async def fetch_steam_summary(steam_id_64: str) -> dict[str, Any] | None:
    """Optional: pull personaname/avatar via ISteamUser/GetPlayerSummaries."""

    if not settings.steam_api_key:
        return None
    url = (
        "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
        f"?key={settings.steam_api_key}&steamids={steam_id_64}"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            return None
        data = resp.json()
        players = data.get("response", {}).get("players", [])
        return players[0] if players else None


def steam_id_to_account_id(steam_id_64: str) -> int:
    """Convert SteamID64 to Dota account_id (lower 32 bits / Steam32)."""

    return int(steam_id_64) - 76561197960265728
