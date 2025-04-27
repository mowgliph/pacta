import { prisma } from "../lib/prisma";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../lib/config";
import { logger } from "../lib/logger";
import { AppError } from "../middleware/error.middleware";
import { LoginCredentials, AuthResult, UserSession } from "../shared/types";

/**
 * Servicio de autenticación y autorización
 */
export class AuthService {
  /**
   * Autentica a un usuario con email y contraseña
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password, rememberMe = false } = credentials;

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // Verificar si existe el usuario
    if (!user) {
      logger.warn(
        `Intento de inicio de sesión con email inexistente: ${email}`
      );
      throw AppError.unauthorized(
        "Credenciales inválidas",
        "INVALID_CREDENTIALS"
      );
    }

    // Verificar contraseña
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Contraseña incorrecta para usuario: ${email}`);
      throw AppError.unauthorized(
        "Credenciales inválidas",
        "INVALID_CREDENTIALS"
      );
    }

    // Generar token JWT
    const expiresIn = rememberMe ? "30d" : "8h";
    const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn });

    // Registrar el inicio de sesión exitoso
    logger.info(`Inicio de sesión exitoso: ${user.email} (${user.role.name})`);

    // Preparar la respuesta
    const session: UserSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
        permissions: typeof user.role.permissions === 'string' 
          ? JSON.parse(user.role.permissions) 
          : user.role.permissions
      },
      token,
      expiresAt: rememberMe
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };

    return {
      success: true,
      user: session,
    };
  }

  /**
   * Cambia la contraseña de un usuario
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound("Usuario no encontrado", "USER_NOT_FOUND");
    }

    // Verificar contraseña actual
    const isPasswordValid = await compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw AppError.validation(
        "Contraseña actual incorrecta",
        "INVALID_CURRENT_PASSWORD"
      );
    }

    // Validar nueva contraseña
    if (newPassword.length < 8) {
      throw AppError.validation(
        "La nueva contraseña debe tener al menos 8 caracteres",
        "PASSWORD_TOO_SHORT"
      );
    }

    // Encriptar y actualizar la nueva contraseña
    const hashedPassword = await hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Contraseña cambiada para usuario: ${user.email}`);
    return true;
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  static async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return false;
    }

    // Los administradores tienen todos los permisos
    if (user.role.name === "Admin") {
      return true;
    }

    // Convertir los permisos del rol (almacenados como JSON)
    const permissions =
      typeof user.role.permissions === "string"
        ? JSON.parse(user.role.permissions)
        : user.role.permissions;

    return Boolean(
      permissions && permissions[resource] && permissions[resource][action]
    );
  }
}
