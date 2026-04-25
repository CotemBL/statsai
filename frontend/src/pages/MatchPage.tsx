import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchMatch } from "../api/queries";
import type { MatchDetail, MatchPlayerSlim } from "../api/client";
import { ErrorBox, Loading } from "../components/Loading";
import HeroAvatar from "../components/HeroAvatar";
import { useHeroes } from "../hooks/useHeroes";
import { formatDuration, GAME_MODES, isRadiant } from "../utils/format";

export default function MatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  useHeroes();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatch(null);
    setError(null);
    fetchMatch(matchId)
      .then(setMatch)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [matchId]);

  if (error) return <ErrorBox message={error} />;
  if (!match) return <Loading />;

  const radiant = match.players.filter((p) => isRadiant(p.player_slot));
  const dire = match.players.filter((p) => !isRadiant(p.player_slot));

  const chartData = (match.radiant_gold_adv ?? []).map((g, i) => ({
    minute: i,
    gold: g,
    xp: match.radiant_xp_adv?.[i] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="text-xs text-text-muted">Match</div>
            <div className="text-2xl font-extrabold">{match.match_id}</div>
          </div>
          <div className="flex-1" />
          <div className="text-right">
            <div className="text-xs text-text-muted">
              {GAME_MODES[match.game_mode] || `Mode ${match.game_mode}`}
            </div>
            <div>
              {new Date(match.start_time * 1000).toLocaleString()} ·{" "}
              {formatDuration(match.duration)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-2xl font-bold">
          <div
            className={
              match.radiant_win
                ? "text-accent-green"
                : "text-text-muted"
            }
          >
            Radiant {match.radiant_score}
          </div>
          <span className="text-text-dim">vs</span>
          <div
            className={
              !match.radiant_win
                ? "text-accent-red"
                : "text-text-muted"
            }
          >
            Dire {match.dire_score}
          </div>
          <span className="ml-auto text-sm bg-bg-card2 px-3 py-1 rounded">
            {match.radiant_win ? "Radiant Victory" : "Dire Victory"}
          </span>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold mb-3">Gold & XP advantage (Radiant ↑)</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#2A2C5A" strokeDasharray="3 3" />
                <XAxis
                  dataKey="minute"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  label={{
                    value: "min",
                    position: "insideBottomRight",
                    fill: "#6B7280",
                    fontSize: 10,
                  }}
                />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} width={60} />
                <Tooltip
                  contentStyle={{
                    background: "#1A1B36",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
                <ReferenceLine y={0} stroke="#6B7280" />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gold"
                  stroke="#FBBF24"
                  dot={false}
                  name="Gold adv"
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#A78BFA"
                  dot={false}
                  name="XP adv"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <TeamTable
          title="Radiant"
          color="text-accent-green"
          players={radiant}
        />
        <TeamTable title="Dire" color="text-accent-red" players={dire} />
      </div>
    </div>
  );
}

function TeamTable({
  title,
  color,
  players,
}: {
  title: string;
  color: string;
  players: MatchPlayerSlim[];
}) {
  return (
    <div className="card p-4">
      <h3 className={`font-bold mb-2 ${color}`}>{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="text-left py-2">Hero</th>
              <th className="text-left">Player</th>
              <th className="text-left">K/D/A</th>
              <th className="text-left">GPM</th>
              <th className="text-left">XPM</th>
              <th className="text-left">LH/DN</th>
              <th className="text-left">Net</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr
                key={p.player_slot}
                className="border-t border-white/5 hover:bg-bg-hover"
              >
                <td className="py-2">
                  <HeroAvatar heroId={p.hero_id} size="sm" />
                </td>
                <td>
                  {p.account_id ? (
                    <Link
                      to={`/players/${p.account_id}`}
                      className="hover:underline"
                    >
                      {p.personaname || p.account_id}
                    </Link>
                  ) : (
                    <span className="text-text-muted">Anonymous</span>
                  )}
                </td>
                <td>
                  {p.kills}/{p.deaths}/{p.assists}
                </td>
                <td>{p.gold_per_min}</td>
                <td>{p.xp_per_min}</td>
                <td>
                  {p.last_hits}/{p.denies}
                </td>
                <td>{p.net_worth?.toLocaleString() ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
