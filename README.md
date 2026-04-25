# DotaDash — Dota 2 stats & match analysis

Stratz-style dashboard for Dota 2: look up players, browse hero meta and analyse
matches. Powered by the public [OpenDota API](https://docs.opendota.com/) and
"Sign in through Steam" (OpenID 2.0).

## Stack

- **Frontend** — React + TypeScript + Vite + Tailwind CSS, charts via Recharts.
- **Backend** — FastAPI (Python 3.12) + httpx, signed-cookie sessions via
  itsdangerous.
- **Data source** — OpenDota REST API (no key required for normal use).
- **Auth** — Steam OpenID 2.0. The handshake itself is keyless; a Steam Web API
  key is only needed to populate the user's name/avatar after login.

## Project layout

```
backend/   FastAPI app (Steam OpenID + OpenDota proxy)
frontend/  Vite + React app (UI)
```

## Running locally

### Backend

Requires [`uv`](https://github.com/astral-sh/uv).

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Optional environment variables:

| Variable             | Purpose                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| `OPENDOTA_API_KEY`   | Bumps OpenDota rate limit (free tier).                                 |
| `STEAM_API_KEY`      | Enables fetching personaname/avatar after Steam login (free).          |
| `PUBLIC_BASE_URL`    | Where the frontend is served (default `http://localhost:5173`).        |
| `BACKEND_BASE_URL`   | Where this backend is reachable (default `http://localhost:8000`).     |
| `SESSION_SECRET`     | Cookie signing secret (set in production).                             |
| `CORS_ORIGINS`       | Comma-separated list of allowed origins.                               |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api/*` to the backend at `http://localhost:8000` by default.
Override with `VITE_BACKEND_URL`.

## Pages

- `/` — landing & player search.
- `/players/:accountId` — player profile (winrate, KDA, top heroes, recent
  matches, winrate-trend chart).
- `/heroes` — full hero browser with attribute filter.
- `/heroes/:heroId` — hero meta page (winrate / pickrate by skill bracket).
- `/matches/:matchId` — match analysis (gold & XP advantage chart, both teams
  with hero, K/D/A, GPM/XPM, last hits, denies, net worth).

## Auth flow

1. User clicks "Sign in through Steam".
2. Backend redirects to Steam OpenID with a `return_to` URL.
3. Steam redirects back; backend verifies the signature with Steam, extracts
   the `SteamID64`, converts to a Dota `account_id` (Steam32) and writes a
   signed cookie session.
4. User is redirected to their own profile page (`/players/:accountId`).

## License

MIT.
