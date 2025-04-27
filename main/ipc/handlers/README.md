# Manejadores IPC de PACTA

## Introducción

Esta carpeta contiene los manejadores de comunicación entre procesos (IPC) que permiten al proceso de renderizado (UI) comunicarse con el proceso principal de Electron. Estos manejadores son fundamentales para la arquitectura de PACTA, ya que implementan toda la lógica de negocio del lado del servidor, incluyendo acceso a base de datos, operaciones del sistema y gestión de archivos.

## Estructura General

Cada manejador sigue una estructura común:

```typescript
// 1. Importaciones
import { withErrorHandling } from '../setup';
import { logger } from '../../utils/logger';
import { XxxChannels } from '../channels/xxx.channels';

// 2. Función de configuración
export function setupXxxHandlers(): void {
  // 3. Registrar manejadores para cada canal IPC
  withErrorHandling(XxxChannels.OPERATION, async (_, data) => {
    try {
      // 4. Validación de datos
      // 5. Lógica de negocio
      // 6. Retorno de resultados
      return result;
    } catch (error) {
      // 7. Manejo de errores
      logger.error('Error en operación:', error);
      throw error;
    }
  });
}
```

## Manejadores Disponibles

### `app.ts`

**Propósito**: Gestionar operaciones relacionadas con la aplicación Electron y el sistema operativo.

**Funcionalidades principales**:
- Control de ventana (minimizar, maximizar, cerrar)
- Diálogos del sistema (abrir/guardar archivos)
- Información del sistema
- Enlaces externos seguros
- Validaciones de seguridad para operaciones del SO

**Canales**: `MINIMIZE`, `MAXIMIZE`, `QUIT`, `VERSION`, etc.

**Ejemplos de uso**:
- Minimizar/maximizar ventana
- Mostrar diálogos de confirmación
- Abrir enlaces externos de forma segura

### `auth.ts`

**Propósito**: Implementar el sistema de autenticación y gestión de sesiones.

**Funcionalidades principales**:
- Login y verificación de credenciales
- Generación y validación de tokens JWT
- Manejo de sesiones
- Cierre de sesión
- Renovación de tokens
- Soporte para usuarios predefinidos

**Canales**: `LOGIN`, `LOGOUT`, `VERIFY_TOKEN`, etc.

**Ejemplos de uso**:
- Autenticar usuario con credenciales
- Verificar validez de sesión
- Renovar token próximo a expirar

### `backup.ts`

**Propósito**: Gestionar las copias de seguridad de la base de datos.

**Funcionalidades principales**:
- Crear respaldos manuales y automáticos
- Listar respaldos disponibles
- Restaurar respaldos
- Eliminar respaldos antiguos
- Programar respaldos automáticos

**Canales**: `GET_ALL`, `CREATE`, `RESTORE`, `DELETE`, `CLEAN_OLD`

**Ejemplos de uso**:
- Crear respaldo manual antes de operaciones críticas
- Restaurar el sistema a un punto anterior
- Establecer políticas de respaldo automático

### `contracts.ts`

**Propósito**: Administrar los contratos, el componente central de PACTA.

**Funcionalidades principales**:
- CRUD completo de contratos
- Búsqueda y filtrado avanzado
- Control de acceso por usuario/rol
- Historial de cambios
- Asignación de usuarios

**Canales**: `GET_ALL`, `GET_BY_ID`, `CREATE`, `UPDATE`, `DELETE`, etc.

**Ejemplos de uso**:
- Crear nuevo contrato
- Consultar contratos con filtros
- Actualizar términos de contrato
- Gestionar acceso a contratos

### `documents.ts`

**Propósito**: Gestionar los documentos y archivos relacionados con contratos y suplementos.

**Funcionalidades principales**:
- Subida segura de archivos
- Metadatos y categorización
- Descarga de documentos
- Eliminación segura
- Validación de tipos de archivo

**Canales**: `SAVE`, `GET_BY_ID`, `UPDATE`, `DELETE`, `DOWNLOAD`, etc.

**Ejemplos de uso**:
- Adjuntar documento a un contrato
- Descargar documento
- Actualizar metadatos de documento

### `env.ts`

**Propósito**: Proporcionar acceso seguro a variables de entorno desde el proceso de renderizado.

**Funcionalidades principales**:
- Acceso controlado a variables de entorno
- Validación de solicitudes
- Protección de datos sensibles

**Canales**: `GET`

**Ejemplos de uso**:
- Obtener configuración del entorno
- Acceder a URLs de API

### `notifications.ts`

