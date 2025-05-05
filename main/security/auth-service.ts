import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { setAuthToken, clearAuth } from "../store/store-manager";
import { rateLimiter } from "./rate-limiter";
import { securityManager } from "./security-manager";
import { v4 as uuidv4 } from "uuid";

// Configuración de opciones de JWT
const JWT_OPTIONS = {
  algorithm: "HS256" as jwt.Algorithm,
  audience: "pacta-app",
  issuer: "pacta-auth",
  expiresIn: "1h",
  notBefore: "0",
  jwtid: uuidv4(),
};

// Tipos para sesiones activas
interface ActiveSession {
  userId: string;
  deviceId: string;
  token: string;
  expiresAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Servicio de autenticación mejorado con gestión de sesiones,
 * protección contra ataques de fuerza bruta y validación de roles.
 */
export class AuthService {
  private static instance: AuthService;
  private activeSessions: Map<string, ActiveSession> = new Map();
  private JWT_SECRET: string;
  private MAX_LOGIN_ATTEMPTS = 5;
  private LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos
  private failedAttempts: Map<string, { count: number; lockoutUntil: number }> =
    new Map();

  private constructor() {
    // Obtener clave secreta para JWT
    this.JWT_SECRET = securityManager.getJwtSecret();

    // Iniciar limpieza periódica de sesiones expiradas
    this.startCleanupTasks();
  }

  /**
   * Obtiene la instancia única del AuthService (Singleton)
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
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
    userAgent?: string;
  }) {
    const {
      email,
      password,
      rememberMe = false,
      deviceId,
      ipAddress,
      userAgent,
    } = params;

    // Verificar si la cuenta está bloqueada
    const lockoutStatus = this.checkAccountLockout(email);
    if (lockoutStatus.isLocked) {
      throw new Error(
        `Cuenta bloqueada. Intente nuevamente en ${Math.ceil(
          lockoutStatus.remainingTime / 60000
        )} minutos`
      );
    }

    // Crear clave única para rate limiting
    const rateLimitKey = `login:${email}:${ipAddress || "unknown"}`;

    // Verificar rate limiting
    const allowed = await rateLimiter.checkLoginAttempt(rateLimitKey);
    if (!allowed) {
      this.incrementFailedAttempts(email);
      logger.warn(`Intento de login bloqueado por rate limiting: ${email}`);
      throw new Error(
        "Demasiados intentos de inicio de sesión. Por favor, inténtelo más tarde."
      );
    }

    try {
      // Verificar si es un usuario especial predefinido
      const isDefaultUser = this.isDefaultUser(email);
      if (isDefaultUser && password === "pacta") {
        return this.handleDefaultUserLogin(email, rememberMe, deviceId);
      }

      // Proceso normal de autenticación para usuarios regulares
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          role: true,
        },
      });

      if (!user) {
        this.incrementFailedAttempts(email);
        logger.warn(
          `Intento de inicio de sesión con email no encontrado: ${email}`
        );
        throw new Error("Credenciales inválidas");
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        logger.warn(
          `Intento de inicio de sesión con cuenta inactiva: ${email}`
        );
        throw new Error("Cuenta inactiva. Contacte al administrador.");
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        this.incrementFailedAttempts(email);
        logger.warn(
          `Intento de inicio de sesión con contraseña incorrecta: ${email}`
        );
        throw new Error("Credenciales inválidas");
      }

      // Resetear intentos fallidos si la autenticación es exitosa
      this.resetFailedAttempts(email);

      // Generar token y registrar sesión
      const { token, expiresAt } = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role.name,
        deviceId,
        rememberMe,
        expiresIn: rememberMe ? "7d" : "1h",
      });

      // Registrar sesión activa
      this.registerActiveSession({
        userId: user.id,
        deviceId: deviceId || uuidv4(),
        token,
        expiresAt,
        lastActivity: Date.now(),
        ipAddress,
        userAgent,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role.name,
          name: user.name,
        },
        expiresAt: new Date(expiresAt).toISOString(),
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error en proceso de login: ${error.message}`);
      } else {
        logger.error(`Error en proceso de login: ${String(error)}`);
      }
      throw error;
    }
  }

  /**
   * Verifica el estado de bloqueo de una cuenta
   */
  private checkAccountLockout(email: string): {
    isLocked: boolean;
    remainingTime: number;
  } {
    const attempt = this.failedAttempts.get(email);
    if (!attempt) return { isLocked: false, remainingTime: 0 };

    if (
      attempt.count >= this.MAX_LOGIN_ATTEMPTS &&
      Date.now() < attempt.lockoutUntil
    ) {
      return {
        isLocked: true,
        remainingTime: attempt.lockoutUntil - Date.now(),
      };
    }

    return { isLocked: false, remainingTime: 0 };
  }

