import { GSIMatchState } from '../gsi/types'

export interface GrabberStatus {
  sentCount: number
  lastSentAt: number | null
  lastError: string | null
  lastMatchId: string | null
}

export interface GrabberPayload {
  matchId: string | null
  timestamp: number
  source: 'statsai-launcher'
  steamIds: string[]
  players: GSIMatchState['players']
}

export class SteamIdGrabber {
  private status: GrabberStatus = {
    sentCount: 0,
    lastSentAt: null,
    lastError: null,
    lastMatchId: null,
  }
  private listeners: Array<(status: GrabberStatus) => void> = []
  private sentByMatch = new Map<string, Set<string>>()
  private targetUrl = ''
  private enabled = false

  configure(opts: { enabled: boolean; targetUrl: string }): void {
    this.enabled = opts.enabled
    this.targetUrl = opts.targetUrl.trim()
  }

  getStatus(): GrabberStatus {
    return { ...this.status }
  }

  onStatusChange(listener: (status: GrabberStatus) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  reset(): void {
    this.sentByMatch.clear()
    this.status = {
      sentCount: 0,
      lastSentAt: null,
      lastError: null,
      lastMatchId: null,
    }
    this.notify()
  }

  async handleState(state: GSIMatchState): Promise<void> {
    if (!this.enabled || !this.targetUrl) return
    if (state.players.length === 0) return

    const matchKey = state.matchId ?? '__no_match__'
    const seen = this.sentByMatch.get(matchKey) ?? new Set<string>()
    const newIds = state.players
      .map((p) => p.steamid)
      .filter((id) => id && !seen.has(id))

    if (newIds.length === 0) return

    for (const id of newIds) seen.add(id)
    this.sentByMatch.set(matchKey, seen)

    const payload: GrabberPayload = {
      matchId: state.matchId,
      timestamp: state.timestamp,
      source: 'statsai-launcher',
      steamIds: Array.from(seen),
      players: state.players,
    }

    await this.send(payload, matchKey)
  }

  async sendOnce(state: GSIMatchState | null): Promise<{ ok: boolean; error?: string | null }> {
    if (!this.targetUrl) {
      return { ok: false, error: 'Не указан URL для отправки' }
    }
    if (!state || state.players.length === 0) {
      return { ok: false, error: 'Нет данных матча для отправки' }
    }
    const matchKey = state.matchId ?? '__manual__'
    const payload: GrabberPayload = {
      matchId: state.matchId,
      timestamp: state.timestamp,
      source: 'statsai-launcher',
      steamIds: state.players.map((p) => p.steamid).filter(Boolean),
      players: state.players,
    }
    try {
      await this.send(payload, matchKey)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  private async send(payload: GrabberPayload, matchKey: string): Promise<void> {
    try {
      const response = await fetch(this.targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      this.status = {
        sentCount: this.status.sentCount + 1,
        lastSentAt: Date.now(),
        lastError: null,
        lastMatchId: matchKey === '__no_match__' || matchKey === '__manual__' ? null : matchKey,
      }
      console.log(`[Grabber] Отправлено ${payload.steamIds.length} steamid → ${this.targetUrl}`)
    } catch (error) {
      this.status = {
        ...this.status,
        lastError: error instanceof Error ? error.message : String(error),
      }
      console.error('[Grabber] Ошибка отправки:', error)
    }
    this.notify()
  }

  private notify(): void {
    const snapshot = this.getStatus()
    for (const listener of this.listeners) {
      try {
        listener(snapshot)
      } catch (error) {
        console.error('[Grabber] Ошибка в listener:', error)
      }
    }
  }
}
