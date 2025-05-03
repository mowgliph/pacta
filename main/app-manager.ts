import { app, BrowserWindow, dialog } from 'electron';
import { WindowManager } from './window/window-manager';
import { SecurityManager } from './security/security-manager';
import { logger } from './utils/logger';
import { ErrorHandler } from './utils/error-handler';
import { backupService } from './utils/backup-service';

/**
 * Clase para gestionar el ciclo de vida de la aplicación Electron
 * Implementa el patrón Singleton para garantizar una única instancia
 */
export class AppManager {
  private static instance: AppManager;
  private windowManager: WindowManager;
  private securityManager: SecurityManager;
  private errorHandler: ErrorHandler | null = null;
  private mainWindow: BrowserWindow | null = null;

  private constructor() {
    this.windowManager = WindowManager.getInstance();
    this.securityManager = SecurityManager.getInstance();
    
    // Configurar opciones y eventos de la aplicación
    this.setupAppOptions();
    this.setupAppEvents();
  }

  /**
   * Obtiene la instancia única del AppManager (Singleton)
   */
  public static getInstance(): AppManager {
    if (!AppManager.instance) {
      AppManager.instance = new AppManager();
    }
    return AppManager.instance;
  }

  /**
   * Inicializa la aplicación 
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('Iniciando aplicación PACTA...');

      // Esperar a que la aplicación esté lista
      if (!app.isReady()) {
        await this.waitForAppReady();
      }

      // Configurar seguridad
      this.securityManager.setupSecurity();

      // Crear ventana principal
      this.mainWindow = await this.windowManager.createMainWindow();
      
      // Configurar manejador de errores
      this.setupErrorHandler();
      // Configurar backup automático
      this.setupAutoBackup();

      logger.info('Aplicación PACTA inicializada correctamente');

    } catch (error) {
      logger.error('Error al inicializar la aplicación:', error);
      dialog.showErrorBox(
        'Error de inicialización', 
        'Ha ocurrido un error al iniciar la aplicación. Por favor, inténtelo de nuevo.'
      );
      app.exit(1);
    }
  }

  /**
   * Configura las opciones de la aplicación
   */
  private setupAppOptions(): void {
    // Prevenir múltiples instancias
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
      return;
    }

    // Manejar segunda instancia (enfocar la ventana existente)
    app.on('second-instance', () => {
      const mainWindow = this.windowManager.getMainWindow();
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });

    // Establece entorno
    app.setAppUserModelId('com.pacta.app');
  }

  /**
   * Configura los eventos de la aplicación
   */
  private setupAppEvents(): void {
    // Evento window-all-closed
    app.on('window-all-closed', () => {
      // En macOS es común que las aplicaciones se mantengan activas hasta que el usuario salga explícitamente
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Evento activate (macOS)
    app.on('activate', async () => {
      // En macOS es común volver a crear una ventana cuando se hace clic en el icono del dock
      if (this.windowManager.getWindowCount() === 0) {
        this.mainWindow = await this.windowManager.createMainWindow();
      }
    });

    // Evento before-quit
    app.on('before-quit', () => {
      logger.info('Cerrando aplicación PACTA...');
    });
  }

  /**
   * Espera a que la aplicación esté lista
   */
  private waitForAppReady(): Promise<void> {
    return new Promise((resolve) => {
      if (app.isReady()) {
        resolve();
      } else {
        app.once('ready', () => {
          resolve();
        });
      }
    });
  }

  /**
   * Reinicia la aplicación
   */
  public restartApp(): void {
    app.relaunch();
    app.exit(0);
  }

  /**
   * Sale de la aplicación
   */
  public exitApp(): void {
    app.exit(0);
  }

  /**
   * Obtiene la ventana principal de la aplicación
   * Delega al WindowManager para obtener la referencia a la ventana
   * @returns La ventana principal o null si no existe
   */
  public getMainWindow(): BrowserWindow | null {
    return this.windowManager.getMainWindow();
  }

  /**
   * Enfoca la ventana principal si existe
   * Restaura la ventana si está minimizada
   */
  public focusMainWindow(): void {
    const mainWindow = this.windowManager.getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  }

  /**
   * Procesa argumentos de línea de comandos
   * @param args Argumentos de línea de comandos
   */
  public processCommandLineArgs(args: string[]): void {
    if (args.length <= 1) {
      return;
    }

    logger.info('Procesando argumentos de línea de comandos:', args);
    
    // Implementar la lógica específica para procesar argumentos
    // Por ejemplo, abrir un archivo específico o activar una funcionalidad
  }

  /**
   * Configura el manejador global de errores
   */
  private setupErrorHandler(): void {
    // Registrar el manejador global de errores
    process.on('uncaughtException', (error) => {
      ErrorHandler.handle(error);
      dialog.showErrorBox(
        'Error inesperado',
        'Ha ocurrido un error inesperado. La aplicación se reiniciará.'
      );
      app.relaunch();
      app.exit(1);
    });
    process.on('unhandledRejection', (reason: any) => {
      ErrorHandler.handle(reason);
      dialog.showErrorBox(
        'Error de promesa no manejada',
        'Se detectó un error no manejado. La aplicación se reiniciará.'
      );
      app.relaunch();
      app.exit(1);
    });
  }

  /**
   * Configura el sistema de backup automático diario
   */
  private setupAutoBackup(): void {
    backupService.scheduleDailyBackup();
  }
} 