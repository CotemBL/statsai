import fs from 'fs'
import path from 'path'
import { generateGSIConfig } from './server'

const STEAM_PATHS_WINDOWS = [
  'C:\\Program Files (x86)\\Steam',
  'C:\\Program Files\\Steam',
  'D:\\Steam',
  'D:\\Program Files (x86)\\Steam',
]

const DOTA_CFG_RELATIVE = path.join(
  'steamapps',
  'common',
  'dota 2 beta',
  'game',
  'dota',
  'cfg',
  'gamestate_integration'
)

const GSI_FILENAME = 'gamestate_integration_statsai.cfg'

function findSteamPath(): string | null {
  for (const steamPath of STEAM_PATHS_WINDOWS) {
    if (fs.existsSync(steamPath)) {
      return steamPath
    }
  }

  const localAppData = process.env.LOCALAPPDATA
  if (localAppData) {
    const steamLocal = path.join(localAppData, 'Steam')
    if (fs.existsSync(steamLocal)) {
      return steamLocal
    }
  }

  return null
}

function findDotaCfgPath(steamPath: string): string | null {
  const cfgPath = path.join(steamPath, DOTA_CFG_RELATIVE)
  const dotaGamePath = path.dirname(cfgPath)

  if (fs.existsSync(dotaGamePath)) {
    return cfgPath
  }

  const libraryFoldersPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf')
  if (fs.existsSync(libraryFoldersPath)) {
    try {
      const content = fs.readFileSync(libraryFoldersPath, 'utf-8')
      const pathMatches = content.match(/"path"\s+"([^"]+)"/g)
      if (pathMatches) {
        for (const match of pathMatches) {
          const libPath = match.replace(/"path"\s+"/, '').replace(/"$/, '')
          const dotaCfg = path.join(libPath, DOTA_CFG_RELATIVE)
          const dotaGame = path.dirname(dotaCfg)
          if (fs.existsSync(dotaGame)) {
            return dotaCfg
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  return null
}

export interface GSIInstallResult {
  success: boolean
  path: string | null
  error: string | null
}

export function installGSIConfig(): GSIInstallResult {
  try {
    const steamPath = findSteamPath()
    if (!steamPath) {
      return {
        success: false,
        path: null,
        error: 'Steam не найден. Пожалуйста, укажите путь к Steam вручную.',
      }
    }

    const cfgPath = findDotaCfgPath(steamPath)
    if (!cfgPath) {
      return {
        success: false,
        path: null,
        error: 'Dota 2 не найдена. Убедитесь, что игра установлена.',
      }
    }

    if (!fs.existsSync(cfgPath)) {
      fs.mkdirSync(cfgPath, { recursive: true })
    }

    const filePath = path.join(cfgPath, GSI_FILENAME)
    fs.writeFileSync(filePath, generateGSIConfig(), 'utf-8')

    return {
      success: true,
      path: filePath,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      path: null,
      error: `Ошибка установки: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export function installGSIConfigManual(dotaPath: string): GSIInstallResult {
  try {
    const cfgPath = path.join(dotaPath, 'game', 'dota', 'cfg', 'gamestate_integration')

    if (!fs.existsSync(cfgPath)) {
      fs.mkdirSync(cfgPath, { recursive: true })
    }

    const filePath = path.join(cfgPath, GSI_FILENAME)
    fs.writeFileSync(filePath, generateGSIConfig(), 'utf-8')

    return {
      success: true,
      path: filePath,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      path: null,
      error: `Ошибка установки: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export function isGSIInstalled(): boolean {
  const steamPath = findSteamPath()
  if (!steamPath) return false

  const cfgPath = findDotaCfgPath(steamPath)
  if (!cfgPath) return false

  return fs.existsSync(path.join(cfgPath, GSI_FILENAME))
}
