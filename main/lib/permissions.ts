import { UserSession } from '../shared/types';
import { logger } from './logger';

// Conjunto de permisos disponibles en la aplicación
export const PERMISSIONS = {
  // Módulo de usuarios
  'users.view': 'Ver usuarios',
  'users.create': 'Crear usuarios',
  'users.update': 'Actualizar usuarios',
  'users.delete': 'Eliminar usuarios',
  
  // Módulo de roles
  'roles.view': 'Ver roles',
  'roles.create': 'Crear roles',
  'roles.update': 'Actualizar roles',
  'roles.delete': 'Eliminar roles',
  
  // Módulo de contratos
  'contracts.view': 'Ver contratos',
  'contracts.create': 'Crear contratos',
  'contracts.update': 'Actualizar contratos',
  'contracts.delete': 'Eliminar contratos',
  
  // Módulo de documentos
  'documents.view': 'Ver documentos',
  'documents.create': 'Crear documentos',
  'documents.update': 'Actualizar documentos',
  'documents.delete': 'Eliminar documentos',
  
  // Permisos administrativos
  'admin.access': 'Acceso administrativo',
  'admin.settings': 'Configuración del sistema',
  'admin.backup': 'Gestionar respaldos',
  
  // Permisos especiales
  'contracts.viewAll': 'Ver todos los contratos',
  'documents.viewAll': 'Ver todos los documentos'
};

// Permisos predefinidos para roles comunes
export const ROLE_PRESETS = {
  admin: Object.keys(PERMISSIONS),
  manager: [
    'users.view',
    'contracts.view', 'contracts.create', 'contracts.update',
    'documents.view', 'documents.create', 'documents.update', 'documents.delete'
  ],
  user: [
    'contracts.view', 'contracts.create',
    'documents.view', 'documents.create'
  ],
  viewer: [
    'contracts.view', 'documents.view'
  ]
};

/**
 * Verifica si un usuario tiene el permiso especificado
 * @param user El usuario cuyo permiso se verifica
 * @param permission El permiso a verificar
 * @returns true si el usuario tiene el permiso, false en caso contrario
 */
export function checkPermission(user: UserSession, permission: string): boolean {
  try {
    // Si no hay usuario, no hay permisos
    if (!user) return false;
    
    // Si el usuario no tiene rol o permisos definidos
    if (!user.role || !user.role.permissions) return false;
    
    // Los permisos especiales admin.* otorgan acceso completo
    if (user.role.permissions.includes('admin.access')) return true;
    
    // Verificar permisos específicos
    return user.role.permissions.includes(permission);
  } catch (error) {
    logger.error(`Error checking permission ${permission} for user ${user?.email}:`, error);
    return false;
  }
}

/**
 * Verifica si un usuario tiene acceso a un recurso específico
 * @param user El usuario
 * @param resourceType Tipo de recurso (contract, document, etc.)
 * @param resourceId ID del recurso
 * @param requiredPermission Permiso necesario para acceder
 * @param ownerId ID del propietario del recurso
 * @returns true si tiene acceso, false si no
 */
export function checkResourceAccess(
  user: UserSession,
  resourceType: string,
  resourceId: number,
  requiredPermission: string,
  ownerId?: number
): boolean {
  // Si el usuario es administrador, siempre tiene acceso
  if (checkPermission(user, 'admin.access')) return true;
  
  // Verificar si tiene el permiso requerido
  if (!checkPermission(user, requiredPermission)) return false;
  
  // Si es el propietario del recurso, tiene acceso
  if (ownerId && user.id === ownerId) return true;
  
  // Verificar si tiene permiso para ver todos los recursos
  if (requiredPermission === `${resourceType}.view` && checkPermission(user, `${resourceType}.viewAll`)) 
    return true;
  
  // Si llegamos aquí, negar el acceso por defecto (principio de menor privilegio)
  return false;
}
