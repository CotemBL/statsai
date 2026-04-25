import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { searchPlayers } from "../api/queries";
import type { SearchResult } from "../api/queries";
import { useHeroes } from "../hooks/useHeroes";
import { allHeroes, heroImg } from "../utils/heroes";

export default function HomePage() {
  useHeroes();
  const [params] = useSearchParams();
  const initial = params.get("search") ?? "";
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const term = initial.trim();
    if (!term) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    searchPlayers(term)
      .then(setResults)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [initial]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    if (/^\d+$/.test(term)) {
      navigate(`/players/${term}`);
      return;
    }
    navigate(`/?search=${encodeURIComponent(term)}`);
  }

  const featured = allHeroes()
    .slice()
    .sort((a, b) => (b.pro_pick ?? 0) - (a.pro_pick ?? 0))
    .slice(0, 12);

  return (
    <div className="space-y-8">
      <section className="card p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/30 via-transparent to-accent-pink/20 pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-accent-purple2 to-accent-pink bg-clip-text text-transparent">
              DotaDash
            </span>{" "}
            — Dota 2 stats & match analysis
          </h1>
          <p className="text-text-muted mt-3 max-w-xl">
            Look up any player by Steam32 ID or nickname, drill into hero meta,
            and analyse matches. Powered by the OpenDota public API.
          </p>
          <form onSubmit={onSubmit} className="mt-6 flex gap-2 max-w-xl">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. 88550049 or Miracle-"
              className="flex-1 bg-bg-card2 border border-white/10 rounded-lg px-4 py-2.5 placeholder:text-text-dim focus:outline-none focus:border-accent-purple"
            />
            <button className="btn-primary">Search</button>
          </form>
          <p className="text-xs text-text-dim mt-3">
            Tip: your Steam32 (Dota) ID is the last number in your Steam profile
            URL minus 76561197960265728. Or just{" "}
            <a
              href="/api/auth/steam/login"
              className="text-accent-purple2 hover:underline"
            >
              sign in with Steam
            </a>
            .
          </p>
        </div>
      </section>

      {loading && <div className="text-text-muted">Searching…</div>}
      {error && <div className="card p-4 text-accent-red">Error: {error}</div>}
      {results && results.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-3">Search results</h2>
          <div className="grid gap-2">
            {results.slice(0, 20).map((p) => (
              <Link
                key={p.account_id}
                to={`/players/${p.account_id}`}
                className="card px-4 py-3 flex items-center gap-3 hover:bg-bg-hover transition"
              >
                {p.avatarfull && (
                  <img
                    src={p.avatarfull}
                    alt=""
                    className="w-10 h-10 rounded-full border border-white/10"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{p.personaname}</div>
                  <div className="text-xs text-text-muted">
                    Account ID: {p.account_id}
                  </div>
                </div>
                {p.last_match_time && (
                  <div className="text-xs text-text-dim">
                    Last match {new Date(p.last_match_time).toLocaleDateString()}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
      {results && results.length === 0 && (
        <div className="text-text-muted">No players found.</div>
      )}

      <section>
        <h2 className="text-lg font-bold mb-3">Top picked heroes (Pro)</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {featured.map((h) => (
            <Link
              key={h.id}
              to={`/heroes/${h.id}`}
              className="card p-2 hover:scale-105 transition group"
            >
              <div className="aspect-[16/9] rounded overflow-hidden bg-bg-card2">
                <img
                  src={heroImg(h.id)}
                  alt={h.localized_name}
                  className="w-full h-full object-cover group-hover:brightness-110"
                />
              </div>
              <div className="text-xs mt-2 truncate">{h.localized_name}</div>
              <div className="text-[10px] text-text-muted">
                {h.pro_pick} picks
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
