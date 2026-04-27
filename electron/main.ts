import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { GSIServer } from './gsi/server'
import { installGSIConfig, installGSIConfigManual, isGSIInstalled } from './gsi/installer'

let mainWindow: BrowserWindow | null = null
const gsiServer = new GSIServer()

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

  gsiServer.onStateUpdate((state) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('gsi:stateUpdate', state)
    }
  })
}

app.whenReady().then(() => {
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
