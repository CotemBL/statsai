// Minimal hero map keyed by id. Full data is loaded from /api/heroStats.
// We lazily fill this map when heroStats is fetched.
import type { HeroStats } from "../api/client";

let heroMap: Record<number, HeroStats> = {};

export function setHeroMap(stats: HeroStats[]) {
  heroMap = Object.fromEntries(stats.map((h) => [h.id, h]));
}

export function getHero(id: number): HeroStats | undefined {
  return heroMap[id];
}

export function heroName(id: number): string {
  return heroMap[id]?.localized_name || `Hero ${id}`;
}

export function heroImg(id: number): string {
  const h = heroMap[id];
  if (!h) return "";
  // OpenDota returns relative path like "/apps/dota2/images/dota_react/heroes/abaddon.png?"
  return `https://cdn.cloudflare.steamstatic.com${h.img}`;
}

export function heroIcon(id: number): string {
  const h = heroMap[id];
  if (!h) return "";
  return `https://cdn.cloudflare.steamstatic.com${h.icon}`;
}

export function allHeroes(): HeroStats[] {
  return Object.values(heroMap);
}
