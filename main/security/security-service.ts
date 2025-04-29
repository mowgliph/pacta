import { authService } from "./auth-service";
import { permissionService } from "./permission-service";
import { rateLimiter } from "./rate-limiter";
import { securityManager } from "./security-manager";
import { logger } from "../utils/logger";

/**
 * Servicio integrado de seguridad que unifica los diferentes
 * componentes de seguridad de la aplicación (autenticación,
 * autorización, rate limiting, etc.)
 */
export class SecurityService {
  private static instance: SecurityService;

  private constructor() {}

  /**
   * Obtiene la instancia única del SecurityService (Singleton)
   */
  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Inicializa todos los servicios de seguridad
   */
  public initialize(): void {
    logger.info("Inicializando servicios de seguridad...");
    // Asegurar que todas las instancias singleton estén inicializadas
    authService;
    permissionService;
    rateLimiter;
    securityManager;
    logger.info("Servicios de seguridad inicializados correctamente");
  }

  /**
   * Autentica un usuario con email y contraseña
   */
  public async login(params: {
    email: string;
    password: string;
    rememberMe?: boolean;
    deviceId?: string;
    ipAddress?: string;
  }) {
    const { email, ipAddress } = params;

    // Verificar rate limiting antes de intentar login
    const rateLimitKey = `login:${email}:${ipAddress || "unknown"}`;
    const allowed = await rateLimiter.checkLoginAttempt(rateLimitKey);

    if (!allowed) {
      logger.warn(`Intento de login bloqueado por rate limiting: ${email}`);
      throw new Error(
        "Demasiados intentos de inicio de sesión. Por favor, inténtelo más tarde."
      );
    }

    try {
      // Intentar login
      const result = await authService.login(params);

      // Si es exitoso, resetear contador de intentos
      await rateLimiter.loginSuccessful(rateLimitKey);

      return result;
    } catch (error) {
      // No resetear contador si hay error
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene permiso para realizar una acción
   */
  public async checkPermission(params: {
    userId?: string;
    token?: string;
    resource: string;
    action: string;
  }): Promise<boolean> {
    const { userId, token, resource, action } = params;

    // Si se proporciona token, verificar permisos con el token
    if (token) {
      return permissionService.verifyTokenPermission(token, resource, action);
    }

    // Si se proporciona userId, verificar permisos con el ID
    if (userId) {
      return permissionService.hasPermission(userId, resource, action);
    }

    // Si no se proporciona ni token ni userId, denegar acceso
    logger.warn("Intento de verificar permisos sin token ni userId");
    return false;
  }

  /**
   * Verifica si una solicitud API debe ser limitada por rate limiting
   */
  public async checkApiRateLimit(key: string): Promise<boolean> {
    return rateLimiter.checkApiRequest(key);
  }

  /**
   * Genera un token CSRF para protección contra ataques CSRF
   */
  public generateCsrfToken(jwtToken: string): { csrfToken: string } {
    return securityManager.generateCsrfTokenForSession(jwtToken);
  }

  /**
   * Verifica la validez de un token CSRF
   */
  public verifyCsrfToken(jwtToken: string, csrfToken: string): boolean {
    return securityManager.verifyCsrfToken(jwtToken, csrfToken);
  }

  /**
   * Registra un nuevo dispositivo para un usuario
   */
  public registerDevice(
    userId: string,
    deviceId: string
  ): { success: boolean } {
    return securityManager.registerDevice(userId, deviceId);
  }

  /**
   * Invalida todas las sesiones de un usuario
   */
  public invalidateUserSessions(userId: string): void {
    authService.invalidateUserSessions(userId);
  }

  /**
   * Cierra la sesión de un usuario
   */
  public async logout(token: string): Promise<{ success: boolean }> {
    return authService.logout(token);
  }
}

// Exportar instancia global
export const securityService = SecurityService.getInstance();
