const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { withErrorHandling } = require("../utils/error-handler.cjs");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_EXPIRES_IN = "8h";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function registerAuthHandlers(eventManager) {
  const handlers = {
    [IPC_CHANNELS.AUTH.LOGIN]: withErrorHandling(
      IPC_CHANNELS.AUTH.LOGIN,
      async (event, credentials) => {
        console.info("Intento de inicio de sesión", {
          email: credentials?.email,
        });
        const { email, password } = LoginSchema.parse(credentials);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive)
          throw new Error("Usuario o contraseña incorrectos");
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Usuario o contraseña incorrectos");
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
          success: true,
          data: {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              roleId: user.roleId,
            },
          },
        };
      }
    ),

    [IPC_CHANNELS.AUTH.LOGOUT]: withErrorHandling(
      IPC_CHANNELS.AUTH.LOGOUT,
      async (event, userId) => {
        console.info("Cierre de sesión solicitado", { userId });
        await prisma.historyRecord.create({
          data: {
            entityType: "user",
            entityId: userId,
            userId,
            action: "logout",
            details: "Cierre de sesión",
            timestamp: new Date(),
          },
        });
        return { success: true, data: true };
      }
    ),

    [IPC_CHANNELS.AUTH.VERIFY]: withErrorHandling(
      IPC_CHANNELS.AUTH.VERIFY,
      async (event, token) => {
        console.info("Verificación de token solicitada");
        try {
          const payload = jwt.verify(token, JWT_SECRET);
          return { success: true, data: { valid: true, payload } };
        } catch (error) {
          console.warn("Token inválido:", error);
          return { success: true, data: { valid: false } };
        }
      }
    ),

    [IPC_CHANNELS.AUTH.REFRESH]: withErrorHandling(
      IPC_CHANNELS.AUTH.REFRESH,
      async (event, refreshToken) => {
        console.info("Refresco de token solicitado");
        const payload = jwt.verify(refreshToken, JWT_SECRET);
        if (
          typeof payload !== "object" ||
          !payload ||
          !payload.id ||
          !payload.email ||
          !payload.roleId
        ) {
          throw new Error("Refresh token inválido");
        }
        const newToken = jwt.sign(
          {
            id: payload.id,
            email: payload.email,
            roleId: payload.roleId,
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );
        return { success: true, data: { token: newToken } };
      }
    ),
  };

  eventManager.registerHandlers(handlers);
}

module.exports = { registerAuthHandlers };
