import { EventManager } from "../events/event-manager";
import { IPC_CHANNELS } from "../channels/ipc-channels";
import { IpcHandlerMap } from "../channels/types";
import { logger } from "../utils/logger";
import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { withErrorHandling } from "../utils/error-handler";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_EXPIRES_IN = "8h";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function registerAuthHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.AUTH.LOGIN]: withErrorHandling(
      IPC_CHANNELS.AUTH.LOGIN,
      async (event: Electron.IpcMainInvokeEvent, credentials: any) => {
        logger.info("Intento de inicio de sesión", {
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
        logger.info("Login exitoso", { userId: user.id });
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
      async (event: Electron.IpcMainInvokeEvent, userId: string) => {
        logger.info("Cierre de sesión solicitado", { userId });
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
      async (event: Electron.IpcMainInvokeEvent, token: string) => {
        logger.info("Verificación de token solicitada");
        try {
          const payload = jwt.verify(token, JWT_SECRET);
          return { success: true, data: { valid: true, payload } };
        } catch (error) {
          logger.warn("Token inválido:", error);
          return { success: true, data: { valid: false } };
        }
      }
    ),

    [IPC_CHANNELS.AUTH.REFRESH]: withErrorHandling(
      IPC_CHANNELS.AUTH.REFRESH,
      async (event: Electron.IpcMainInvokeEvent, refreshToken: string) => {
        logger.info("Refresco de token solicitado");
        const payload = jwt.verify(refreshToken, JWT_SECRET);
        if (
          typeof payload !== "object" ||
          !payload ||
          !("id" in payload) ||
          !("email" in payload) ||
          !("roleId" in payload)
        ) {
          throw new Error("Refresh token inválido");
        }
        const newToken = jwt.sign(
          {
            id: (payload as any).id,
            email: (payload as any).email,
            roleId: (payload as any).roleId,
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
