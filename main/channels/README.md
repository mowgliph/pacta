# Estructura de Canales IPC

## Introducción

Este directorio contiene la definición de todos los canales de comunicación IPC (Inter-Process Communication) utilizados en la aplicación PACTA. La estructura está diseñada para proporcionar un sistema centralizado y consistente que facilita la comunicación entre el proceso principal de Electron y el proceso de renderizado.

## Estructura de Archivos

La organización de los archivos sigue un patrón centralizado:

```
channels/
├── ipc-channels.cjs    # Definición centralizada de todos los canales IPC
└── index.cjs           # Punto de entrada que exporta canales
```

## Descripción de Componentes

### Archivo Centralizado de Canales (ipc-channels.cjs)

Define todos los canales IPC organizados por categorías:

```js
const IPC_CHANNELS = {
  AUTH: {
    LOGIN: "auth:login",
    LOGOUT: "auth:logout",
    VERIFY: "auth:verify",
  },
  DATA: {
    CONTRACTS: {
      LIST: "contracts:list",
      CREATE: "contracts:create",
      UPDATE: "contracts:update",
    },
    DOCUMENTS: {
      LIST: "documents:list",
      UPLOAD: "documents:upload",
      DELETE: "documents:delete",
    },
    // ... más categorías
  },
};

module.exports = { IPC_CHANNELS };
```

### Archivo Index

El archivo `index.cjs` funciona como punto de entrada, exportando los canales necesarios:

```js
const { IPC_CHANNELS } = require("./ipc-channels.cjs");
module.exports = { IPC_CHANNELS };
```

## Cómo Utilizar los Canales

### En el Proceso Principal (Electron Main)

```js
const { IPC_CHANNELS } = require("../channels");
const { EventManager } = require("../events/event-manager.cjs");

function registerAuthHandlers(eventManager) {
  const handlers = {
    [IPC_CHANNELS.AUTH.LOGIN]: async (event, credentials) => {
      // Lógica de autenticación
      return { success: true };
    },
  };

  eventManager.registerHandlers(handlers);
}

module.exports = { registerAuthHandlers };
```

### En el Proceso de Renderizado (React/Next.js)

```js
const { IPC_CHANNELS } = require("main/channels");
const { ipcRenderer } = require("electron");

const login = async (credentials) => {
  try {
    const response = await ipcRenderer.invoke(
      IPC_CHANNELS.AUTH.LOGIN,
      credentials
    );
    return response;
  } catch (error) {
    console.error("Error en login:", error);
  }
};
```

## Cómo Añadir Nuevos Canales

1. **Añadir a un dominio existente:**

   - Añadir el nuevo canal en la categoría correspondiente en `ipc-channels.cjs`

   ```js
   const IPC_CHANNELS = {
     AUTH: {
       // Canales existentes...
       REFRESH_TOKEN: "auth:refresh-token",
     },
     // ...
   };
   module.exports = { IPC_CHANNELS };
   ```

2. **Añadir una nueva categoría:**

   - Crear una nueva sección en `ipc-channels.cjs`
   - Definir los canales necesarios

   ```js
   const IPC_CHANNELS = {
     // Categorías existentes...
     NEW_CATEGORY: {
       OPERATION1: "new-category:operation1",
       OPERATION2: "new-category:operation2",
     },
   };
   module.exports = { IPC_CHANNELS };
   ```

## Ventajas de Esta Estructura

1. **Centralización**: Todos los canales definidos en un solo lugar
2. **Consistencia**: Nombres de canales estandarizados
3. **Mantenibilidad**: Fácil de encontrar y modificar canales
4. **Extensibilidad**: Simple de añadir nuevos canales o categorías
5. **Autocompletado**: IDE puede sugerir canales disponibles
6. **Organización**: Canales agrupados por categorías lógicas

## Consideraciones Técnicas

- La estructura utiliza objetos literales para asegurar consistencia
- La centralización reduce la posibilidad de duplicación de canales
- Se recomienda mantener la nomenclatura y agrupación lógica

---

> **Nota:** En PACTA, los canales IPC deben ser únicos, descriptivos y estar documentados en este archivo para facilitar el mantenimiento y la colaboración.
