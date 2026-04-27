import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  gsi: {
    start: () => Promise<void>
    stop: () => Promise<void>
    getState: () => Promise<unknown>
    getStatus: () => Promise<boolean>
    installConfig: () => Promise<{ success: boolean; path: string | null; error: string | null }>
    installConfigManual: (dotaPath: string) => Promise<{ success: boolean; path: string | null; error: string | null }>
    isInstalled: () => Promise<boolean>
    onStateUpdate: (callback: (state: unknown) => void) => () => void
  }
  app: {
    getVersion: () => Promise<string>
    quit: () => void
    minimize: () => void
    maximize: () => void
  }
}

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
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    quit: () => ipcRenderer.send('app:quit'),
    minimize: () => ipcRenderer.send('app:minimize'),
    maximize: () => ipcRenderer.send('app:maximize'),
  },
} satisfies ElectronAPI)
