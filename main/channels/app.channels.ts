/**
 * Canales IPC relacionados con la aplicación
 */

/**
 * Enumera los canales IPC para funciones de la aplicación
 */
export enum AppChannels {
  RELAUNCH = "app:relaunch",
  EXIT = "app:exit",
  VERSION = "app:getVersion",
  PATH = "app:getPath",
  MINIMIZE = "app:minimize",
  MAXIMIZE = "app:maximize",
  QUIT = "app:quit",
}

/**
 * Interfaz para solicitudes relacionadas con la aplicación
 */
export interface AppRequests {
  [AppChannels.PATH]: {
    request: { name: string };
    response: { path: string };
  };
  [AppChannels.VERSION]: {
    request: void;
    response: { version: string };
  };
  [AppChannels.MINIMIZE]: {
    request: void;
    response: { success: boolean };
  };
  [AppChannels.MAXIMIZE]: {
    request: void;
    response: { success: boolean; isMaximized: boolean };
  };
  [AppChannels.RELAUNCH]: {
    request: void;
    response: { success: boolean };
  };
  [AppChannels.EXIT]: {
    request: void;
    response: { success: boolean };
  };
  [AppChannels.QUIT]: {
    request: void;
    response: { success: boolean };
  };
} 