const { ipcMain } = require("electron");
const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { ErrorHandler, AppError } = require("../utils/error-handler.cjs");

function EventManager() {
  if (!(this instanceof EventManager)) return new EventManager();
  
  if (EventManager._instance) {
    console.warn('[EventManager] Ya existe una instancia de EventManager');
    return EventManager._instance;
  }
  
  this.handlers = {};
  this.initialized = false;
  
  // Marcar como instancia
  EventManager._instance = this;
  
  // No inicializar manejadores en el constructor
  // Se inicializarán cuando se llame a initializeHandlers explícitamente
}

EventManager._instance = null;

EventManager.getInstance = function () {
  if (!EventManager._instance) {
    console.log('[EventManager] Creando nueva instancia de EventManager');
    EventManager._instance = new EventManager();
  }
  return EventManager._instance;
};

// Limpiar manejadores IPC al recargar
if (module.hot) {
  module.hot.dispose(() => {
    if (EventManager._instance) {
      EventManager._instance.unregisterAllHandlers();
      EventManager._instance = null;
    }
  });
}

EventManager.prototype.initializeHandlers = function () {
  if (this.initialized) {
    console.log('[EventManager] Los manejadores ya están inicializados');
    return;
  }
  
  console.log('[EventManager] Inicializando manejadores IPC');
  
  // Registrar todos los canales IPC
  Object.keys(IPC_CHANNELS).forEach((category) => {
    const channels = IPC_CHANNELS[category];
    if (typeof channels === 'object') {
      Object.keys(channels).forEach((channelKey) => {
        const channel = channels[channelKey];
        if (typeof channel === 'string') {
          console.log(`[EventManager] Registrando canal: ${channel}`);
          this.registerHandler(channel);
        } else if (typeof channel === "object") {
          Object.values(channel).forEach((subChannel) => {
            if (typeof subChannel === "string") {
              console.log(`[EventManager] Registrando subcanal: ${subChannel}`);
              this.registerHandler(subChannel);
            }
          });
        }
      });
    }
  });
  
  this.initialized = true;
  console.log('[EventManager] Manejadores IPC inicializados');
};

EventManager.prototype.registerHandler = function (channel) {
  // Verificar si el manejador ya está registrado
  if (ipcMain.listenerCount(channel) > 0) {
    console.warn(`[EventManager] El manejador para el canal '${channel}' ya está registrado`);
    return;
  }
  
  console.log(`[EventManager] Registrando manejador para canal: ${channel}`);
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      const handler = this.handlers[channel];
      if (!handler) {
        throw AppError.notFound(
          `No hay manejador registrado para el canal: ${channel}`,
          "HANDLER_NOT_FOUND"
        );
      }
      const result = await handler(event, ...args);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  });
};

EventManager.prototype.registerHandlers = function (handlers) {
  this.handlers = { ...this.handlers, ...handlers };
};

EventManager.prototype.unregisterHandler = function (channel) {
  delete this.handlers[channel];
  ipcMain.removeHandler(channel);
};

EventManager.prototype.unregisterAllHandlers = function () {
  Object.keys(this.handlers).forEach((channel) => {
    this.unregisterHandler(channel);
  });
  this.handlers = {};
};

module.exports = { EventManager };
