const { prisma } = require("../utils/prisma.cjs");
const { authService } = require("./auth-service.cjs");

// Función constructora para PermissionService (reemplaza clase)
function PermissionService() {
  if (PermissionService.instance) {
    return PermissionService.instance;
  }
  PermissionService.instance = this;

  this.rolePermissionsCache = new Map();
  this.CACHE_EXPIRY_MS = 5 * 60 * 1000;
  this.cacheTimestamps = new Map();

  this.startCleanupTasks();
}

// Métodos de PermissionService
PermissionService.prototype.hasPermission = async function (
  userId,
  resource,
  action
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      console.warn(`Usuario no encontrado al verificar permisos: ${userId}`);
      return false;
    }

    if (user.role.name === "Admin") {
      return true;
    }

    const rolePermissions = await this.getRolePermissions(user.role.id);

    return Boolean(
      rolePermissions &&
        rolePermissions[resource] &&
        typeof action === "string" &&
        Object.prototype.hasOwnProperty.call(
          rolePermissions[resource],
          action
        ) &&
        rolePermissions[resource][action]
    );
  } catch (error) {
    console.error(`Error al verificar permisos para usuario ${userId}:`, error);
    return false;
  }
};

PermissionService.prototype.verifyTokenPermission = function (
  token,
  resource,
  action
) {
  try {
    const { valid, user } = authService.verifyToken(token);

    if (!valid || !user) {
      return false;
    }

    if (user.role === "Admin") {
      return true;
    }

    if (user.permissions) {
      return Boolean(
        user.permissions[resource] && user.permissions[resource][action]
      );
    }

    return false;
  } catch (error) {
    console.error("Error al verificar permisos del token:", error);
    return false;
  }
};

PermissionService.prototype.getRolePermissions = async function (roleId) {
  try {
    const cachedTimestamp = this.cacheTimestamps.get(roleId);
    const now = Date.now();

    if (
      cachedTimestamp &&
      now - cachedTimestamp < this.CACHE_EXPIRY_MS &&
      this.rolePermissionsCache.has(roleId)
    ) {
      return this.rolePermissionsCache.get(roleId);
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: { permissions: true },
    });

    if (!role) {
      console.warn(`Rol no encontrado al obtener permisos: ${roleId}`);
      return {};
    }

    let permissions = {};
    if (typeof role.permissions === "string") {
      try {
        permissions = JSON.parse(role.permissions);
      } catch (e) {
        console.error(`Permisos mal formateados para el rol ${roleId}:`, e);
        permissions = {};
      }
    } else {
      permissions = role.permissions || {};
    }

    this.rolePermissionsCache.set(roleId, permissions);
    this.cacheTimestamps.set(roleId, now);

    return permissions;
  } catch (error) {
    console.error(`Error al obtener permisos del rol ${roleId}:`, error);
    return {};
  }
};

PermissionService.prototype.invalidateRoleCache = function (roleId) {
  this.rolePermissionsCache.delete(roleId);
  this.cacheTimestamps.delete(roleId);
  console.info(`Caché de permisos invalidada para rol: ${roleId}`);
};

PermissionService.prototype.invalidateAllCache = function () {
  this.rolePermissionsCache.clear();
  this.cacheTimestamps.clear();
  console.info("Caché de permisos completamente invalidada");
};

PermissionService.prototype.startCleanupTasks = function () {
  setInterval(() => this.cleanupExpiredCache(), 60 * 60 * 1000);
};

PermissionService.prototype.cleanupExpiredCache = function () {
  const now = Date.now();
  let count = 0;

  for (const [roleId, timestamp] of this.cacheTimestamps.entries()) {
    if (now - timestamp > this.CACHE_EXPIRY_MS) {
      this.rolePermissionsCache.delete(roleId);
      this.cacheTimestamps.delete(roleId);
      count++;
    }
  }

  if (count > 0) {
    console.info(`Limpieza de caché: ${count} entradas expiradas eliminadas`);
  }
};

// Instancia única
const permissionService = new PermissionService();

// Exportaciones
module.exports = { PermissionService, permissionService };
