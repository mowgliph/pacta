import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { authService } from "./auth-service";

/**
 * Interfaz para definir la estructura de permisos
 */
export interface Permission {
  resource: string;
  actions: {
    read?: boolean;
    write?: boolean;
    delete?: boolean;
    execute?: boolean;
  };
}

/**
 * Interfaz para definir la estructura de permisos por rol
 */
export interface RolePermissions {
  [resource: string]: {
    read?: boolean;
    write?: boolean;
    delete?: boolean;
    execute?: boolean;
    view?: boolean;
    modify?: boolean;
    export?: boolean;
  };
}

/**
 * Servicio para la gestión de permisos y control de acceso
 * basado en roles (RBAC) en la aplicación.
 */
export class PermissionService {
  private static instance: PermissionService;

  // Caché de permisos por rol para evitar consultas repetidas
  private rolePermissionsCache: Map<string, RolePermissions> = new Map();

  // Tiempo de expiración de la caché (5 minutos)
  private readonly CACHE_EXPIRY_MS = 5 * 60 * 1000;

  // Timestamps de última actualización de caché por rol
  private cacheTimestamps: Map<string, number> = new Map();

  private constructor() {
    // Iniciar limpieza periódica de caché
    this.startCleanupTasks();
  }

  /**
   * Obtiene la instancia única del PermissionService (Singleton)
   */
  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Verifica si un usuario tiene permiso para realizar una acción sobre un recurso
   * @param userId ID del usuario
   * @param resource Recurso al que se quiere acceder (ej: 'contracts', 'users')
   * @param action Acción que se quiere realizar (ej: 'read', 'write', 'delete')
   * @returns Promise<boolean> true si tiene permiso, false si no
   */
  public async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      // Obtener usuario con su rol
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        logger.warn(`Usuario no encontrado al verificar permisos: ${userId}`);
        return false;
      }

      // Los administradores tienen todos los permisos
      if (user.role.name === "Admin") {
        return true;
      }

      // Obtener permisos del rol (desde caché o BD)
      const rolePermissions = await this.getRolePermissions(user.role.id);

      // Verificar si el rol tiene permisos para el recurso y acción
      return Boolean(
        rolePermissions &&
          rolePermissions[resource] &&
          rolePermissions[resource][action]
      );
    } catch (error) {
      logger.error(
        `Error al verificar permisos para usuario ${userId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Verifica si un token JWT tiene permiso para realizar una acción sobre un recurso
   * @param token Token JWT del usuario
   * @param resource Recurso al que se quiere acceder
   * @param action Acción que se quiere realizar
   * @returns boolean true si tiene permiso, false si no
   */
  public verifyTokenPermission(
    token: string,
    resource: string,
    action: string
  ): boolean {
    try {
      // Verificar validez del token
      const { valid, user } = authService.verifyToken(token);

      if (!valid || !user) {
        return false;
      }

      // Si es administrador, tiene todos los permisos
      if (user.role === "Admin") {
        return true;
      }

      // Verificar permisos específicos (si están incluidos en el token)
      if (user.permissions) {
        return Boolean(
          user.permissions[resource] && user.permissions[resource][action]
        );
      }

      // Si no hay información de permisos en el token, consultar BD
      // Nota: esto requiere una consulta adicional, es mejor incluir permisos en el token
      return false;
    } catch (error) {
      logger.error("Error al verificar permisos del token:", error);
      return false;
    }
  }

  /**
   * Obtiene los permisos de un rol (con caché)
   * @param roleId ID del rol
   * @returns Promise<RolePermissions> Permisos del rol
   */
  public async getRolePermissions(roleId: string): Promise<RolePermissions> {
    try {
      // Verificar si los permisos están en caché y no han expirado
      const cachedTimestamp = this.cacheTimestamps.get(roleId);
      const now = Date.now();

      if (
        cachedTimestamp &&
        now - cachedTimestamp < this.CACHE_EXPIRY_MS &&
        this.rolePermissionsCache.has(roleId)
      ) {
        return this.rolePermissionsCache.get(roleId)!;
      }

      // Si no están en caché o han expirado, obtener de BD
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        select: { permissions: true },
      });

      if (!role) {
        logger.warn(`Rol no encontrado al obtener permisos: ${roleId}`);
        return {};
      }

      // Convertir permisos (pueden estar almacenados como string JSON)
      const permissions: RolePermissions =
        typeof role.permissions === "string"
          ? JSON.parse(role.permissions)
          : role.permissions || {};

      // Actualizar caché
      this.rolePermissionsCache.set(roleId, permissions);
      this.cacheTimestamps.set(roleId, now);

      return permissions;
    } catch (error) {
      logger.error(`Error al obtener permisos del rol ${roleId}:`, error);
      return {};
    }
  }

  /**
   * Invalida la caché de permisos para un rol específico
   * @param roleId ID del rol
   */
  public invalidateRoleCache(roleId: string): void {
    this.rolePermissionsCache.delete(roleId);
    this.cacheTimestamps.delete(roleId);
    logger.info(`Caché de permisos invalidada para rol: ${roleId}`);
  }

  /**
   * Invalida toda la caché de permisos
   */
  public invalidateAllCache(): void {
    this.rolePermissionsCache.clear();
    this.cacheTimestamps.clear();
    logger.info("Caché de permisos completamente invalidada");
  }

  /**
   * Inicia tareas de limpieza periódicas
   */
  private startCleanupTasks(): void {
    // Limpiar caché expirada cada hora
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60 * 60 * 1000);
  }

  /**
   * Limpia las entradas de caché expiradas
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let count = 0;

    // Buscar entradas expiradas
    for (const [roleId, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > this.CACHE_EXPIRY_MS) {
        this.rolePermissionsCache.delete(roleId);
        this.cacheTimestamps.delete(roleId);
        count++;
      }
    }

    if (count > 0) {
      logger.info(`Limpieza de caché: ${count} entradas expiradas eliminadas`);
    }
  }
}

// Exportar instancia global
export const permissionService = PermissionService.getInstance();
