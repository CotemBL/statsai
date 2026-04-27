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

export interface ElectronAPI {
  gsi: {
    start: () => Promise<void>
    stop: () => Promise<void>
    getState: () => Promise<GSIMatchState | null>
    getStatus: () => Promise<boolean>
    installConfig: () => Promise<{ success: boolean; path: string | null; error: string | null }>
    installConfigManual: (dotaPath: string) => Promise<{ success: boolean; path: string | null; error: string | null }>
    isInstalled: () => Promise<boolean>
    onStateUpdate: (callback: (state: GSIMatchState) => void) => () => void
  }
  app: {
    getVersion: () => Promise<string>
    quit: () => void
    minimize: () => void
    maximize: () => void
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
