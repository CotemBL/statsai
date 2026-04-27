import { GSIRawPayload, GSIPlayer, GSIMatchState } from './types'

function getTeamName(teamNumber: number): GSIPlayer['team'] {
  switch (teamNumber) {
    case 2: return 'radiant'
    case 3: return 'dire'
    default: return 'none'
  }
}

export function parseGSIPayload(data: GSIRawPayload): GSIMatchState {
  const players: GSIPlayer[] = []

  if (data.allplayers) {
    for (const [slot, playerData] of Object.entries(data.allplayers)) {
      players.push({
        steamid: playerData.steamid || slot,
        name: playerData.name,
        team: getTeamName(playerData.team),
        kills: playerData.kills,
        deaths: playerData.deaths,
        assists: playerData.assists,
        level: playerData.level,
        gold: playerData.gold,
        gpm: playerData.gpm,
        xpm: playerData.xpm,
      })
    }
  } else if (data.player) {
    players.push({
      steamid: data.player.steamid,
      name: data.player.name,
      team: data.player.team_name === 'radiant' ? 'radiant' : data.player.team_name === 'dire' ? 'dire' : 'none',
      kills: data.player.kills,
      deaths: data.player.deaths,
      assists: data.player.assists,
      gold: data.player.gold,
      gpm: data.player.gpm,
      xpm: data.player.xpm,
    })
  }

  if (data.hero && players.length > 0) {
    players[0].hero = data.hero.name
    players[0].level = data.hero.level
  }

  return {
    matchId: data.map?.matchid ?? null,
    gameTime: data.map?.game_time ?? 0,
    gameState: data.map?.game_state ?? 'unknown',
    radiantScore: data.map?.radiant_score ?? 0,
    direScore: data.map?.dire_score ?? 0,
    players,
    timestamp: data.provider?.timestamp ?? Date.now(),
  }
}

export function extractSteamIds(data: GSIRawPayload): string[] {
  const ids: string[] = []

  if (data.allplayers) {
    for (const playerData of Object.values(data.allplayers)) {
      if (playerData.steamid) {
        ids.push(playerData.steamid)
      }
    }
  } else if (data.player?.steamid) {
    ids.push(data.player.steamid)
  }

  return [...new Set(ids)]
}

export function steamId64ToSteamId32(steamId64: string): number {
  const id64 = BigInt(steamId64)
  return Number(id64 - BigInt('76561197960265728'))
}

export function steamId32ToSteamId64(steamId32: number): string {
  return (BigInt(steamId32) + BigInt('76561197960265728')).toString()
}
