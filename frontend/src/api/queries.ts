import { api } from "./client";
import type {
  AuthMe,
  HeroStats,
  MatchDetail,
  Player,
  PlayerHero,
  PlayerTotalRow,
  RecentMatch,
  WinLoss,
} from "./client";

export const fetchAuthMe = () => api.get<AuthMe>("/auth/me").then((r) => r.data);

export const fetchPlayer = (id: string | number) =>
  api.get<Player>(`/players/${id}`).then((r) => r.data);

export const fetchPlayerWL = (id: string | number) =>
  api.get<WinLoss>(`/players/${id}/wl`).then((r) => r.data);

export const fetchPlayerHeroes = (id: string | number) =>
  api.get<PlayerHero[]>(`/players/${id}/heroes`).then((r) => r.data);

export const fetchPlayerTotals = (id: string | number) =>
  api.get<PlayerTotalRow[]>(`/players/${id}/totals`).then((r) => r.data);

export const fetchPlayerRecentMatches = (id: string | number) =>
  api.get<RecentMatch[]>(`/players/${id}/recentMatches`).then((r) => r.data);

export const fetchHeroStats = () =>
  api.get<HeroStats[]>(`/heroStats`).then((r) => r.data);

export const fetchMatch = (id: string | number) =>
  api.get<MatchDetail>(`/matches/${id}`).then((r) => r.data);

export interface SearchResult {
  account_id: number;
  personaname: string;
  avatarfull?: string;
  similarity: number;
  last_match_time?: string;
}

export const searchPlayers = (q: string) =>
  api.get<SearchResult[]>(`/search`, { params: { q } }).then((r) => r.data);