  /**
   * Incrementa el contador de intentos fallidos
   */
  private incrementFailedAttempts(email: string): void {
    const attempt = this.failedAttempts.get(email) || {
      count: 0,
      lockoutUntil: 0,
    };
    attempt.count++;

    if (attempt.count >= this.MAX_LOGIN_ATTEMPTS) {
      attempt.lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
    }

    this.failedAttempts.set(email, attempt);
  }

  /**
   * Resetea los intentos fallidos
   */
  private resetFailedAttempts(email: string): void {
    this.failedAttempts.delete(email);
  }

  /**
   * Cierra la sesión de un usuario
   */
  public async logout(token: string): Promise<{ success: boolean }> {
    if (token) {
      try {
        // Decodificar token sin verificar para obtener deviceId
        const decoded = jwt.decode(token) as { deviceId?: string };
        if (decoded?.deviceId) {
          // Eliminar sesión activa
          this.activeSessions.delete(decoded.deviceId);
        }
      } catch (error) {
        logger.error("Error al decodificar token durante logout:", error);
      }
    }

    // Limpiar token almacenado
    clearAuth();
    logger.info("Usuario cerró sesión");
    return { success: true };
  }

  /**
   * Verifica si un token es válido
   */
  public verifyToken(token: string): {
    valid: boolean;
    user?: any;
    error?: string;
  } {
    if (!token) {
      return { valid: false, error: "Token no proporcionado" };
    }

    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        audience: JWT_OPTIONS.audience,
        issuer: JWT_OPTIONS.issuer,
        algorithms: [JWT_OPTIONS.algorithm],
      });

      // Verificar si la sesión está registrada (para tokens con deviceId)
      if ((decoded as any).deviceId) {
        const deviceId = (decoded as any).deviceId;
        const session = this.activeSessions.get(deviceId);

        if (!session) {
          logger.warn(
            `Token válido pero sesión no encontrada para deviceId: ${deviceId}`
          );
          return { valid: false, error: "Sesión no encontrada" };
        }

        // Actualizar última actividad
        session.lastActivity = Date.now();
        this.activeSessions.set(deviceId, session);
      }

