import { randomBytes, createHash } from 'crypto';
import { ipcMain } from 'electron';
import { logger } from '../utils/logger';
import { scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';

/**
 * Clase para gestionar aspectos de seguridad en la aplicación
 */
export class SecurityManager {
  private static instance: SecurityManager;
  private csrfTokens: Map<string, { token: string, expiresAt: number }> = new Map();
  private knownDevices: Map<string, { userId: string, lastActive: number }> = new Map();
  private sessionInvalidationCallbacks: Map<string, Function[]> = new Map();
  
  private constructor() {
    this.setupListeners();
    this.startCleanupTasks();
  }

  /**
   * Obtiene la instancia única del SecurityManager (Singleton)
   */
  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Configura las opciones de seguridad para la aplicación
   */
  public setupSecurity(): void {
    logger.info('Configurando opciones de seguridad...');
    
    // Configurar Content-Security-Policy y otras opciones de seguridad
    // Implementar según necesidades específicas
  }

  /**
   * Configura los listeners IPC relacionados con seguridad
   */
  private setupListeners() {
    // Verificar validez de token CSRF
    ipcMain.handle('security:verifyCsrfToken', (event, { token, csrfToken }) => {
      return this.verifyCsrfToken(token, csrfToken);
    });

    // Generar un nuevo token CSRF
    ipcMain.handle('security:generateCsrfToken', (event, { token }) => {
      return this.generateCsrfTokenForSession(token);
    });

    // Registrar un nuevo dispositivo
    ipcMain.handle('security:registerDevice', (event, { userId, deviceId }) => {
      return this.registerDevice(userId, deviceId);
    });

    // Verificar un dispositivo
    ipcMain.handle('security:verifyDevice', (event, { userId, deviceId }) => {
      return this.verifyDevice(userId, deviceId);
    });
  }

  /**
   * Inicia tareas de limpieza periódicas
   */
  private startCleanupTasks() {
    // Limpiar tokens CSRF expirados cada hora
    setInterval(() => {
      this.cleanupExpiredCsrfTokens();
    }, 60 * 60 * 1000);

    // Limpiar dispositivos inactivos (30 días)
    setInterval(() => {
      this.cleanupInactiveDevices(30);
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Genera un token CSRF para una sesión con JWT
   * @param jwtToken Token JWT del usuario
   * @returns Objeto con el token CSRF
   */
  public generateCsrfTokenForSession(jwtToken: string): { csrfToken: string } {
    try {
      if (!jwtToken) {
        throw new Error('Token JWT requerido para generar CSRF token');
      }

      // Crear hash del JWT para identificar la sesión
      const sessionId = this.createSessionIdFromJwt(jwtToken);
      
      // Generar token aleatorio
      const csrfToken = randomBytes(32).toString('hex');
      
      // Almacenar token con tiempo de expiración (24 horas)
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      this.csrfTokens.set(sessionId, { token: csrfToken, expiresAt });
      
      logger.info(`CSRF token generado para sesión: ${sessionId.substring(0, 8)}...`);
      
      return { csrfToken };
    } catch (error) {
      logger.error('Error al generar CSRF token:', error);
      throw error;
    }
  }

  /**
   * Verifica la validez de un token CSRF
   * @param jwtToken Token JWT del usuario
   * @param csrfToken Token CSRF a verificar
   * @returns Booleano indicando validez
   */
  public verifyCsrfToken(jwtToken: string, csrfToken: string): boolean {
    try {
      if (!jwtToken || !csrfToken) {
        return false;
      }
      
      // Obtener identificador de sesión
      const sessionId = this.createSessionIdFromJwt(jwtToken);
      
      // Verificar si existe el token y no ha expirado
      const storedData = this.csrfTokens.get(sessionId);
      
      if (!storedData) {
        logger.warn(`CSRF token no encontrado para sesión: ${sessionId.substring(0, 8)}...`);
        return false;
      }
      
      // Verificar expiración
      if (storedData.expiresAt < Date.now()) {
        this.csrfTokens.delete(sessionId);
        logger.warn(`CSRF token expirado para sesión: ${sessionId.substring(0, 8)}...`);
        return false;
      }
      
      // Verificar coincidencia
      const isValid = csrfToken === storedData.token;
      
      if (!isValid) {
        logger.warn(`CSRF token inválido para sesión: ${sessionId.substring(0, 8)}...`);
      }
      
      return isValid;
    } catch (error) {
      logger.error('Error al verificar CSRF token:', error);
      return false;
    }
  }

  /**
   * Registra un nuevo dispositivo para un usuario
   * @param userId ID del usuario
   * @param deviceId ID del dispositivo
   * @returns Objeto con estado del registro
   */
  public registerDevice(userId: string, deviceId: string): { success: boolean } {
    try {
      if (!userId || !deviceId) {
        return { success: false };
      }
      
      // Registrar dispositivo con timestamp actual
      this.knownDevices.set(deviceId, { 
        userId, 
        lastActive: Date.now() 
      });
      
      logger.info(`Dispositivo registrado para usuario ${userId}: ${deviceId.substring(0, 8)}...`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error al registrar dispositivo:', error);
      return { success: false };
    }
  }

  /**
   * Verifica si un dispositivo está registrado para un usuario
   * @param userId ID del usuario
   * @param deviceId ID del dispositivo
   * @returns Objeto con estado de la verificación
   */
  public verifyDevice(userId: string, deviceId: string): { valid: boolean, trusted: boolean } {
    try {
      if (!userId || !deviceId) {
        return { valid: false, trusted: false };
      }
      
      // Buscar dispositivo
      const device = this.knownDevices.get(deviceId);
      
      // Si no existe, no es válido pero puede ser registrado
      if (!device) {
        return { valid: true, trusted: false };
      }
      
      // Actualizar timestamp de actividad
      device.lastActive = Date.now();
      this.knownDevices.set(deviceId, device);
      
      // Verificar que pertenezca al usuario
      const isTrusted = device.userId === userId;
      
      return { 
        valid: true, 
        trusted: isTrusted 
      };
    } catch (error) {
      logger.error('Error al verificar dispositivo:', error);
      return { valid: false, trusted: false };
    }
  }

  /**
   * Invalida todas las sesiones de un usuario excepto el dispositivo especificado
   * @param userId ID del usuario
   * @param currentDeviceId ID del dispositivo actual (que no será invalidado)
   */
  public invalidateUserSessions(userId: string, currentDeviceId?: string): void {
    // Convertir a array para compatibilidad con ES5
    const devices = Array.from(this.knownDevices.entries());
    
    // Emitir evento para cada dispositivo a invalidar
    for (const [deviceId, device] of devices) {
      if (device.userId === userId && deviceId !== currentDeviceId) {
        // Ejecutar callbacks de invalidación para este usuario
        this.triggerSessionInvalidationForUser(userId);
        
        // Eliminar dispositivo
        this.knownDevices.delete(deviceId);
      }
    }
  }

  /**
   * Registra un callback para notificar invalidación de sesión
   * @param userId ID del usuario
   * @param callback Función a llamar cuando se invalide la sesión
   */
  public onSessionInvalidation(userId: string, callback: Function): void {
    if (!this.sessionInvalidationCallbacks.has(userId)) {
      this.sessionInvalidationCallbacks.set(userId, []);
    }
    
    this.sessionInvalidationCallbacks.get(userId)?.push(callback);
  }

  /**
   * Ejecuta los callbacks registrados para un usuario
   * @param userId ID del usuario
   */
  private triggerSessionInvalidationForUser(userId: string): void {
    const callbacks = this.sessionInvalidationCallbacks.get(userId) || [];
    
    for (const callback of callbacks) {
      try {
        callback();
      } catch (error) {
        logger.error(`Error al ejecutar callback de invalidación para usuario ${userId}:`, error);
      }
    }
  }

  /**
   * Limpia los tokens CSRF expirados
   */
  private cleanupExpiredCsrfTokens(): void {
    const now = Date.now();
    let count = 0;
    
    // Convertir a array para compatibilidad con ES5
    const tokens = Array.from(this.csrfTokens.entries());
    
    for (const [sessionId, data] of tokens) {
      if (data.expiresAt < now) {
        this.csrfTokens.delete(sessionId);
        count++;
      }
    }
    
    if (count > 0) {
      logger.info(`Limpieza de tokens CSRF: ${count} tokens expirados eliminados`);
    }
  }

  /**
   * Limpia dispositivos inactivos
   * @param maxDaysInactive Número máximo de días de inactividad permitidos
   */
  private cleanupInactiveDevices(maxDaysInactive: number): void {
    const maxInactiveTime = Date.now() - (maxDaysInactive * 24 * 60 * 60 * 1000);
    let count = 0;
    
    // Convertir a array para compatibilidad con ES5
    const devices = Array.from(this.knownDevices.entries());
    
    for (const [deviceId, data] of devices) {
      if (data.lastActive < maxInactiveTime) {
        this.knownDevices.delete(deviceId);
        count++;
      }
    }
    
    if (count > 0) {
      logger.info(`Limpieza de dispositivos: ${count} dispositivos inactivos eliminados`);
    }
  }

  /**
   * Crea un identificador de sesión a partir de un token JWT
   * @param jwt Token JWT
   * @returns Identificador único para la sesión
   */
  private createSessionIdFromJwt(jwt: string): string {
    // Solo necesitamos un hash del token, no necesitamos descifrarlo
    return createHash('sha256').update(jwt).digest('hex');
  }
}

// Instancia global del SecurityManager
export const securityManager = SecurityManager.getInstance();

// Convertir scrypt a versión con promesas
const scryptAsync = promisify(scrypt);

export class SecurityService {
  private static instance: SecurityService;
  private secretKeyCache: Map<string, string> = new Map();
  private envFilePath: string;
  
  private constructor() {
    // Inicializar ruta del archivo .env
    this.envFilePath = path.join(app.getPath('userData'), '.env.secrets');
    this.loadEnvironmentVariables();
  }
  
  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }
  
  private loadEnvironmentVariables(): void {
    // Cargar variables de entorno desde archivo .env.secrets si existe
    if (fs.existsSync(this.envFilePath)) {
      const envConfig = dotenv.parse(fs.readFileSync(this.envFilePath));
      for (const key in envConfig) {
        process.env[key] = envConfig[key];
      }
    } else {
      // Crear archivo .env.secrets con claves por defecto si no existe
      this.generateAndSaveSecrets();
    }
  }
  
  private generateAndSaveSecrets(): void {
    const secrets = {
      JWT_SECRET: this.generateSecureRandomString(32),
      ENCRYPTION_KEY: this.generateSecureRandomString(32),
      DB_ENCRYPTION_KEY: this.generateSecureRandomString(32),
      API_KEY_SALT: this.generateSecureRandomString(16),
    };
    
    let fileContent = '';
    for (const [key, value] of Object.entries(secrets)) {
      process.env[key] = value;
      fileContent += `${key}=${value}\n`;
    }
    
    // Crear directorio si no existe
    const dir = path.dirname(this.envFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Guardar archivo con permisos restrictivos
    fs.writeFileSync(this.envFilePath, fileContent, { mode: 0o600 });
  }
  
  // Método para generar strings aleatorios seguros
  public generateSecureRandomString(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
  
  // Método para generar UUID seguros
  public generateUUID(): string {
    return uuidv4();
  }
  
  // Método para obtener el JWT Secret
  public getJwtSecret(): string {
    const cachedSecret = this.secretKeyCache.get('JWT_SECRET');
    if (cachedSecret) {
      return cachedSecret;
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT Secret no encontrado en variables de entorno');
    }
    
    this.secretKeyCache.set('JWT_SECRET', jwtSecret);
    return jwtSecret;
  }
  
  // Método para obtener la clave de encriptación
  public getEncryptionKey(): string {
    const cachedKey = this.secretKeyCache.get('ENCRYPTION_KEY');
    if (cachedKey) {
      return cachedKey;
    }
    
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Clave de encriptación no encontrada en variables de entorno');
    }
    
    this.secretKeyCache.set('ENCRYPTION_KEY', encryptionKey);
    return encryptionKey;
  }
  
  // Métodos para hash y verificación de contraseñas
  public async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }
  
  public async verifyPassword(storedPassword: string, suppliedPassword: string): Promise<boolean> {
    const [salt, hashedPassword] = storedPassword.split(':');
    const derivedKey = await scryptAsync(suppliedPassword, salt, 64) as Buffer;
    const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
    return timingSafeEqual(derivedKey, hashedPasswordBuf);
  }
  
  // Método para limpiar la caché de secretos (útil para pruebas)
  public clearSecretCache(): void {
    this.secretKeyCache.clear();
  }
}

// Función de utilidad para sanitizar entradas
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
}

// Función para validar y sanitizar nombres de archivo
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') {
    return '';
  }
  
  // Eliminar caracteres no seguros y path traversal
  return fileName
    .replace(/\.\./g, '')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim();
}

// Exportar instancia única
export const securityService = SecurityService.getInstance(); 