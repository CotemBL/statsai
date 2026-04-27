import express from 'express'
import http from 'http'
import { GSIRawPayload, GSIMatchState } from './types'
import { parseGSIPayload, extractSteamIds } from './parser'

export type GSIEventCallback = (state: GSIMatchState) => void

const GSI_PORT = 3001

export class GSIServer {
  private app: express.Application
  private server: http.Server | null = null
  private currentState: GSIMatchState | null = null
  private listeners: GSIEventCallback[] = []
  private isRunning = false

  constructor() {
    this.app = express()
    this.app.use(express.json({ limit: '1mb' }))
    this.app.use(express.urlencoded({ extended: true }))

    this.app.post('/', (req, res) => {
      try {
        const payload = req.body as GSIRawPayload
        this.currentState = parseGSIPayload(payload)

        const steamIds = extractSteamIds(payload)
        if (steamIds.length > 0) {
          console.log('[GSI] Steam IDs в матче:', steamIds)
        }

        this.notifyListeners(this.currentState)
        res.status(200).end()
      } catch (error) {
        console.error('[GSI] Ошибка парсинга:', error)
        res.status(500).end()
      }
    })

    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', running: this.isRunning })
    })
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        resolve()
        return
      }

      this.server = this.app.listen(GSI_PORT, () => {
        this.isRunning = true
        console.log(`[GSI] Сервер запущен на порту ${GSI_PORT}`)
        resolve()
      })

      this.server.on('error', (err) => {
        console.error('[GSI] Ошибка запуска сервера:', err)
        reject(err)
      })
    })
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.isRunning = false
          console.log('[GSI] Сервер остановлен')
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  onStateUpdate(callback: GSIEventCallback): void {
    this.listeners.push(callback)
  }

  removeListener(callback: GSIEventCallback): void {
    this.listeners = this.listeners.filter(l => l !== callback)
  }

  getCurrentState(): GSIMatchState | null {
    return this.currentState
  }

  getIsRunning(): boolean {
    return this.isRunning
  }

  private notifyListeners(state: GSIMatchState): void {
    for (const listener of this.listeners) {
      try {
        listener(state)
      } catch (error) {
        console.error('[GSI] Ошибка в listener:', error)
      }
    }
  }
}

export function generateGSIConfig(): string {
  return `"statsai_gsi"
{
    "uri"           "http://localhost:${GSI_PORT}/"
    "timeout"       "5.0"
    "buffer"        "0.5"
    "throttle"      "0.5"
    "heartbeat"     "30.0"
    "data"
    {
        "provider"      "1"
        "map"           "1"
        "player"        "1"
        "hero"          "1"
        "abilities"     "1"
        "items"         "1"
        "allplayers"    "1"
    }
}`
}
