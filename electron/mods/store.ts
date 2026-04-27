import fs from 'fs'
import path from 'path'
import { app } from 'electron'

export interface ModsConfig {
  reverseEngineering: {
    enabled: boolean
  }
  steamidGrabber: {
    enabled: boolean
    targetUrl: string
  }
}

const DEFAULT_CONFIG: ModsConfig = {
  reverseEngineering: { enabled: false },
  steamidGrabber: { enabled: false, targetUrl: '' },
}

function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'mods.json')
}

function mergeWithDefaults(partial: Partial<ModsConfig>): ModsConfig {
  return {
    reverseEngineering: {
      enabled: partial.reverseEngineering?.enabled ?? DEFAULT_CONFIG.reverseEngineering.enabled,
    },
    steamidGrabber: {
      enabled: partial.steamidGrabber?.enabled ?? DEFAULT_CONFIG.steamidGrabber.enabled,
      targetUrl: partial.steamidGrabber?.targetUrl ?? DEFAULT_CONFIG.steamidGrabber.targetUrl,
    },
  }
}

export class ModsStore {
  private config: ModsConfig = DEFAULT_CONFIG
  private listeners: Array<(config: ModsConfig) => void> = []
  private loaded = false

  load(): ModsConfig {
    if (this.loaded) return this.config
    try {
      const raw = fs.readFileSync(getConfigPath(), 'utf-8')
      const parsed = JSON.parse(raw) as Partial<ModsConfig>
      this.config = mergeWithDefaults(parsed)
    } catch {
      this.config = DEFAULT_CONFIG
    }
    this.loaded = true
    return this.config
  }

  get(): ModsConfig {
    return this.load()
  }

  set(next: ModsConfig): ModsConfig {
    this.config = mergeWithDefaults(next)
    this.loaded = true
    try {
      fs.writeFileSync(getConfigPath(), JSON.stringify(this.config, null, 2), 'utf-8')
    } catch (error) {
      console.error('[ModsStore] Не удалось сохранить конфиг:', error)
    }
    for (const listener of this.listeners) {
      try {
        listener(this.config)
      } catch (error) {
        console.error('[ModsStore] Ошибка в listener:', error)
      }
    }
    return this.config
  }

  onChange(listener: (config: ModsConfig) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }
}