      return { valid: true, user: decoded };
    } catch (error) {
      // Si el error es por expiración, loggear específicamente
      if (error instanceof jwt.TokenExpiredError) {
        logger.info("Token de autenticación expirado");
        return { valid: false, error: "Token expirado" };
      } else {
        logger.warn("Error en verificación de token:", error);
        return {
          valid: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      }
    }
  }

  /**
   * Renueva un token si está próximo a expirar
   */
  public refreshToken(token: string): {
    valid: boolean;
    user?: any;
    token?: string;
    renewed: boolean;
    expiresAt?: string;
    error?: string;
  } {
    if (!token) {
      return { valid: false, renewed: false, error: "Token no proporcionado" };
    }

    try {
      // Verificar token actual
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        audience: JWT_OPTIONS.audience,
        issuer: JWT_OPTIONS.issuer,
        algorithms: [JWT_OPTIONS.algorithm],
      }) as {
        id: string;
        email: string;
        role: string;
        exp: number;
        iat?: number;
        deviceId?: string;
      };

      // Si queda menos de 1 hora para expirar, renovar
      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      const oneHourInMs = 60 * 60 * 1000;

      if (expiryTime - now < oneHourInMs) {
        logger.info(
          `Renovando token para usuario: ${decoded.email} (expira en menos de 1 hora)`
        );

        // Generar nuevo token (mantener la duración original)
        const tokenIat = decoded.iat || 0;
        const originalDuration = expiryTime - tokenIat * 1000;
        const tokenExpiresIn = Math.max(
          Math.floor(originalDuration / 1000),
          3600
        ); // Mínimo 1 hora

        const { token: newToken, expiresAt } = this.generateToken({
          userId: decoded.id,
          email: decoded.email,
          role: decoded.role,
          deviceId: decoded.deviceId,
          expiresIn: `${tokenExpiresIn}s`,
        });

        return {
          valid: true,
          user: decoded,
          token: newToken,
          renewed: true,
          expiresAt: new Date(expiresAt).toISOString(),
        };
      }

      return {
        valid: true,
        user: decoded,
        renewed: false,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.info("Intento de renovar token expirado");
        return { valid: false, renewed: false, error: "Token expirado" };
      } else {
        logger.warn("Error al renovar token:", error);
        return {
          valid: false,
          renewed: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      }
    }
  }

  /**
   * Verifica si un usuario tiene un rol específico
   */
  public hasRole(token: string, requiredRoles: string[]): boolean {
    try {
      const { valid, user } = this.verifyToken(token);

      if (!valid || !user) {
        return false;
      }

      // Si no hay roles requeridos, permitir acceso
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      // Verificar si el usuario tiene alguno de los roles requeridos
      return requiredRoles.includes(user.role);
    } catch (error) {
      logger.error("Error al verificar rol:", error);
      return false;
    }
  }

  /**
   * Invalida todas las sesiones de un usuario
   */
  public invalidateUserSessions(userId: string): void {
    // Buscar y eliminar todas las sesiones del usuario
    for (const [deviceId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(deviceId);
        logger.info(
          `Sesión invalidada para usuario ${userId} en dispositivo ${deviceId}`
        );
      }
    }
  }

  /**
   * Genera un token JWT
   */
  private generateToken(params: {
    userId: string;
    email: string;
    role: string;
    deviceId?: string;
    rememberMe?: boolean;
    expiresIn?: string;
  }): { token: string; expiresAt: number } {
    const { userId, email, role, deviceId, rememberMe, expiresIn } = params;

    // Configurar tiempo de expiración según la opción "recordarme" o el valor proporcionado
    const tokenExpiresIn = expiresIn || (rememberMe ? "30d" : "8h");

    // Generar deviceId si no existe
    const finalDeviceId = deviceId || uuidv4();

    // Generar token JWT
    const token = jwt.sign(
      {
        id: userId,
        email,
        role,
        deviceId: finalDeviceId,
        iat: Math.floor(Date.now() / 1000),
      },
      this.JWT_SECRET as jwt.Secret,
      {
        algorithm: JWT_OPTIONS.algorithm,
        audience: JWT_OPTIONS.audience,
        issuer: JWT_OPTIONS.issuer,
        expiresIn: tokenExpiresIn,
      } as jwt.SignOptions
    );

    // Guardar token en el store
    setAuthToken(token);

    // Decodificar token para obtener fecha de expiración
    const decoded = jwt.decode(token) as { exp: number };
    const expiresAt = decoded.exp * 1000;

    // Registrar sesión activa si hay deviceId
    if (finalDeviceId) {
      this.activeSessions.set(finalDeviceId, {
        userId,
        deviceId: finalDeviceId,
        token,
        expiresAt,
        lastActivity: Date.now(),
      });
    }

    return { token, expiresAt };
  }

  /**
   * Maneja el login de usuarios predefinidos (admin, ra)
   */
  private handleDefaultUserLogin(
    email: string,
    rememberMe: boolean,
    deviceId?: string
  ) {
    logger.info(`Inicio de sesión especial: ${email}`);

    // Crear datos de usuario predeterminados
    const isAdmin = email.startsWith("admin@");
    const defaultUser = {
      id: isAdmin ? "admin-user-id" : "ra-user-id",
      email,
      name: isAdmin ? "Administrador" : "Responsable Administrativo",
      role: {
        id: isAdmin ? "admin-role-id" : "ra-role-id",
        name: isAdmin ? "Admin" : "RA",
        description: isAdmin
          ? "Administrador del sistema"
          : "Responsable Administrativo",
        permissions: {
          // Permisos amplios para ambos
          contracts: { read: true, write: true, delete: true },
          users: { read: true, write: true, delete: isAdmin },
          settings: { view: true, modify: isAdmin },
          reports: { view: true, export: true },
        },
      },
      isActive: true,
      lastLogin: new Date(),
    };

    // Generar token y registrar sesión
    const { token, expiresAt } = this.generateToken({
      userId: defaultUser.id,
      email: defaultUser.email,
      role: defaultUser.role.name,
      deviceId,
      rememberMe,
    });

    return {
      token,
      user: defaultUser,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  /**
   * Verifica si es un usuario especial predefinido (admin o ra)
   */
  private isDefaultUser(email: string): boolean {
    const domain = "pacta.app";
    return email === `admin@${domain}` || email === `ra@${domain}`;
  }

  /**
   * Inicia tareas de limpieza periódicas
   */
  private startCleanupTasks() {
    // Limpiar sesiones expiradas cada hora
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);
  }

  /**
   * Limpia las sesiones expiradas
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let count = 0;

    // Buscar sesiones expiradas
    for (const [deviceId, session] of this.activeSessions.entries()) {
      if (session.expiresAt < now) {
        this.activeSessions.delete(deviceId);
        count++;
      }
    }

    if (count > 0) {
      logger.info(
        `Limpieza de sesiones: ${count} sesiones expiradas eliminadas`
      );
    }
  }

  /**
   * Registrar una sesión activa
   */
  private registerActiveSession(session: ActiveSession): void {
    this.activeSessions.set(session.deviceId, session);
  }
}

// Exportar instancia global
export const authService = AuthService.getInstance();
