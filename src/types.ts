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

export type ModId = 'reverseEngineering' | 'steamidGrabber'

export interface ModsConfig {
  reverseEngineering: {
    enabled: boolean
  }
  steamidGrabber: {
    enabled: boolean
    targetUrl: string
  }
}

export interface GrabberStatus {
  sentCount: number
  lastSentAt: number | null
  lastError: string | null
  lastMatchId: string | null
}

export interface LaunchResult {
  success: boolean
  error?: string | null
}

export interface OverlayBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface OverlayPushState {
  matchState: GSIMatchState | null
  rawPayload: unknown
  grabberStatus: GrabberStatus
  modsConfig: ModsConfig
  isConnected: boolean
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
    onRawPayload: (callback: (payload: unknown) => void) => () => void
  }
  app: {
    getVersion: () => Promise<string>
    quit: () => void
    minimize: () => void
    maximize: () => void
  }
  mods: {
    get: () => Promise<ModsConfig>
    set: (config: ModsConfig) => Promise<ModsConfig>
    onChange: (callback: (config: ModsConfig) => void) => () => void
  }
  launcher: {
    launch: () => Promise<LaunchResult>
    stop: () => Promise<void>
    isRunning: () => Promise<boolean>
    onStatus: (callback: (running: boolean) => void) => () => void
  }
  overlay: {
    isOverlayWindow: () => boolean
    moveBy: (dx: number, dy: number) => void
    setSize: (width: number, height: number) => void
    close: () => void
    setIgnoreMouseEvents: (ignore: boolean, forward?: boolean) => void
    requestState: () => Promise<OverlayPushState>
    onPush: (callback: (state: OverlayPushState) => void) => () => void
  }
  grabber: {
    getStatus: () => Promise<GrabberStatus>
    sendNow: () => Promise<{ ok: boolean; error?: string | null }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
