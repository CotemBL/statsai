import { BrowserWindow, screen } from 'electron'
import path from 'path'

export class OverlayWindow {
  private window: BrowserWindow | null = null

  isOpen(): boolean {
    return this.window !== null && !this.window.isDestroyed()
  }

  getWindow(): BrowserWindow | null {
    return this.isOpen() ? this.window : null
  }

  open(): BrowserWindow {
    if (this.isOpen()) {
      this.window!.focus()
      return this.window!
    }

    const display = screen.getPrimaryDisplay()
    const width = 360
    const height = 480
    const x = display.workArea.x + display.workArea.width - width - 24
    const y = display.workArea.y + 24

    this.window = new BrowserWindow({
      width,
      height,
      x,
      y,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: true,
      skipTaskbar: false,
      hasShadow: false,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        additionalArguments: ['--statsai-overlay'],
      },
    })

    this.window.setAlwaysOnTop(true, 'screen-saver')
    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

    if (process.env.VITE_DEV_SERVER_URL) {
      this.window.loadURL(`${process.env.VITE_DEV_SERVER_URL}/overlay.html`)
    } else {
      this.window.loadFile(path.join(__dirname, '../dist/overlay.html'))
    }

    this.window.on('closed', () => {
      this.window = null
    })

    return this.window
  }

  close(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close()
    }
    this.window = null
  }

  moveBy(dx: number, dy: number): void {
    if (!this.window || this.window.isDestroyed()) return
    const [x, y] = this.window.getPosition()
    this.window.setPosition(Math.round(x + dx), Math.round(y + dy))
  }

  setSize(width: number, height: number): void {
    if (!this.window || this.window.isDestroyed()) return
    this.window.setSize(Math.max(220, Math.round(width)), Math.max(180, Math.round(height)))
  }

  setIgnoreMouseEvents(ignore: boolean, forward = true): void {
    if (!this.window || this.window.isDestroyed()) return
    this.window.setIgnoreMouseEvents(ignore, ignore ? { forward } : undefined)
  }

  send(channel: string, payload: unknown): void {
    if (!this.window || this.window.isDestroyed()) return
    this.window.webContents.send(channel, payload)
  }
}
