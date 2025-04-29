import { prisma } from "../lib/prisma";
import { withErrorHandling } from "../ipc/setup";
import { logger } from "../utils/logger";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getAuthToken, setAuthToken, clearAuth } from "../store/store-manager";
import { z } from "zod";
import { ErrorHandler } from "../ipc/error-handler";
import { AuthChannels } from "../ipc/channels/auth.channels";

// Definir esquemas de validación con zod
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
  rememberMe: z.boolean().optional().default(false),
  deviceId: z.string().optional(),
  isSpecialUser: z.boolean().optional().default(false),
});

// Clave secreta para JWT (prioridad a variables de entorno, o generar aleatoria)
const JWT_SECRET =
  process.env.JWT_SECRET || crypto.randomBytes(64).toString("hex");

// Configuración de opciones de JWT
const JWT_OPTIONS = {
  algorithm: "HS256" as jwt.Algorithm,
  audience: "pacta-app",
  issuer: "pacta-auth",
};

// Comprobar si es un usuario especial predefinido (admin o ra)
const isDefaultUser = (email: string): boolean => {
  const domain = "pacta.app";
  return email === `admin@${domain}` || email === `ra@${domain}`;
};

export function setupAuthHandlers(): void {
  // Iniciar sesión
  withErrorHandling(AuthChannels.LOGIN, async (_, loginData) => {
    try {
      // Validar datos de entrada con zod
      const { email, password, rememberMe, isSpecialUser, deviceId } =
        loginSchema.parse(loginData);

      // Verificar si es un usuario especial predefinido
      const isDefaultSpecialUser = isDefaultUser(email) && password === "pacta";

      // Si es un usuario predefinido y la contraseña coincide,
      // o si el cliente indica que es un usuario especial, saltarse la verificación de BD
      if (isDefaultSpecialUser || (isSpecialUser && isDefaultUser(email))) {
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

        // Configurar tiempo de expiración según la opción "recordarme"
        const expiresIn = rememberMe ? "30d" : "8h";

        // Generar token JWT
        const token = jwt.sign(
          {
            id: defaultUser.id,
            email: defaultUser.email,
            role: defaultUser.role.name,
            iat: Math.floor(Date.now() / 1000),
            isDefaultUser: true, // Marcar como usuario predeterminado en el token
          },
          JWT_SECRET,
          {
            expiresIn,
            algorithm: JWT_OPTIONS.algorithm,
            audience: JWT_OPTIONS.audience,
            issuer: JWT_OPTIONS.issuer,
          }
        );

        // Guardar token en el store
        setAuthToken(token);

        // Decodificar token para obtener fecha de expiración
        const decoded = jwt.decode(token) as { exp: number };
        const expiresAt = new Date(decoded.exp * 1000).toISOString();

        return {
          token,
          user: defaultUser,
          expiresAt,
        };
      }

      // Proceso normal de autenticación para usuarios regulares
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          role: true,
        },
      });

      if (!user) {
        logger.warn(
          `Intento de inicio de sesión con email no encontrado: ${email}`
        );
        throw ErrorHandler.createError(
          "AuthenticationError",
          "Credenciales inválidas"
        );
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        logger.warn(
          `Intento de inicio de sesión con usuario desactivado: ${email}`
        );
        throw ErrorHandler.createError(
          "AuthenticationError",
          "Usuario desactivado"
        );
      }

      // Comparar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logger.warn(`Contraseña incorrecta para usuario: ${email}`);
        throw ErrorHandler.createError(
          "AuthenticationError",
          "Credenciales inválidas"
        );
      }

      // Configurar tiempo de expiración según la opción "recordarme"
      const expiresIn = rememberMe ? "30d" : "8h";

      // Generar token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role.name,
          iat: Math.floor(Date.now() / 1000),
          deviceId, // Incluir deviceId si existe
        },
        JWT_SECRET,
        {
          expiresIn,
          algorithm: JWT_OPTIONS.algorithm,
          audience: JWT_OPTIONS.audience,
          issuer: JWT_OPTIONS.issuer,
        }
      );

      // Actualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Guardar token en el store con la información de expiración
      setAuthToken(token);

      logger.info(
        `Usuario autenticado: ${user.email} ${
          rememberMe ? "(sesión extendida)" : ""
        }`
      );

      // Decodificar token para obtener la fecha de expiración
      const decoded = jwt.decode(token) as { exp: number };
      const expiresAt = new Date(decoded.exp * 1000).toISOString();

      // Devolver datos del usuario (sin contraseña)
      const { password: _, ...userWithoutPassword } = user;
      return {
        token,
        user: userWithoutPassword,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Transformar errores de validación de zod en un formato más amigable
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        logger.warn("Error de validación en login:", validationErrors);
        throw ErrorHandler.createError(
          "ValidationError",
          `Error de validación: ${validationErrors[0].message}`
        );
      }
      throw error;
    }
  });

  // Cerrar sesión
  withErrorHandling(AuthChannels.LOGOUT, async () => {
    clearAuth();
    logger.info("Usuario cerró sesión");
    return { success: true };
  });

  // Verificar token
  withErrorHandling(AuthChannels.VERIFY_TOKEN, async () => {
    const token = getAuthToken();

    if (!token) {
      return { valid: false };
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        audience: JWT_OPTIONS.audience,
        issuer: JWT_OPTIONS.issuer,
        algorithms: [JWT_OPTIONS.algorithm],
      });

      return { valid: true, user: decoded };
    } catch (error) {
      // Si el error es por expiración, loggear específicamente
      if (error instanceof jwt.TokenExpiredError) {
        logger.info("Token de autenticación expirado");
      } else {
        logger.warn("Error en verificación de token:", error);
      }

      clearAuth();
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  });

  // Renovar token (si está próximo a expirar)
  withErrorHandling("auth:refresh", async () => {
    const token = getAuthToken();

    if (!token) {
      return { valid: false };
    }

    try {
      // Verificar token actual
      const decoded = jwt.verify(token, JWT_SECRET, {
        audience: JWT_OPTIONS.audience,
        issuer: JWT_OPTIONS.issuer,
        algorithms: [JWT_OPTIONS.algorithm],
      }) as {
        id: string;
        email: string;
        role: string;
        exp: number;
        iat?: number;
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

        const newToken = jwt.sign(
          {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
          },
          JWT_SECRET,
          {
            expiresIn: `${tokenExpiresIn}s`,
            algorithm: JWT_OPTIONS.algorithm,
            audience: JWT_OPTIONS.audience,
            issuer: JWT_OPTIONS.issuer,
          }
        );

        // Guardar nuevo token
        setAuthToken(newToken);

        // Decodificar nuevo token para obtener la fecha de expiración
        const newDecoded = jwt.decode(newToken) as { exp: number };
        const newExpiresAt = new Date(newDecoded.exp * 1000).toISOString();

        return {
          valid: true,
          user: decoded,
          token: newToken,
          renewed: true,
          expiresAt: newExpiresAt,
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
      } else {
        logger.warn("Error al renovar token:", error);
      }

      clearAuth();
      return {
        valid: false,
        renewed: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  });
}
