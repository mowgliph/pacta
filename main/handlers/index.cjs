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

// Bandera para evitar múltiples inicializaciones
let handlersInitialized = false;

/**
 * Configura todos los manejadores IPC
 * @param mainWindow - Ventana principal de la aplicación
 * @param eventManager - Gestor de eventos de la aplicación
 */
function setupIpcHandlers(mainWindow, eventManager) {
  if (handlersInitialized) {
    console.log('[Handlers] Los manejadores IPC ya están configurados');
    return;
  }
  
  console.log('[Handlers] Configurando manejadores IPC');
  
  // Registrar manejadores
  registerAuthHandlers();
  registerContractHandlers();
  registerDocumentHandlers();
  registerUserHandlers();
  registerSystemHandlers();
  registerNotificationHandlers();
  registerRoleHandlers();
  registerSupplementHandlers();
  registerStatisticsHandlers();
  registerLicenseHandlers();
  
  // Inicializar los manejadores IPC una sola vez
  if (eventManager && typeof eventManager.initializeHandlers === 'function') {
    eventManager.initializeHandlers();
  } else {
    console.error('[Handlers] Error: eventManager no está disponible o no tiene el método initializeHandlers');
  }
  
  handlersInitialized = true;
  console.log('[Handlers] Manejadores IPC configurados correctamente');
}

module.exports = {
  setupIpcHandlers
};
