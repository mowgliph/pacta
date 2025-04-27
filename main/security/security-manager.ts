import { BrowserWindow, app, session, shell } from 'electron';
import { URL } from 'url';
import { logger } from '../utils/logger';

/**
 * Clase para gestionar la seguridad de la aplicación Electron
 * Implementa las mejores prácticas de seguridad recomendadas por Electron
 */
export class SecurityManager {
  private static instance: SecurityManager;
  private allowedOrigins: string[] = ['https://pacta.app'];
  private allowedProtocols: string[] = ['https:', 'file:', 'data:'];
  private cspDirectives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'child-src': ["'self'"],
    'frame-src': ["'self'"],
    'worker-src': ["'self'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'manifest-src': ["'self'"],
  };

  // Singleton
  private constructor() {}

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Inicializa las políticas de seguridad para toda la aplicación
   */
  public setupSecurity(): void {
    this.setupContentSecurityPolicy();
    this.disableRemoteModule();
    this.setupSessionPermissions();
    this.setupOriginValidation();
    
    logger.info('Configuración de seguridad aplicada');
  }

  /**
   * Configura las políticas de seguridad para una ventana específica
   */
  public secureWindow(window: BrowserWindow): void {
    // Deshabilitar la integración con Node.js en el proceso de renderizado
    window.webContents.setWindowOpenHandler(({ url }) => {
      if (this.isUrlAllowed(url)) {
        shell.openExternal(url);
      } else {
        logger.warn(`Intento de abrir URL no permitida bloqueado: ${url}`);
      }
      return { action: 'deny' };
    });

    // Manejar navegación
    window.webContents.on('will-navigate', (event, url) => {
      if (!this.isUrlAllowed(url)) {
        event.preventDefault();
        logger.warn(`Navegación a URL no permitida bloqueada: ${url}`);
      }
    });

    // Prevenir arrastrar y soltar archivos
    window.webContents.on('will-navigate', (event) => {
      if (!app.isPackaged) return;
      event.preventDefault();
    });

    logger.info('Ventana asegurada');
  }

  /**
   * Configura la Content Security Policy
   */
  private setupContentSecurityPolicy(): void {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [this.getCspHeader()]
        }
      });
    });
  }

  /**
   * Deshabilita el módulo remoto por seguridad
   */
  private disableRemoteModule(): void {
    app.on('ready', () => {
      if (!app.isPackaged) return;
      // Desde Electron 14, el módulo remoto está deshabilitado por defecto
      // Este código se mantiene por compatibilidad con versiones anteriores
      try {
        // @ts-ignore
        require('@electron/remote/main').initialize();
      } catch (error) {
        // El módulo remote puede no estar disponible
      }
    });
  }

  /**
   * Configura permisos de sesión (bloqueo de características peligrosas)
   */
  private setupSessionPermissions(): void {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      const url = webContents.getURL();
      
      // Lista de permisos permitidos y bloqueados
      const allowedPermissions = ['clipboard-read', 'media'];
      const blockedPermissions = ['notifications', 'geolocation', 'microphone', 'camera'];
      
      if (this.isUrlAllowed(url)) {
        if (allowedPermissions.includes(permission)) {
          return callback(true);
        }
        
        if (blockedPermissions.includes(permission)) {
          logger.warn(`Permiso bloqueado: ${permission} para ${url}`);
          return callback(false);
        }
        
        return callback(true);
      }
      
      logger.warn(`Solicitud de permiso denegada para URL no permitida: ${url}`);
      return callback(false);
    });
  }

  /**
   * Configura validación de orígenes para webRequest
   */
  private setupOriginValidation(): void {
    if (app.isPackaged) {
      session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        const url = details.url;
        callback({ cancel: !this.isUrlAllowed(url) });
      });
    }
  }

  /**
   * Valida si una URL está permitida según las políticas de seguridad
   */
  private isUrlAllowed(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      
      // Permitir URLs locales (file://) en modo desarrollo
      if (!app.isPackaged && url.protocol === 'file:') {
        return true;
      }

      // Verificar si el protocolo es permitido
      if (!this.allowedProtocols.includes(url.protocol)) {
        return false;
      }

      // En producción, verificar el origen
      if (app.isPackaged && url.protocol !== 'file:') {
        return this.allowedOrigins.some(origin => url.origin === origin);
      }

      return true;
    } catch (error) {
      logger.error('Error validando URL:', error);
      return false;
    }
  }

  /**
   * Genera el encabezado CSP a partir de las directivas
   */
  private getCspHeader(): string {
    return Object.entries(this.cspDirectives)
      .map(([directive, sources]) => {
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');
  }

  /**
   * Agrega un origen permitido
   */
  public addAllowedOrigin(origin: string): void {
    if (!this.allowedOrigins.includes(origin)) {
      this.allowedOrigins.push(origin);
    }
  }

  /**
   * Establece los orígenes permitidos
   */
  public setAllowedOrigins(origins: string[]): void {
    this.allowedOrigins = [...origins];
  }
} 