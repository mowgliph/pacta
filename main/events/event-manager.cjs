const { ipcMain } = require("electron");
const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { ErrorHandler, AppError } = require("../utils/error-handler.cjs");

function EventManager() {
  if (!(this instanceof EventManager)) return new EventManager();
  this.handlers = {};
  this.initializeHandlers();
}

EventManager._instance = null;

EventManager.getInstance = function () {
  if (!EventManager._instance) {
    EventManager._instance = new EventManager();
  }
  return EventManager._instance;
};

EventManager.prototype.initializeHandlers = function () {
  // Registrar todos los canales IPC
  Object.values(IPC_CHANNELS).forEach((category) => {
    if (typeof category === "object") {
      Object.values(category).forEach((channel) => {
        if (typeof channel === "string") {
          this.registerHandler(channel);
        } else if (typeof channel === "object") {
          Object.values(channel).forEach((subChannel) => {
            if (typeof subChannel === "string") {
              this.registerHandler(subChannel);
            }
          });
        }
      });
    }
  });
};

EventManager.prototype.registerHandler = function (channel) {
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
