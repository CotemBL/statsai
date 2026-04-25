import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useHeroes } from "../hooks/useHeroes";
import { ErrorBox, Loading } from "../components/Loading";
import { heroImg } from "../utils/heroes";

export default function HeroesPage() {
  const { heroes, loading, error } = useHeroes();
  const [filter, setFilter] = useState("");
  const [attr, setAttr] = useState<"all" | "str" | "agi" | "int" | "all_attr">(
    "all"
  );

  const list = useMemo(() => {
    if (!heroes) return [];
    return heroes
      .filter((h) =>
        h.localized_name.toLowerCase().includes(filter.toLowerCase())
      )
      .filter((h) => attr === "all" || h.primary_attr === attr)
      .map((h) => {
        const totalPicks = [1, 2, 3, 4, 5, 6, 7, 8].reduce(
          (s, b) => s + (((h as unknown) as Record<string, number>)[`${b}_pick`] ?? 0),
          0
        );
        const totalWins = [1, 2, 3, 4, 5, 6, 7, 8].reduce(
          (s, b) => s + (((h as unknown) as Record<string, number>)[`${b}_win`] ?? 0),
          0
        );
        const wr = totalPicks > 0 ? (totalWins / totalPicks) * 100 : 0;
        return { ...h, totalPicks, wr };
      })
      .sort((a, b) => b.totalPicks - a.totalPicks);
  }, [heroes, filter, attr]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div className="space-y-4">
      <div className="card p-5 flex items-center gap-3 flex-wrap">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter hero…"
          className="bg-bg-card2 border border-white/10 rounded-lg px-3 py-2 placeholder:text-text-dim focus:outline-none focus:border-accent-purple"
        />
        <div className="flex gap-1">
          {(
            [
              ["all", "All"],
              ["str", "STR"],
              ["agi", "AGI"],
              ["int", "INT"],
              ["all_attr", "Universal"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setAttr(k)}
              className={`px-3 py-1.5 rounded text-sm ${
                attr === k
                  ? "bg-accent-purple text-white"
                  : "bg-bg-card2 text-text-muted hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-text-muted">
          {list.length} heroes
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {list.map((h) => (
          <Link
            key={h.id}
            to={`/heroes/${h.id}`}
            className="card p-2 hover:scale-[1.03] transition group"
          >
            <div className="aspect-[16/9] rounded overflow-hidden bg-bg-card2">
              <img
                src={heroImg(h.id)}
                alt={h.localized_name}
                className="w-full h-full object-cover group-hover:brightness-110"
              />
            </div>
            <div className="text-sm font-semibold mt-2 truncate">
              {h.localized_name}
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-0.5">
              <span>{h.totalPicks.toLocaleString()} picks</span>
              <span
                className={
                  h.wr >= 52
                    ? "text-accent-green"
                    : h.wr <= 48
                    ? "text-accent-red"
                    : ""
                }
              >
                {h.wr.toFixed(1)}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
