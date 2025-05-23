const { registerAuthHandlers } = require("./auth.handlers.cjs");
const { registerContractHandlers } = require("./contract.handlers.cjs");
const { registerDocumentHandlers } = require("./document.handlers.cjs");
const { registerUserHandlers } = require("./user.handlers.cjs");
const { registerSystemHandlers } = require("./system.handlers.cjs");
const { registerNotificationHandlers } = require("./notification.handlers.cjs");
const { registerRoleHandlers } = require("./role.handlers.cjs");
const { registerSupplementHandlers } = require("./supplement.handlers.cjs");
const { registerStatisticsHandlers } = require("./statistics.handlers.cjs");
const { registerLicenseHandlers } = require("./license.handlers.cjs");

/**
 * Configura todos los manejadores IPC
 * @param mainWindow - Ventana principal de la aplicación
 * @param eventManager - Gestor de eventos de la aplicación
 */
function setupIpcHandlers(mainWindow, eventManager) {
  // Registrar todos los manejadores IPC
  registerAuthHandlers(eventManager);
  registerContractHandlers(eventManager);
  registerDocumentHandlers(eventManager);
  registerUserHandlers(eventManager);
  registerSystemHandlers(eventManager);
  registerNotificationHandlers(eventManager);
  registerRoleHandlers(eventManager);
  registerSupplementHandlers(eventManager);
  registerStatisticsHandlers(eventManager);
  registerLicenseHandlers();
}

module.exports = {
  setupIpcHandlers
};
