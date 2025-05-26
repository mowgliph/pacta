const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { EventManager } = require("../events/event-manager.cjs");
const { AppError } = require("../utils/error-handler.cjs");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "8h";

// Esquemas de validación
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const ChangePasswordSchema = z.object({
  userId: z.string().uuid(),
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

const VerifyTokenSchema = z.object({
  token: z.string().min(1),
});

function registerAuthHandlers() {
  const eventManager = EventManager.getInstance();
  
  // Verificar si ya hay manejadores registrados
  if (eventManager.handlers[IPC_CHANNELS.AUTH.LOGIN]) {
    console.log('[Auth Handlers] Los manejadores de autenticación ya están registrados');
    return;
  }
  
  console.log('[Auth Handlers] Registrando manejadores de autenticación');
  const handlers = {
    [IPC_CHANNELS.AUTH.LOGIN]: async (event, credentials) => {
      try {
        if (!credentials) {
          throw AppError.validation(
            "Credenciales requeridas",
            "CREDENTIALS_REQUIRED"
          );
        }

        const { email, password } = LoginSchema.parse(credentials);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
          throw AppError.authentication(
            "Credenciales inválidas",
            "INVALID_CREDENTIALS"
          );
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw AppError.authentication(
            "Credenciales inválidas",
            "INVALID_CREDENTIALS"
          );
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, roleId: user.roleId },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        console.info("Login exitoso", { userId: user.id });

        return {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
          },
        };
      } catch (error) {
        console.error("Error en login:", error);
        if (error.name === "ZodError") {
          throw AppError.validation(
            "Credenciales inválidas",
            "INVALID_CREDENTIALS",
            { details: error.errors }
          );
        }
        throw AppError.internal(
          "Error interno en login",
          "LOGIN_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.AUTH.VERIFY]: async (event, tokenData) => {
      try {
        if (!tokenData) {
          throw AppError.validation(
            "Datos de token requeridos",
            "TOKEN_DATA_REQUIRED"
          );
        }

        const { token } = VerifyTokenSchema.parse(tokenData);

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) {
          throw AppError.authentication(
            "Usuario no válido",
            "INVALID_USER"
          );
        }

        return user;
      } catch (error) {
        console.error("Error en verificación de token:", error);
        if (error.name === "JsonWebTokenError") {
          throw AppError.authentication(
            "Token inválido",
            "INVALID_TOKEN"
          );
        }
        throw AppError.internal(
          "Error interno en verificación",
          "VERIFY_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.AUTH.LOGOUT]: async () => {
      try {
        // No se requiere lógica especial para logout en este caso
        return true;
      } catch (error) {
        console.error("Error en logout:", error);
        throw AppError.internal(
          "Error interno en logout",
          "LOGOUT_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.AUTH.CHANGE_PASSWORD]: async (event, data) => {
      try {
        const { userId, oldPassword, newPassword } = ChangePasswordSchema.parse(data);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw AppError.notFound(
            "Usuario no encontrado",
            "USER_NOT_FOUND"
          );
        }

        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) {
          throw AppError.authentication(
            "Contraseña actual incorrecta",
            "INVALID_CURRENT_PASSWORD"
          );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });

        return true;
      } catch (error) {
        console.error("Error en cambio de contraseña:", error);
        if (error.name === "ZodError") {
          throw AppError.validation(
            "Datos inválidos para cambio de contraseña",
            "INVALID_CHANGE_PASSWORD_DATA",
            { details: error.errors }
          );
        }
        throw AppError.internal(
          "Error interno en cambio de contraseña",
          "CHANGE_PASSWORD_ERROR",
          { error: error.message }
        );
      }
    },
  };

  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerAuthHandlers,
};
