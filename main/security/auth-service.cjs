const { prisma } = require("../utils/prisma.cjs");
const { logger } = require("../utils/logger.cjs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { setAuthToken, clearAuth } = require("../store/store-manager.cjs");
const { rateLimiter } = require("./rate-limiter.cjs");
const { securityManager } = require("./security-manager.cjs");
const { v4: uuidv4 } = require("uuid");

// Configuración de opciones de JWT
const JWT_OPTIONS = {
  algorithm: "HS256",
  audience: "pacta-app",
  issuer: "pacta-auth",
  expiresIn: "1h",
  notBefore: "0",
  jwtid: uuidv4(),
};

// Tipos para sesiones activas
/**
 * @typedef {Object} ActiveSession
 * @property {string} userId - ID del usuario
 * @property {string} deviceId - ID del dispositivo
 * @property {string} token - Token JWT
 * @property {number} expiresAt - Timestamp de expiración
 * @property {number} lastActivity - Timestamp de última actividad
 * @property {string} [ipAddress] - Dirección IP opcional
 * @property {string} [userAgent] - User Agent opcional
 */

/**
 * Servicio de autenticación mejorado con gestión de sesiones,
 * protección contra ataques de fuerza bruta y validación de roles.
 */
class AuthService {
  static #instance;
  #activeSessions = new Map();
  #JWT_SECRET;
  #MAX_LOGIN_ATTEMPTS = 5;
  #LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos
  #failedAttempts = new Map();

  constructor() {
    // Obtener clave secreta para JWT
    this.#JWT_SECRET = securityManager.getJwtSecret();

    // Iniciar limpieza periódica de sesiones expiradas
    this.startCleanupTasks();
  }

  /**
   * Obtiene la instancia única del AuthService (Singleton)
   */
  static getInstance() {
    if (!AuthService.#instance) {
      AuthService.#instance = new AuthService();
    }
    return AuthService.#instance;
  }

  /**
   * Autentica un usuario con email y contraseña
   */
  async login(params) {
    const {
      email,
      password,
      rememberMe = false,
      deviceId,
      ipAddress,
      userAgent,
    } = params;

    // Verificar si la cuenta está bloqueada
    const lockoutStatus = this.#checkAccountLockout(email);
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
      this.#incrementFailedAttempts(email);
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
        this.#incrementFailedAttempts(email);
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
        this.#incrementFailedAttempts(email);
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
  #checkAccountLockout(email) {
    const attempt = this.#failedAttempts.get(email);
    if (!attempt) return { isLocked: false, remainingTime: 0 };

    if (
      attempt.count >= this.#MAX_LOGIN_ATTEMPTS &&
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
  #incrementFailedAttempts(email) {
    const attempt = this.#failedAttempts.get(email) || {
      count: 0,
      lockoutUntil: 0,
    };
    attempt.count++;

    if (attempt.count >= this.#MAX_LOGIN_ATTEMPTS) {
      attempt.lockoutUntil = Date.now() + this.#LOCKOUT_DURATION;
    }

    this.#failedAttempts.set(email, attempt);
  }

  /**
   * Resetea los intentos fallidos
   */
  #resetFailedAttempts(email) {
    this.#failedAttempts.delete(email);
  }

  /**
   * Cierra la sesión de un usuario
   */
  async logout(token) {
    if (token) {
      try {
        // Decodificar token sin verificar para obtener deviceId
        const decoded = jwt.decode(token);
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
  verifyToken(token) {
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
      if (decoded && typeof decoded === "object" && "deviceId" in decoded) {
        const deviceId = decoded.deviceId;
        const session = this.#activeSessions.get(deviceId);

        if (!session) {
          logger.warn(
            `Token válido pero sesión no encontrada para deviceId: ${deviceId}`
          );
          return { valid: false, error: "Sesión no encontrada" };
        }

        // Actualizar última actividad
        session.lastActivity = Date.now();
        this.#activeSessions.set(deviceId, session);
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
  refreshToken(token) {
    if (!token) {
      return { valid: false, renewed: false, error: "Token no proporcionado" };
    }

    try {
      // Verificar token actual
      /**
       * @typedef {Object} TokenPayload
       * @property {string} id - ID del usuario
       * @property {string} email - Email del usuario
       * @property {string} role - Rol del usuario
       * @property {number} exp - Timestamp de expiración
       * @property {number} [iat] - Timestamp de emisión
       * @property {string} [deviceId] - ID del dispositivo
       */
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        audience: JWT_OPTIONS.audience,
        issuer: JWT_OPTIONS.issuer,
        algorithms: [JWT_OPTIONS.algorithm],
      });

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
  hasRole(token, requiredRoles) {
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
  invalidateUserSessions(userId) {
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
  #generateToken(params) {
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
      this.#JWT_SECRET,
      {
        algorithm: JWT_OPTIONS.algorithm,
        audience: JWT_OPTIONS.audience,
        issuer: JWT_OPTIONS.issuer,
        expiresIn: tokenExpiresIn,
      }
    );

    // Guardar token en el store
    setAuthToken(token);

    // Decodificar token para obtener fecha de expiración
    const decoded = jwt.decode(token);
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
  #handleDefaultUserLogin(email, rememberMe, deviceId) {
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
  #isDefaultUser(email) {
    const domain = "pacta.app";
    return email === `admin@${domain}` || email === `ra@${domain}`;
  }

  /**
   * Inicia tareas de limpieza periódicas
   */
  startCleanupTasks() {
    // Limpiar sesiones expiradas cada hora
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);
  }

  /**
   * Limpia las sesiones expiradas
   */
  cleanupExpiredSessions() {
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
  registerActiveSession(session) {
    this.activeSessions.set(session.deviceId, session);
  }
}

// Exportar instancia global
module.exports = {
  authService: AuthService.getInstance(),
};
