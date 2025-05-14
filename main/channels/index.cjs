/**
 * Archivo índice que exporta los canales IPC
 * Facilita la importación centralizada de todos los canales
 */

// Exportamos los canales IPC centralizados
module.exports = {
  IPC_CHANNELS: require("./ipc-channels.cjs").IPC_CHANNELS,
};
