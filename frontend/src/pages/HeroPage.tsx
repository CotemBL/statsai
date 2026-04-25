import { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useHeroes } from "../hooks/useHeroes";
import { ErrorBox, Loading } from "../components/Loading";
import { heroImg } from "../utils/heroes";
import StatBox from "../components/StatBox";

const BRACKETS = [
  { id: 1, label: "Herald" },
  { id: 2, label: "Guardian" },
  { id: 3, label: "Crusader" },
  { id: 4, label: "Archon" },
  { id: 5, label: "Legend" },
  { id: 6, label: "Ancient" },
  { id: 7, label: "Divine" },
  { id: 8, label: "Immortal" },
];

export default function HeroPage() {
  const { heroId } = useParams<{ heroId: string }>();
  const { heroes, loading, error } = useHeroes();
  const id = Number(heroId);

  const hero = useMemo(
    () => heroes?.find((h) => h.id === id),
    [heroes, id]
  );

  const chartData = useMemo(() => {
    if (!hero) return [];
    const h = (hero as unknown) as Record<string, number>;
    return BRACKETS.map((b) => {
      const picks = h[`${b.id}_pick`] ?? 0;
      const wins = h[`${b.id}_win`] ?? 0;
      const wr = picks > 0 ? (wins / picks) * 100 : 0;
      return { bracket: b.label, picks, wr: Number(wr.toFixed(2)) };
    });
  }, [hero]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!hero) return <ErrorBox message="Hero not found" />;

  const proWR =
    hero.pro_pick > 0 ? (hero.pro_win / hero.pro_pick) * 100 : 0;
  const totalPicks = chartData.reduce((s, r) => s + r.picks, 0);
  const totalWR =
    totalPicks > 0
      ? (chartData.reduce((s, r) => s + (r.picks * r.wr) / 100, 0) / totalPicks) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="card p-6 flex gap-6 items-center flex-wrap">
        <div className="w-40 h-24 rounded-lg overflow-hidden bg-bg-card2 border border-white/10">
          <img
            src={heroImg(hero.id)}
            alt={hero.localized_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-3xl font-extrabold">{hero.localized_name}</div>
          <div className="text-sm text-text-muted">
            {hero.attack_type} ·{" "}
            <span className="uppercase">{hero.primary_attr}</span> ·{" "}
            {hero.roles.join(", ")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox
          label="Total picks (pub)"
          value={totalPicks.toLocaleString()}
          accent="purple"
        />
        <StatBox
          label="Pub winrate"
          value={`${totalWR.toFixed(1)}%`}
          accent={totalWR >= 50 ? "green" : "red"}
        />
        <StatBox
          label="Pro picks"
          value={hero.pro_pick.toLocaleString()}
          accent="blue"
        />
        <StatBox
          label="Pro winrate"
          value={`${proWR.toFixed(1)}%`}
          hint={`Banned ${hero.pro_ban}× in pro`}
          accent="yellow"
        />
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-3">Winrate by skill bracket</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid stroke="#2A2C5A" strokeDasharray="3 3" />
              <XAxis dataKey="bracket" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
              <YAxis
                domain={[40, 60]}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: "#1A1B36",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                formatter={(value, name) => {
                  if (name === "wr") return [`${value}%`, "Winrate"];
                  return [value, name];
                }}
              />
              <Bar dataKey="wr" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.wr >= 50 ? "#34D399" : "#EF4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-3">Pickrate by skill bracket</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid stroke="#2A2C5A" strokeDasharray="3 3" />
              <XAxis dataKey="bracket" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} width={50} />
              <Tooltip
                contentStyle={{
                  background: "#1A1B36",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
              <Bar dataKey="picks" radius={[6, 6, 0, 0]} fill="#A78BFA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
