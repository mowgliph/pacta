# Migración del Módulo de Usuarios a SWR

## Resumen de Cambios

La migración del módulo de usuarios a SWR (Stale-While-Revalidate) ha sido completada. Los cambios realizados incluyen:

1. **Organización de Tipos:**
   - Creación de un módulo centralizado de tipos en `features/users/types/index.ts`
   - Separación clara de interfaces y enums para diferentes aspectos de los usuarios
   - Integración con los tipos del sistema global (UserStatus de @/types/enums)

2. **Implementación de Hooks SWR:**
   - Creación de hooks específicos en `features/users/hooks/useUsers.ts`
   - Soporte para operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar)
   - Configuración de tiempos de revalidación según la naturaleza de los datos

3. **Actualización de Servicios:**
   - Refactorización del servicio de usuarios para usar los nuevos tipos
   - Eliminación de tipos duplicados para mejorar la mantenibilidad
   - Adición de nuevos métodos para casos específicos (usuarios activos, por rol, etc.)

4. **Actualización de Componentes:**
   - Implementación de SWR en la página de listado de usuarios
   - Soporte para estados de carga, error y datos
   - Funcionalidades de paginación y búsqueda integradas

## Hooks Implementados

- `useUsersList`: Obtiene lista paginada y filtrada de usuarios
- `useUser`: Obtiene un usuario específico por ID
- `useCreateUser`: Crea un nuevo usuario
- `useUpdateUser`: Actualiza un usuario existente
- `useDeleteUser`: Elimina un usuario
- `useUpdateAvatar`: Actualiza el avatar de un usuario
- `useResetUserPassword`: Reinicia la contraseña de un usuario
- `useUpdateUserPermissions`: Actualiza los permisos de un usuario
- `useChangePassword`: Cambia la contraseña del usuario actual
- `useActiveUsers`: Obtiene lista de usuarios activos
- `useUsersByRole`: Obtiene usuarios filtrados por rol

## Tipos Implementados

- `UserDetails`: Datos completos de un usuario
- `UserSearchParams`: Parámetros para búsqueda y filtrado de usuarios
- `UsersResponse`: Respuesta paginada de usuarios
- `CreateUserData`: Datos para crear un usuario
- `UpdateUserData`: Datos para actualizar un usuario
- `ChangePasswordData`: Datos para cambiar contraseña
- `UserProfileData`: Datos para mostrar en perfil de usuario
- `UserPermission`: Enum de permisos disponibles
- `UserRole`: Enum de roles disponibles

## Configuración de SWR

La configuración de SWR se ha optimizado para diferentes tipos de datos:

- Lista de usuarios: revalidación cada 10 minutos
- Detalles de usuario: revalidación cada 5 minutos
- Usuarios activos: revalidación cada 30 minutos
- Usuarios por rol: revalidación cada 15 minutos

## Funcionalidades Mejoradas

- **Manejo de Estado**: Visualización clara de estados de carga y error
- **Paginación**: Navegación sencilla entre páginas de resultados
- **Búsqueda**: Filtrado de usuarios por términos de búsqueda
- **UX Mejorada**: Esqueletos de carga, mensajes de error útiles
- **Optimistic Updates**: Actualización inmediata de la UI antes de completar operaciones

## Consideraciones para Implementación

- Solo existen dos tipos de usuario: Admin y RA (según requerimientos)
- El usuario invitado puede visitar dashboard, estadísticas y contratos
- Para modificar o agregar contratos, se debe iniciar sesión con usuario existente

## Próximos Pasos

- Implementar gestión de roles y permisos más granular
- Añadir funcionalidad para gestionar perfiles de usuario
- Mejorar la visualización de errores y validaciones
- Integrar con sistema de notificaciones para cambios relevantes 