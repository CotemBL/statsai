"""FastAPI app: Steam OpenID auth + OpenDota proxy."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from .config import settings
from .opendota import close_client, od_get
from .sessions import clear_session, read_session, write_session
from .steam_auth import (
    build_login_url,
    fetch_steam_summary,
    steam_id_to_account_id,
    verify_response,
)

log = logging.getLogger("dotadash")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield
    await close_client()


app = FastAPI(title="DotaDash backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


# ---- Auth ------------------------------------------------------------------


@app.get("/api/auth/me")
async def auth_me(request: Request) -> dict[str, Any]:
    sess = read_session(request)
    if not sess.get("steam_id"):
        return {"authenticated": False}
    return {
        "authenticated": True,
        "steam_id": sess.get("steam_id"),
        "account_id": sess.get("account_id"),
        "personaname": sess.get("personaname"),
        "avatar": sess.get("avatar"),
    }


@app.get("/api/auth/steam/login")
async def steam_login() -> RedirectResponse:
    return_url = f"{settings.backend_base_url}/api/auth/steam/return"
    realm = settings.backend_base_url
    url = build_login_url(return_url=return_url, realm=realm)
    return RedirectResponse(url)


@app.get("/api/auth/steam/return")
async def steam_return(request: Request) -> Response:
    params = {k: v for k, v in request.query_params.items()}
    steam_id_64 = await verify_response(params)
    if not steam_id_64:
        raise HTTPException(status_code=400, detail="Invalid Steam OpenID response")

    account_id = steam_id_to_account_id(steam_id_64)
    summary = await fetch_steam_summary(steam_id_64)

    response = RedirectResponse(
        f"{settings.public_base_url}/players/{account_id}", status_code=302
    )
    write_session(
        response,
        {
            "steam_id": steam_id_64,
            "account_id": account_id,
            "personaname": (summary or {}).get("personaname"),
            "avatar": (summary or {}).get("avatarfull"),
        },
    )
    return response


@app.get("/api/auth/logout")
async def logout() -> Response:
    response = RedirectResponse(settings.public_base_url, status_code=302)
    clear_session(response)
    return response


# ---- OpenDota proxy --------------------------------------------------------


def _od_handle_error(exc: httpx.HTTPStatusError) -> JSONResponse:
    log.warning("OpenDota error %s: %s", exc.response.status_code, exc.response.text[:200])
    return JSONResponse(
        status_code=exc.response.status_code,
        content={"error": "opendota_error", "detail": exc.response.text[:500]},
    )


@app.get("/api/players/{account_id}")
async def player(account_id: int) -> Any:
    try:
        return await od_get(f"/players/{account_id}")
    except httpx.HTTPStatusError as e:
        return _od_handle_error(e)


@app.get("/api/players/{account_id}/wl")
async def player_wl(account_id: int) -> Any:
    try:
        return await od_get(f"/players/{account_id}/wl")
    except httpx.HTTPStatusError as e:
        return _od_handle_error(e)


@app.get("/api/players/{account_id}/heroes")
async def player_heroes(account_id: int) -> Any:
    try:
        return await od_get(f"/players/{account_id}/heroes")
    except httpx.HTTPStatusError as e:
        return _od_handle_error(e)


@app.get("/api/players/{account_id}/totals")
async def player_totals(account_id: int) -> Any:
    try:
        return await od_get(f"/players/{account_id}/totals")
    except httpx.HTTPStatusError as e:
        return _od_handle_error(e)


@app.get("/api/players/{account_id}/recentMatches")
async def player_recent(account_id: int) -> Any:
    try:
        return await od_get(f"/players/{account_id}/recentMatches")
    except httpx.HTTPStatusError as e:
        return _od_handle_error(e)


@app.get("/api/heroStats")
async def hero_stats() -> Any:
    try:
        return await od_get("/heroStats")
    except httpx.HTTPStatusError as e:
        return _od_handle_error(e)


@app.get("/api/matches/{match_id}")
async def match(match_id: int) -> Any:
    try:
        return await od_get(f"/matches/{match_id}")
    except httpx.HTTPStatusError as e:
        return _od_handle_error(e)


@app.get("/api/search")
async def search(q: str = Query(..., min_length=1)) -> Any:
    try:
        return await od_get("/search", params={"q": q})
    except httpx.HTTPStatusError as e:
        return _od_handle_error(e)
