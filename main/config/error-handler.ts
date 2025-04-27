import { app, BrowserWindow, dialog } from 'electron';
import log from 'electron-log';
import { Notification } from 'electron/main';

export class ErrorHandler {
  private window: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  public setupErrorHandling(): void {
    this.setupUncaughtExceptionHandler();
    this.setupUnhandledRejectionHandler();
    this.setupRendererCrashHandler();
    this.setupNetworkErrorHandler();
  }

  private setupUncaughtExceptionHandler(): void {
    process.on('uncaughtException', (error) => {
      log.error('Excepción no capturada:', error);
      this.showErrorDialog(
        'Error Inesperado',
        'Ha ocurrido un error inesperado. La aplicación se reiniciará.'
      );
      app.relaunch();
      app.exit(1);
    });
  }

  private setupUnhandledRejectionHandler(): void {
    process.on('unhandledRejection', (reason, promise) => {
      log.error('Promesa rechazada no manejada:', reason);
      this.showNotification(
        'Error',
        'Se ha producido un error en una operación en segundo plano.'
      );
    });
  }

  private setupRendererCrashHandler(): void {
    this.window.webContents.on('crashed', (event, killed) => {
      log.error('Proceso de renderizado fallido:', { killed });
      this.showErrorDialog(
        'Error de Renderizado',
        'La aplicación ha dejado de responder. Se reiniciará automáticamente.'
      );
      app.relaunch();
      app.exit(1);
    });
  }

  private setupNetworkErrorHandler(): void {
    this.window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error('Error de carga:', { errorCode, errorDescription });
      this.showErrorDialog(
        'Error de Carga',
        'No se pudo cargar la aplicación. Verifique su conexión a internet.'
      );
    });
  }

  private showErrorDialog(title: string, message: string): void {
    dialog.showErrorBox(title, message);
  }

  private showNotification(title: string, body: string): void {
    new Notification({
      title,
      body
    }).show();
  }

  public handleError(error: Error, context: string): void {
    log.error(`Error en ${context}:`, error);
    this.showNotification('Error', `Se ha producido un error: ${error.message}`);
  }
} 