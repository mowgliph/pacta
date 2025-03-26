import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import Store from 'electron-store'

interface WindowState {
  x: number
  y: number
  width: number
  height: number
  isMaximized: boolean
}

export class WindowManager {
  private window: BrowserWindow | null = null
  private readonly store: Store<{ windowState: WindowState }>
  
  constructor() {
    this.store = new Store({
      name: 'window-state',
      defaults: {
        windowState: {
          x: undefined,
          y: undefined,
          width: 1200,
          height: 800,
          isMaximized: false
        }
      }
    })
  }

  async createWindow(): Promise<BrowserWindow> {
    const state = this.store.get('windowState')
    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    this.window = new BrowserWindow({
      ...state,
      minWidth: 800,
      minHeight: 600,
      show: false,
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload/index.js')
      }
    })

    this.window.once('ready-to-show', () => {
      this.window?.show()
      if (state.isMaximized) {
        this.window?.maximize()
      }
    })

    this.saveWindowState()
    return this.window
  }

  private saveWindowState(): void {
    if (!this.window) return

    ['resize', 'move', 'close'].forEach(event => {
      this.window?.on(event, () => {
        const bounds = this.window?.getBounds()
        this.store.set('windowState', {
          ...bounds,
          isMaximized: this.window?.isMaximized()
        })
      })
    })
  }
}