**Propósito**: Gestionar el sistema de notificaciones de la aplicación.

**Funcionalidades principales**:
- Creación de notificaciones
- Entrega de notificaciones a usuarios
- Marcado de notificaciones como leídas
- Listado de notificaciones con filtros

**Canales**: `GET_ALL`, `GET_UNREAD`, `CREATE`, `MARK_AS_READ`, etc.

**Ejemplos de uso**:
- Notificar a usuarios sobre cambios en contratos
- Obtener notificaciones no leídas
- Marcar notificaciones como leídas

### `supplements.ts`

**Propósito**: Gestionar los suplementos de contratos (modificaciones, adendas, etc.).

**Funcionalidades principales**:
- CRUD completo de suplementos
- Aprobación de suplementos
- Relación con contratos
- Historial de modificaciones

**Canales**: `GET_ALL`, `GET_BY_ID`, `CREATE`, `UPDATE`, `DELETE`, `APPROVE`

**Ejemplos de uso**:
- Crear suplemento para un contrato
- Aprobar cambios en suplemento
- Consultar historial de suplementos

### `users.ts`

**Propósito**: Administrar usuarios, roles y permisos de la aplicación.

**Funcionalidades principales**:
- CRUD de usuarios
- Gestión de roles y permisos
- Cambio de contraseñas
- Activación/desactivación de cuentas
- Asignación de roles

**Canales**: `GET_ALL`, `GET_BY_ID`, `CREATE`, `UPDATE`, `TOGGLE_ACTIVE`, `CHANGE_PASSWORD`, etc.

**Ejemplos de uso**:
- Crear nuevo usuario
- Actualizar perfil de usuario
- Cambiar rol de usuario
- Desactivar cuenta temporalmente

### `api-request.ts`

**Propósito**: Facilitar las solicitudes a APIs externas o servicios web desde el proceso principal.

**Funcionalidades principales**:
- Solicitudes HTTP seguras
- Gestión de autenticación para APIs
- Manejo de errores de red
- Validación de respuestas
- Retransmisión de datos al proceso de renderizado

**Canales**: `REQUEST`

**Ejemplos de uso**:
- Consultar API externa de datos
- Enviar información a servicios web
- Integración con sistemas externos

### `index.ts`

**Propósito**: Punto de entrada centralizado para la configuración de todos los manejadores IPC.

**Funcionalidades principales**:
- Registrar todos los manejadores
- Inicializar servicios y configuraciones
- Centralizar la gestión de IPC

**Ejemplos de uso**:
- Inicialización de la aplicación
- Configuración global de manejadores

## Patrones Comunes

### Validación de Datos

Todos los manejadores utilizan esquemas Zod para validar datos de entrada:

```typescript
const dataSchema = z.object({
  field1: z.string(),
  field2: z.number().min(1)
});

// En el manejador
const validatedData = dataSchema.parse(inputData);
```

### Manejo de Errores

Los errores se gestionan de forma centralizada:

```typescript
try {
  // Operación
} catch (error) {
  if (error instanceof z.ZodError) {
    throw ErrorHandler.createError('ValidationError', 'Datos inválidos');
  }
  logger.error('Error en operación:', error);
  throw error;
}
```

### Seguridad y Permisos

Verificación de permisos antes de operaciones sensibles:

```typescript
// Verificar si el usuario tiene permisos
if (userRole !== 'Admin' && userId !== resource.ownerId) {
  throw ErrorHandler.createError('AuthorizationError', 'Sin permisos');
}
```

## Mejores Prácticas

1. **Usar canales constantes**: Siempre usar las constantes de canales definidas en `channels/`
2. **Validar toda entrada**: Validar todos los datos de entrada con Zod
3. **Registrar errores**: Usar logger para registrar errores y actividades importantes
4. **Separar responsabilidades**: Usar servicios para la lógica de negocio
5. **Seguir patrones establecidos**: Mantener consistencia entre manejadores
6. **Documentar comportamiento**: Agregar JSDoc y comentarios para claridad

## Extensión

Para agregar un nuevo manejador:

1. Crear archivo `feature.channels.ts` en `channels/`
2. Definir canales y tipos de solicitud/respuesta
3. Crear archivo `feature.ts` en `handlers/`
4. Implementar manejadores para cada canal
5. Registrar en `index.ts`

## Referencias

- [Documentación de Electron IPC](https://www.electronjs.org/docs/latest/api/ipc-main)
- [Patrón Mediador](https://refactoring.guru/design-patterns/mediator)
- [Documentación de Zod](https://zod.dev/) 