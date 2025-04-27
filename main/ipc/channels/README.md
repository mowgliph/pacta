# Estructura de Canales IPC

## Introducción

Este directorio contiene la definición de todos los canales de comunicación IPC (Inter-Process Communication) utilizados en la aplicación PACTA. La estructura está diseñada para proporcionar un sistema de tipos fuerte y modular que facilita la comunicación entre el proceso principal de Electron y el proceso de renderizado.

## Estructura de Archivos

La organización de los archivos sigue un patrón modular por dominio:

```
channels/
├── app.channels.ts         # Canales relacionados con la aplicación
├── auth.channels.ts        # Canales de autenticación
├── backup.channels.ts      # Canales de copias de seguridad
├── channels.ts             # Consolida todos los canales en un tipo unión
├── contracts.channels.ts   # Canales de contratos
├── documents.channels.ts   # Canales de documentos
├── index.ts                # Punto de entrada que exporta todos los canales
├── notifications.channels.ts # Canales de notificaciones
├── requests.ts             # Consolida las interfaces de solicitudes
├── settings.channels.ts    # Canales de configuración
├── supplements.channels.ts # Canales de suplementos
├── types.ts                # Tipos genéricos para IPC
└── users.channels.ts       # Canales de usuarios y roles
```

## Descripción de Componentes

### Archivos de Canales por Dominio

Cada archivo `*.channels.ts` define:

1. Un `enum` con los canales específicos del dominio
2. Una interfaz `*Requests` que especifica:
   - Tipos de datos esperados para cada solicitud
   - Tipos de datos retornados para cada respuesta

Por ejemplo, para los canales de autenticación:

```typescript
// auth.channels.ts
export enum AuthChannels {
  LOGIN = "auth:login",
  LOGOUT = "auth:logout",
  // ...
}

export interface AuthRequests {
  [AuthChannels.LOGIN]: {
    request: LoginCredentials;
    response: AuthResult;
  };
  // ...
}
```

### Archivos de Consolidación

- **channels.ts**: Consolida todos los enums de canales en un tipo unión `AllChannels`
- **requests.ts**: Consolida todas las interfaces de solicitudes en un tipo intersección `AllRequests`
- **types.ts**: Define interfaces genéricas como `IpcRequest` y `IpcResponse`

### Archivo Index

El archivo `index.ts` funciona como punto de entrada, reuniendo y exportando todos los canales y tipos para facilitar su importación desde cualquier parte de la aplicación.

## Cómo Utilizar los Canales

### En el Proceso Principal (Electron Main)

```typescript
import { AppChannels } from 'main/ipc/channels';
import { withErrorHandling } from '../setup';

withErrorHandling(AppChannels.VERSION, async () => {
  return { version: app.getVersion() };
});
```

### En el Proceso de Renderizado (React/Next.js)

```typescript
import { AppChannels } from 'main/ipc/channels';
import { ipcRenderer } from 'electron';

const getVersion = async () => {
  try {
    const response = await ipcRenderer.invoke(AppChannels.VERSION);
    return response.version;
  } catch (error) {
    console.error("Error al obtener versión:", error);
  }
};
```

## Cómo Añadir Nuevos Canales

1. **Si pertenece a un dominio existente:**
   - Añadir la constante al enum correspondiente
   - Definir la interfaz de solicitud/respuesta

   ```typescript
   // En auth.channels.ts
   export enum AuthChannels {
     // Canales existentes...
     CHANGE_EMAIL = "auth:changeEmail"
   }

   export interface AuthRequests {
     // Interfaces existentes...
     [AuthChannels.CHANGE_EMAIL]: {
       request: { id: string; newEmail: string };
       response: { success: boolean; message?: string };
     };
   }
   ```

2. **Si es un nuevo dominio:**
   - Crear un nuevo archivo `nombre-dominio.channels.ts`
   - Definir el enum de canales y la interfaz de solicitudes
   - Actualizar `channels.ts` para incluir el nuevo enum
   - Actualizar `requests.ts` para incluir la nueva interfaz
   - Actualizar `index.ts` para exportar los nuevos tipos

## Ventajas de Esta Estructura

1. **Tipado fuerte**: Validación en tiempo de compilación de solicitudes y respuestas
2. **Organización modular**: Separa preocupaciones por dominio
3. **Mantenibilidad**: Facilita encontrar y modificar canales existentes
4. **Extensibilidad**: Estructura preparada para crecer con nuevos dominios
5. **Autocompletado**: IDE puede sugerir canales disponibles y sus tipos

## Consideraciones Técnicas

- La estructura evita referencias circulares que pueden causar problemas con `isolatedModules` en TypeScript
- Los tipos genéricos como `IpcRequest` e `IpcResponse` proporcionan una API consistente
- El uso de `export type` asegura compatibilidad con `isolatedModules` 