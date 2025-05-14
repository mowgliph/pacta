# Manejadores IPC de PACTA

## Introducción

Esta carpeta contiene los manejadores de comunicación entre procesos (IPC) que permiten al proceso de renderizado (UI) comunicarse con el proceso principal de Electron. Estos manejadores son fundamentales para la arquitectura de PACTA, ya que implementan toda la lógica de negocio del lado del servidor, incluyendo acceso a base de datos, operaciones del sistema y gestión de archivos.

## Estructura General

Cada manejador sigue una estructura común en JavaScript puro (CommonJS):

```js
// 1. Importaciones
const { EventManager } = require("../events/event-manager.cjs");
const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const logger = require("../utils/logger.cjs");

// 2. Función de registro
function registerXxxHandlers(eventManager) {
  const handlers = {
    [IPC_CHANNELS.CATEGORY.OPERATION]: async (event, data) => {
      try {
        // 3. Validación de datos
        // 4. Lógica de negocio
        // 5. Retorno de resultados
        return result;
      } catch (error) {
        // 6. Manejo de errores
        logger.error("Error en operación:", error);
        throw error;
      }
    },
  };

  eventManager.registerHandlers(handlers);
}

module.exports = { registerXxxHandlers };
```

## Manejadores Disponibles

### `auth.handlers.cjs`

**Propósito**: Implementar el sistema de autenticación y gestión de sesiones.

**Funcionalidades principales**:

- Login y verificación de credenciales
- Generación y validación de tokens JWT
- Manejo de sesiones
- Cierre de sesión
- Renovación de tokens

**Canales**: `AUTH.LOGIN`, `AUTH.LOGOUT`, `AUTH.VERIFY`, etc.

### `contract.handlers.cjs`

**Propósito**: Administrar los contratos, el componente central de PACTA.

**Funcionalidades principales**:

- CRUD completo de contratos
- Búsqueda y filtrado avanzado
- Control de acceso por usuario/rol
- Historial de cambios
- Asignación de usuarios

**Canales**: `DATA.CONTRACTS.LIST`, `DATA.CONTRACTS.CREATE`, `DATA.CONTRACTS.UPDATE`, etc.

### `document.handlers.cjs`

**Propósito**: Gestionar los documentos y archivos relacionados con contratos y suplementos.

**Funcionalidades principales**:

- Subida segura de archivos
- Metadatos y categorización
- Descarga de documentos
- Eliminación segura
- Validación de tipos de archivo

**Canales**: `DATA.DOCUMENTS.LIST`, `DATA.DOCUMENTS.UPLOAD`, `DATA.DOCUMENTS.DELETE`, etc.

### `notification.handlers.cjs`

**Propósito**: Gestionar el sistema de notificaciones de la aplicación.

**Funcionalidades principales**:

- Creación de notificaciones
- Entrega de notificaciones a usuarios
- Marcado de notificaciones como leídas
- Listado de notificaciones con filtros

**Canales**: `NOTIFICATIONS.SHOW`, `NOTIFICATIONS.CLEAR`, `NOTIFICATIONS.MARK_READ`, etc.

### `role.handlers.cjs`

**Propósito**: Gestionar roles y permisos del sistema.

**Funcionalidades principales**:

- CRUD de roles
- Asignación de permisos
- Validación de permisos
- Gestión de accesos

**Canales**: `DATA.ROLES.LIST`, `DATA.ROLES.CREATE`, `DATA.ROLES.UPDATE`, etc.

### `statistics.handlers.cjs`

**Propósito**: Procesar y generar estadísticas del sistema.

**Funcionalidades principales**:

- Estadísticas del dashboard
- Estadísticas de contratos
- Exportación de estadísticas
- Filtrado y agrupación de datos

**Canales**: `STATISTICS.DASHBOARD`, `STATISTICS.CONTRACTS`, `STATISTICS.EXPORT`

### `supplement.handlers.cjs`

**Propósito**: Gestionar los suplementos de contratos (modificaciones, adendas, etc.).

**Funcionalidades principales**:

- CRUD completo de suplementos
- Aprobación de suplementos
- Relación con contratos
- Historial de modificaciones

**Canales**: `DATA.SUPPLEMENTS.LIST`, `DATA.SUPPLEMENTS.CREATE`, `DATA.SUPPLEMENTS.UPDATE`, etc.

### `system.handlers.cjs`

**Propósito**: Gestionar operaciones del sistema y configuración.

**Funcionalidades principales**:

- Configuración de la aplicación
- Operaciones del sistema operativo
- Gestión de archivos
- Validaciones de seguridad

**Canales**: `SYSTEM.OPEN_FILE`, `SYSTEM.SAVE_FILE`, `SYSTEM.SETTINGS`, etc.

### `user.handlers.cjs`

**Propósito**: Administrar usuarios y sus perfiles.

**Funcionalidades principales**:

- CRUD de usuarios
- Gestión de perfiles
- Cambio de contraseñas
- Activación/desactivación de cuentas

**Canales**: `DATA.USERS.LIST`, `DATA.USERS.CREATE`, `DATA.USERS.UPDATE`, etc.

## Patrones Comunes

### Validación de Datos

Todos los manejadores utilizan esquemas Zod para validar datos de entrada:

```js
const dataSchema = z.object({
  field1: z.string(),
  field2: z.number().min(1),
});

// En el manejador
const validatedData = dataSchema.parse(inputData);
```

### Manejo de Errores

Los errores se gestionan de forma centralizada:

```js
try {
  // Operación
} catch (error) {
  if (error instanceof z.ZodError) {
    throw new Error("Datos inválidos");
  }
  logger.error("Error en operación:", error);
  throw error;
}
```

### Seguridad y Permisos

Verificación de permisos antes de operaciones sensibles:

```js
// Verificar si el usuario tiene permisos
if (userRole !== "Admin" && userId !== resource.ownerId) {
  throw new Error("Sin permisos");
}
```

## Mejores Prácticas

1. **Usar canales constantes**: Siempre usar las constantes definidas en `ipc-channels.cjs`
2. **Validar toda entrada**: Validar todos los datos de entrada con Zod
3. **Registrar errores**: Usar logger para registrar errores y actividades importantes
4. **Separar responsabilidades**: Usar servicios para la lógica de negocio
5. **Seguir patrones establecidos**: Mantener consistencia entre manejadores
6. **Documentar comportamiento**: Agregar JSDoc y comentarios para claridad

## Extensión

Para agregar un nuevo manejador:

1. Definir canales en `ipc-channels.cjs`
2. Crear archivo `feature.handlers.cjs` en `handlers/`
3. Implementar función `registerFeatureHandlers`
4. Registrar en el index correspondiente

## Referencias

- [Documentación de Electron IPC](https://www.electronjs.org/docs/latest/api/ipc-main)
- [Patrón Mediador](https://refactoring.guru/design-patterns/mediator)
- [Documentación de Zod](https://zod.dev/)
