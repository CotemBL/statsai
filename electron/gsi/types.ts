export interface GSIPlayer {
  steamid: string
  name: string
  team: 'radiant' | 'dire' | 'spectator' | 'none'
  hero?: string
  kills?: number
  deaths?: number
  assists?: number
  level?: number
  gold?: number
  gpm?: number
  xpm?: number
}

export interface GSIMatchState {
  matchId: string | null
  gameTime: number
  gameState: string
  radiantScore: number
  direScore: number
  players: GSIPlayer[]
  timestamp: number
}

export interface GSIRawPayload {
  provider?: {
    name: string
    appid: number
    version: number
    timestamp: number
  }
  map?: {
    name: string
    matchid: string
    game_time: number
    clock_time: number
    daytime: boolean
    nightstalker_night: boolean
    game_state: string
    paused: boolean
    win_team: string
    customgamename: string
    ward_purchase_cooldown: number
    radiant_score?: number
    dire_score?: number
  }
  player?: {
    steamid: string
    name: string
    activity: string
    kills: number
    deaths: number
    assists: number
    last_hits: number
    denies: number
    kill_streak: number
    commands_issued: number
    team_name: string
    gold: number
    gold_reliable: number
    gold_unreliable: number
    gold_from_hero_kills: number
    gold_from_creep_kills: number
    gold_from_income: number
    gold_from_shared: number
    gpm: number
    xpm: number
  }
  hero?: {
    id: number
    name: string
    level: number
    xp: number
    alive: boolean
    respawn_seconds: number
    buyback_cost: number
    buyback_cooldown: number
    health: number
    max_health: number
    health_percent: number
    mana: number
    max_mana: number
    mana_percent: number
    silenced: boolean
    stunned: boolean
    disarmed: boolean
    magicimmune: boolean
    hexed: boolean
    muted: boolean
    break_: boolean
    aghanims_scepter: boolean
    aghanims_shard: boolean
    talent_1: boolean
    talent_2: boolean
    talent_3: boolean
    talent_4: boolean
    talent_5: boolean
    talent_6: boolean
    talent_7: boolean
    talent_8: boolean
  }
  allplayers?: Record<string, {
    steamid: string
    name: string
    team: number
    kills: number
    deaths: number
    assists: number
    last_hits: number
    denies: number
    gold: number
    gpm: number
    xpm: number
    level?: number
    hero_id?: number
  }>
}
