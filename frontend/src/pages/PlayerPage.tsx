import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchPlayer,
  fetchPlayerHeroes,
  fetchPlayerRecentMatches,
  fetchPlayerTotals,
  fetchPlayerWL,
} from "../api/queries";
import type {
  Player,
  PlayerHero,
  PlayerTotalRow,
  RecentMatch,
  WinLoss,
} from "../api/client";
import StatBox from "../components/StatBox";
import HeroAvatar from "../components/HeroAvatar";
import { ErrorBox, Loading } from "../components/Loading";
import { useHeroes } from "../hooks/useHeroes";
import {
  formatDuration,
  formatRelative,
  isRadiant,
  rankName,
} from "../utils/format";
import { heroName } from "../utils/heroes";

export default function PlayerPage() {
  const { accountId } = useParams<{ accountId: string }>();
  useHeroes();

  const [player, setPlayer] = useState<Player | null>(null);
  const [wl, setWL] = useState<WinLoss | null>(null);
  const [heroes, setHeroes] = useState<PlayerHero[] | null>(null);
  const [totals, setTotals] = useState<PlayerTotalRow[] | null>(null);
  const [recent, setRecent] = useState<RecentMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setPlayer(null);
    setWL(null);
    setHeroes(null);
    setTotals(null);
    setRecent(null);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    Promise.all([
      fetchPlayer(accountId),
      fetchPlayerWL(accountId),
      fetchPlayerHeroes(accountId),
      fetchPlayerTotals(accountId),
      fetchPlayerRecentMatches(accountId),
    ])
      .then(([p, w, h, t, r]) => {
        setPlayer(p);
        setWL(w);
        setHeroes(h);
        setTotals(t);
        setRecent(r);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [accountId]);

  const winrate = wl ? (wl.win / Math.max(1, wl.win + wl.lose)) * 100 : null;

  const totalsMap = useMemo(() => {
    const m: Record<string, PlayerTotalRow> = {};
    (totals ?? []).forEach((t) => (m[t.field] = t));
    return m;
  }, [totals]);

  const avgKDA = useMemo(() => {
    if (!recent || recent.length === 0) return null;
    const k = recent.reduce((s, m) => s + m.kills, 0) / recent.length;
    const d = recent.reduce((s, m) => s + m.deaths, 0) / recent.length;
    const a = recent.reduce((s, m) => s + m.assists, 0) / recent.length;
    return { k, d, a };
  }, [recent]);

  const winrateChart = useMemo(() => {
    if (!recent) return [];
    const sorted = [...recent].sort((a, b) => a.start_time - b.start_time);
    let wins = 0;
    let total = 0;
    return sorted.map((m) => {
      total += 1;
      const won =
        (m.radiant_win && isRadiant(m.player_slot)) ||
        (!m.radiant_win && !isRadiant(m.player_slot));
      if (won) wins += 1;
      return {
        date: new Date(m.start_time * 1000).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        winrate: Math.round((wins / total) * 100),
      };
    });
  }, [recent]);

  if (error) return <ErrorBox message={error} />;
  if (!player) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="card p-6 flex gap-6 items-center flex-wrap">
        {player.profile.avatarfull && (
          <img
            src={player.profile.avatarfull}
            alt=""
            className="w-20 h-20 rounded-xl border border-white/10"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-extrabold">
            {player.profile.personaname}
          </div>
          <div className="text-sm text-text-muted">
            Account ID: {player.profile.account_id}
            {player.profile.loccountrycode &&
              ` · ${player.profile.loccountrycode}`}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="bg-accent-purple/20 text-accent-purple2 px-2 py-1 rounded">
              {rankName(player.rank_tier)}
            </span>
            {player.leaderboard_rank && (
              <span className="bg-accent-yellow/20 text-accent-yellow px-2 py-1 rounded">
                Leaderboard #{player.leaderboard_rank}
              </span>
            )}
            {player.mmr_estimate?.estimate && (
              <span className="bg-bg-card2 px-2 py-1 rounded text-text-muted">
                MMR est. {player.mmr_estimate.estimate}
              </span>
            )}
          </div>
        </div>
        {wl && (
          <div className="flex gap-3">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-accent-green">
                {wl.win}
              </div>
              <div className="stat-label">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-accent-red">
                {wl.lose}
              </div>
              <div className="stat-label">Losses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-accent-purple2">
                {winrate?.toFixed(1)}%
              </div>
              <div className="stat-label">Winrate</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox
          label="Avg GPM"
          value={Math.round(totalsMap.gold_per_min?.sum / Math.max(1, totalsMap.gold_per_min?.n || 1)) || "—"}
          accent="yellow"
        />
        <StatBox
          label="Avg XPM"
          value={Math.round(totalsMap.xp_per_min?.sum / Math.max(1, totalsMap.xp_per_min?.n || 1)) || "—"}
          accent="blue"
        />
        <StatBox
          label="Avg Kills"
          value={
            avgKDA
              ? avgKDA.k.toFixed(1)
              : Math.round(
                  totalsMap.kills?.sum / Math.max(1, totalsMap.kills?.n || 1)
                ) || "—"
          }
          accent="green"
        />
        <StatBox
          label="Avg Deaths"
          value={
            avgKDA
              ? avgKDA.d.toFixed(1)
              : Math.round(
                  totalsMap.deaths?.sum / Math.max(1, totalsMap.deaths?.n || 1)
                ) || "—"
          }
          accent="red"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Winrate trend (recent)</h2>
            <span className="text-xs text-text-muted">last {recent?.length ?? 0} matches</span>
          </div>
          {winrateChart.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={winrateChart}>
                  <defs>
                    <linearGradient id="wrFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2A2C5A" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1B36",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    labelStyle={{ color: "#E5E7EB" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="winrate"
                    stroke="#A78BFA"
                    fill="url(#wrFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-text-muted text-sm">No data yet.</div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-3">Top heroes</h2>
          <div className="space-y-2">
            {(heroes ?? []).slice(0, 8).map((h) => {
              const wr = h.games > 0 ? (h.win / h.games) * 100 : 0;
              return (
                <Link
                  key={h.hero_id}
                  to={`/heroes/${h.hero_id}`}
                  className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-bg-hover"
                >
                  <HeroAvatar heroId={h.hero_id} size="sm" link={false} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{heroName(h.hero_id)}</div>
                    <div className="text-xs text-text-muted">
                      {h.games} games · {wr.toFixed(1)}% wr
                    </div>
                  </div>
                </Link>
              );
            })}
            {!heroes && <div className="text-text-muted text-sm">Loading…</div>}
            {heroes && heroes.length === 0 && (
              <div className="text-text-muted text-sm">No data</div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-3">Recent matches</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left py-2">Hero</th>
                <th className="text-left">Result</th>
                <th className="text-left">Duration</th>
                <th className="text-left">K/D/A</th>
                <th className="text-left">GPM</th>
                <th className="text-left">XPM</th>
                <th className="text-left">When</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).map((m) => {
                const won =
                  (m.radiant_win && isRadiant(m.player_slot)) ||
                  (!m.radiant_win && !isRadiant(m.player_slot));
                return (
                  <tr
                    key={m.match_id}
                    className="border-t border-white/5 hover:bg-bg-hover"
                  >
                    <td className="py-2">
                      <HeroAvatar heroId={m.hero_id} size="sm" />
                    </td>
                    <td
                      className={
                        won
                          ? "text-accent-green font-semibold"
                          : "text-accent-red font-semibold"
                      }
                    >
                      {won ? "Win" : "Loss"}
                    </td>
                    <td>{formatDuration(m.duration)}</td>
                    <td>
                      {m.kills}/{m.deaths}/{m.assists}
                    </td>
                    <td>{m.gold_per_min}</td>
                    <td>{m.xp_per_min}</td>
                    <td className="text-text-muted">
                      {formatRelative(m.start_time)}
                    </td>
                    <td>
                      <Link
                        to={`/matches/${m.match_id}`}
                        className="text-accent-purple2 hover:underline text-xs"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {recent && recent.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-text-muted">
                    No recent matches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
