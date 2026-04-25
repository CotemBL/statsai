import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
});

export interface Player {
  profile: {
    account_id: number;
    personaname: string;
    name?: string;
    avatarfull?: string;
    profileurl?: string;
    last_login?: string;
    loccountrycode?: string;
  };
  rank_tier?: number | null;
  leaderboard_rank?: number | null;
  mmr_estimate?: { estimate: number | null };
  competitive_rank?: number | null;
}

export interface WinLoss {
  win: number;
  lose: number;
}

export interface PlayerHero {
  hero_id: number;
  last_played: number;
  games: number;
  win: number;
  with_games?: number;
  with_win?: number;
  against_games?: number;
  against_win?: number;
}

export interface PlayerTotalRow {
  field: string;
  n: number;
  sum: number;
}

export interface RecentMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  hero_id: number;
  start_time: number;
  duration: number;
  game_mode: number;
  lobby_type: number;
  kills: number;
  deaths: number;
  assists: number;
  gold_per_min: number;
  xp_per_min: number;
  party_size?: number | null;
  lane?: number | null;
  lane_role?: number | null;
}

export interface HeroStats {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  pro_pick: number;
  pro_win: number;
  pro_ban: number;
  "1_pick"?: number;
  "1_win"?: number;
  "2_pick"?: number;
  "2_win"?: number;
  "3_pick"?: number;
  "3_win"?: number;
  "4_pick"?: number;
  "4_win"?: number;
  "5_pick"?: number;
  "5_win"?: number;
  "6_pick"?: number;
  "6_win"?: number;
  "7_pick"?: number;
  "7_win"?: number;
  "8_pick"?: number;
  "8_win"?: number;
  turbo_pick?: number;
  turbo_win?: number;
}

export interface MatchPlayerSlim {
  account_id?: number | null;
  player_slot: number;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  last_hits: number;
  denies: number;
  gold_per_min: number;
  xp_per_min: number;
  hero_damage: number;
  tower_damage: number;
  hero_healing: number;
  level: number;
  net_worth?: number;
  personaname?: string;
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
  gold_t?: number[];
  xp_t?: number[];
}

export interface MatchDetail {
  match_id: number;
  duration: number;
  start_time: number;
  radiant_win: boolean;
  radiant_score: number;
  dire_score: number;
  game_mode: number;
  lobby_type: number;
  players: MatchPlayerSlim[];
  radiant_gold_adv?: number[];
  radiant_xp_adv?: number[];
}

export interface AuthMe {
  authenticated: boolean;
  account_id?: number;
  steam_id?: string;
  personaname?: string;
  avatar?: string;
}
