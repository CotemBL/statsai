export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatRelative(unix: number): string {
  const diff = Date.now() / 1000 - unix;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}mo ago`;
  return `${Math.floor(diff / (86400 * 365))}y ago`;
}

export function formatNumber(n: number | undefined | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function isRadiant(playerSlot: number): boolean {
  return playerSlot < 128;
}

export const RANK_TIERS: Record<number, string> = {
  1: "Herald",
  2: "Guardian",
  3: "Crusader",
  4: "Archon",
  5: "Legend",
  6: "Ancient",
  7: "Divine",
  8: "Immortal",
};

export function rankName(rankTier?: number | null): string {
  if (!rankTier) return "Uncalibrated";
  const tier = Math.floor(rankTier / 10);
  const star = rankTier % 10;
  const name = RANK_TIERS[tier] || "Unknown";
  return star > 0 ? `${name} ${star}` : name;
}

export const GAME_MODES: Record<number, string> = {
  0: "Unknown",
  1: "All Pick",
  2: "Captains Mode",
  3: "Random Draft",
  4: "Single Draft",
  5: "All Random",
  8: "Reverse Captains",
  16: "Captains Draft",
  18: "Ability Draft",
  22: "All Pick Ranked",
  23: "Turbo",
};

export const LANE_ROLES: Record<number, string> = {
  1: "Safe lane",
  2: "Mid lane",
  3: "Off lane",
  4: "Jungle",
};
