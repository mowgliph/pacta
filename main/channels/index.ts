/**
 * Archivo índice que exporta los canales IPC y sus tipos
 * Facilita la importación centralizada de todos los canales y tipos
 */

// Exportamos los canales IPC centralizados
export { IPC_CHANNELS } from './ipc-channels';

// Exportamos los tipos de utilidad
export type { IpcChannel } from './ipc-channels';
export type { IpcHandlerMap, IpcHandler } from './types'; 