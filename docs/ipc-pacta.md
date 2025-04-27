# Comunicación IPC en Electron: Mejores Prácticas y Patrones de Seguridad

## Introducción

En aplicaciones Electron, la comunicación entre procesos (IPC - Inter-Process Communication) es fundamental para permitir que los procesos de renderizado (renderer) y principal (main) intercambien información. Este documento explica los fundamentos de IPC en Electron, detalla los patrones correctos de implementación, y destaca errores comunes que deben evitarse.

## Conceptos básicos de IPC en Electron

Electron utiliza dos tipos de procesos separados:

- **Proceso Principal (Main)**: Controla el ciclo de vida de la aplicación, accede a APIs nativas y sistemas del sistema operativo.
- **Proceso de Renderizado (Renderer)**: Maneja la interfaz de usuario y la interacción del usuario.

La comunicación entre estos procesos ocurre a través del sistema IPC mediante los módulos `ipcMain` y `ipcRenderer`.

## Patrones de comunicación IPC

Existen varios patrones de comunicación IPC en Electron:

1. **Renderer a Main (unidireccional)**:
   - Renderer envía mensajes al proceso Main usando `ipcRenderer.send()`
   - Main recibe mensajes usando `ipcMain.on()`

2. **Renderer a Main (bidireccional)**:
   - Renderer envía mensajes y espera respuesta usando `ipcRenderer.invoke()`
   - Main procesa y responde usando `ipcMain.handle()`

3. **Main a Renderer**:
   - Main envía mensajes a un renderer específico usando `webContents.send()`
   - Renderer recibe mensajes usando `ipcRenderer.on()`

## ⚠️ Error común: Importación directa entre procesos

Uno de los errores más comunes y peligrosos es importar módulos o archivos directamente entre los procesos main y renderer:

```typescript
// ❌ MAL: Importación directa desde main en el proceso renderer
import { DocumentsChannels } from "../../main/ipc/channels/documents.channels"
```

### ¿Por qué es problemático?

1. **Rompe el modelo de seguridad**: El renderer debe tener acceso limitado y controlado al código del main.
2. **Exposición de APIs privilegiadas**: Puede exponer inadvertidamente APIs con acceso a sistema de archivos u otras funcionalidades sensibles.
3. **Dependencias incorrectas**: Crea dependencias directas entre procesos que deberían estar separados.
4. **Problemas en producción**: Puede causar errores cuando se compila la aplicación para producción.

## ✅ Implementación correcta

### 1. Definir canales en ambos lados

En lugar de importar directamente, debemos definir los canales de comunicación en cada proceso:

```typescript
// En el renderer (useDocuments.ts)
export enum DocumentsChannels {
  OPEN = "documents:open",
  SAVE = "documents:save",
  GET_ALL = "documents:getAll",
  GET_BY_ID = "documents:getById",
  UPDATE = "documents:update",
  DELETE = "documents:delete",
  DOWNLOAD = "documents:download",
}
```

### 2. Utilizar el preload como puente seguro

El archivo preload actúa como un puente seguro entre main y renderer:

```typescript
// En preload.ts
const validInvokeChannels = [
  "documents:save",
  "documents:getAll",
  // ...otros canales
];

contextBridge.exposeInMainWorld("Electron", {
  ipcRenderer: {
    invoke: (channel, ...args) => {
      if (isValidChannel(channel, validInvokeChannels)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Canal IPC no permitido: ${channel}`));
    }
  }
});
```

### 3. Implementación correcta en el renderer

```typescript
// En useDocuments.ts
const uploadDocument = async (file, metadata) => {
  try {
    // @ts-ignore - Electron está expuesto por el preload script
    const result = await window.Electron.ipcRenderer.invoke(
      DocumentsChannels.SAVE, 
      { buffer: Buffer.from(arrayBuffer) }, 
      completeMetadata,
      userId
    );
    return result;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
```

## Mejores prácticas implementadas

1. **Validación de canales**: Solo permitir canales predefinidos y explícitamente aprobados.
2. **Interfaz clara y limitada**: Exponer solo lo necesario al renderer a través del preload.
3. **Aislamiento de contexto**: Mantener separados los contextos de main y renderer.
4. **Limpieza de listeners**: Eliminar listeners antiguos para evitar duplicados y fugas de memoria.
5. **Gestión de errores**: Implementar manejo adecuado de errores en ambos lados.

## Arquitectura de comunicación IPC

```
┌─────────────────────┐           ┌─────────────────────┐
│                     │           │                     │
│   Proceso Main      │           │  Proceso Renderer   │
│                     │           │                     │
│  ┌─────────────┐    │           │   ┌────────────┐    │
│  │             │    │  invoke   │   │            │    │
│  │  ipcMain    │◄───┼───────────┼───┤ ipcRenderer│    │
│  │             │    │           │   │            │    │
│  └─────┬───────┘    │           │   └────────────┘    │
│        │            │           │          ▲          │
│        ▼            │           │          │          │
│  ┌─────────────┐    │           │   ┌──────┴─────┐    │
│  │ Servicios   │    │  send     │   │            │    │
│  │ del sistema │    │           │   │ contextBridge    │
│  └─────────────┘    │◄──────────┼───┤            │    │
│                     │           │   └────────────┘    │
└─────────────────────┘           └─────────────────────┘
                     ▲                      ▲
                     │   Preload Script     │
                     └──────────────────────┘
```

## Resumen

La comunicación IPC en Electron es crítica para la seguridad y el rendimiento de la aplicación. Es fundamental:

1. **Nunca importar directamente** archivos entre procesos main y renderer.
2. **Utilizar siempre el preload** como puente de comunicación seguro.
3. **Validar todos los canales y datos** transmitidos entre procesos.
4. **Definir interfaces claras** para la comunicación.
5. **Mantener el principio de privilegio mínimo** para el renderer.

Siguiendo estas pautas, se garantiza una aplicación Electron más segura y robusta. 