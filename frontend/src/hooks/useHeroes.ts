import { useEffect, useState } from "react";
import { fetchHeroStats } from "../api/queries";
import { setHeroMap } from "../utils/heroes";
import type { HeroStats } from "../api/client";

let cached: HeroStats[] | null = null;
let inflight: Promise<HeroStats[]> | null = null;

export function useHeroes() {
  const [heroes, setHeroes] = useState<HeroStats[] | null>(cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cached) {
      setHeroMap(cached);
      return;
    }
    if (!inflight) {
      inflight = fetchHeroStats();
    }
    inflight
      .then((data) => {
        cached = data;
        setHeroMap(data);
        setHeroes(data);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e))
      );
  }, []);

  return { heroes, loading: !heroes && !error, error };
}
