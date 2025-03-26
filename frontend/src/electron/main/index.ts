import { app } from 'electron'
import { WindowManager } from './windowManager'
import { setupAutoUpdater } from './services/autoUpdater'
import { setupSystemMonitor } from './services/systemMonitor'
import { setupIpcHandlers } from './ipcHandlers'
import { logger } from '../shared/utils/logger'

class Application {
  private windowManager: WindowManager

  constructor() {
    this.windowManager = new WindowManager()
    this.initialize()
  }

  private initialize(): void {
    this.handleAppEvents()
    setupIpcHandlers()
    setupAutoUpdater()
    setupSystemMonitor()
  }

  private handleAppEvents(): void {
    app.on('ready', async () => {
      try {
        const mainWindow = await this.windowManager.createWindow()
        logger.info('Main window created successfully')
        
        if (process.env.NODE_ENV === 'development') {
          mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!)
        } else {
          mainWindow.loadFile('dist/index.html')
        }
      } catch (error) {
        logger.error('Failed to create main window:', error)
      }
    })

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }
}

new Application()