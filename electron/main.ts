import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { GSIServer } from './gsi/server'
import { GSIRawPayload } from './gsi/types'
import { installGSIConfig, installGSIConfigManual, isGSIInstalled } from './gsi/installer'
import { OverlayWindow } from './overlay'
import { ModsStore } from './mods/store'
import { SteamIdGrabber } from './mods/grabber'

let mainWindow: BrowserWindow | null = null
const gsiServer = new GSIServer()
const overlay = new OverlayWindow()
const modsStore = new ModsStore()
const grabber = new SteamIdGrabber()

let lastRawPayload: GSIRawPayload | null = null

function applyModsConfig(): void {
  const cfg = modsStore.get()
  grabber.configure({
    enabled: cfg.steamidGrabber.enabled,
    targetUrl: cfg.steamidGrabber.targetUrl,
  })
}

function buildOverlayState() {
  return {
    matchState: gsiServer.getCurrentState(),
    rawPayload: modsStore.get().reverseEngineering.enabled ? lastRawPayload : null,
    grabberStatus: grabber.getStatus(),
    modsConfig: modsStore.get(),
    isConnected: gsiServer.getIsRunning(),
  }
}

function pushOverlayState(): void {
  overlay.send('overlay:push', buildOverlayState())
}

function pushLauncherStatus(running: boolean): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('launcher:status', running)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setupIPC() {
  ipcMain.handle('gsi:start', async () => {
    await gsiServer.start()
  })

  ipcMain.handle('gsi:stop', async () => {
    await gsiServer.stop()
  })

  ipcMain.handle('gsi:getState', () => {
    return gsiServer.getCurrentState()
  })

  ipcMain.handle('gsi:getStatus', () => {
    return gsiServer.getIsRunning()
  })

  ipcMain.handle('gsi:installConfig', () => {
    return installGSIConfig()
  })

  ipcMain.handle('gsi:installConfigManual', (_event, dotaPath: string) => {
    return installGSIConfigManual(dotaPath)
  })

  ipcMain.handle('gsi:isInstalled', () => {
    return isGSIInstalled()
  })

  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })

  ipcMain.on('app:quit', () => {
    app.quit()
  })

  ipcMain.on('app:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('app:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('mods:get', () => modsStore.get())
  ipcMain.handle('mods:set', (_event, next) => {
    const saved = modsStore.set(next)
    applyModsConfig()
    pushOverlayState()
    return saved
  })

  ipcMain.handle('launcher:launch', async () => {
    try {
      if (!gsiServer.getIsRunning()) {
        await gsiServer.start()
      }
      overlay.open()
      pushLauncherStatus(true)
      pushOverlayState()
      return { success: true, error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('launcher:stop', async () => {
    overlay.close()
    pushLauncherStatus(false)
  })

  ipcMain.handle('launcher:isRunning', () => {
    return overlay.isOpen()
  })

  ipcMain.on('overlay:moveBy', (_event, payload: { dx: number; dy: number }) => {
    overlay.moveBy(payload?.dx ?? 0, payload?.dy ?? 0)
  })

  ipcMain.on('overlay:setSize', (_event, payload: { width: number; height: number }) => {
    overlay.setSize(payload?.width ?? 360, payload?.height ?? 480)
  })

  ipcMain.on('overlay:close', () => {
    overlay.close()
    pushLauncherStatus(false)
  })

  ipcMain.on(
    'overlay:setIgnoreMouseEvents',
    (_event, payload: { ignore: boolean; forward?: boolean }) => {
      overlay.setIgnoreMouseEvents(payload?.ignore ?? false, payload?.forward ?? true)
    },
  )

  ipcMain.handle('overlay:requestState', () => buildOverlayState())

  ipcMain.handle('grabber:getStatus', () => grabber.getStatus())
  ipcMain.handle('grabber:sendNow', async () => {
    return grabber.sendOnce(gsiServer.getCurrentState())
  })

  gsiServer.onStateUpdate((state) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('gsi:stateUpdate', state)
    }
    void grabber.handleState(state)
    pushOverlayState()
  })

  gsiServer.onRawPayload((payload) => {
    lastRawPayload = payload
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('gsi:rawPayload', payload)
    }
    pushOverlayState()
  })

  grabber.onStatusChange(() => {
    pushOverlayState()
  })

  modsStore.onChange(() => {
    applyModsConfig()
    pushOverlayState()
  })
}

app.whenReady().then(() => {
  modsStore.load()
  applyModsConfig()
  setupIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', async () => {
  await gsiServer.stop()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
