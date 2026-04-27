import { contextBridge, ipcRenderer } from 'electron'

const isOverlayWindow = process.argv.includes('--statsai-overlay')

contextBridge.exposeInMainWorld('electronAPI', {
  gsi: {
    start: () => ipcRenderer.invoke('gsi:start'),
    stop: () => ipcRenderer.invoke('gsi:stop'),
    getState: () => ipcRenderer.invoke('gsi:getState'),
    getStatus: () => ipcRenderer.invoke('gsi:getStatus'),
    installConfig: () => ipcRenderer.invoke('gsi:installConfig'),
    installConfigManual: (dotaPath: string) => ipcRenderer.invoke('gsi:installConfigManual', dotaPath),
    isInstalled: () => ipcRenderer.invoke('gsi:isInstalled'),
    onStateUpdate: (callback: (state: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, state: unknown) => callback(state)
      ipcRenderer.on('gsi:stateUpdate', handler)
      return () => ipcRenderer.removeListener('gsi:stateUpdate', handler)
    },
    onRawPayload: (callback: (payload: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, payload: unknown) => callback(payload)
      ipcRenderer.on('gsi:rawPayload', handler)
      return () => ipcRenderer.removeListener('gsi:rawPayload', handler)
    },
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    quit: () => ipcRenderer.send('app:quit'),
    minimize: () => ipcRenderer.send('app:minimize'),
    maximize: () => ipcRenderer.send('app:maximize'),
  },
  mods: {
    get: () => ipcRenderer.invoke('mods:get'),
    set: (config: unknown) => ipcRenderer.invoke('mods:set', config),
    onChange: (callback: (config: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, config: unknown) => callback(config)
      ipcRenderer.on('mods:change', handler)
      return () => ipcRenderer.removeListener('mods:change', handler)
    },
  },
  launcher: {
    launch: () => ipcRenderer.invoke('launcher:launch'),
    stop: () => ipcRenderer.invoke('launcher:stop'),
    isRunning: () => ipcRenderer.invoke('launcher:isRunning'),
    onStatus: (callback: (running: boolean) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, running: boolean) => callback(running)
      ipcRenderer.on('launcher:status', handler)
      return () => ipcRenderer.removeListener('launcher:status', handler)
    },
  },
  overlay: {
    isOverlayWindow: () => isOverlayWindow,
    moveBy: (dx: number, dy: number) => ipcRenderer.send('overlay:moveBy', { dx, dy }),
    setSize: (width: number, height: number) => ipcRenderer.send('overlay:setSize', { width, height }),
    close: () => ipcRenderer.send('overlay:close'),
    setIgnoreMouseEvents: (ignore: boolean, forward = true) =>
      ipcRenderer.send('overlay:setIgnoreMouseEvents', { ignore, forward }),
    requestState: () => ipcRenderer.invoke('overlay:requestState'),
    onPush: (callback: (state: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, state: unknown) => callback(state)
      ipcRenderer.on('overlay:push', handler)
      return () => ipcRenderer.removeListener('overlay:push', handler)
    },
  },
  grabber: {
    getStatus: () => ipcRenderer.invoke('grabber:getStatus'),
    sendNow: () => ipcRenderer.invoke('grabber:sendNow'),
  },
})
