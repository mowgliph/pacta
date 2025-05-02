import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandler, IpcHandlerMap, IpcResponse } from '../channels/types';

export class EventManager {
  private static instance: EventManager;
  private handlers: IpcHandlerMap = {};

  private constructor() {
    this.initializeHandlers();
  }

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  private initializeHandlers(): void {
    // Registrar todos los canales IPC
    Object.values(IPC_CHANNELS).forEach((category) => {
      if (typeof category === 'object') {
        Object.values(category).forEach((channel) => {
          if (typeof channel === 'string') {
            this.registerHandler(channel);
          } else if (typeof channel === 'object') {
            Object.values(channel).forEach((subChannel) => {
              if (typeof subChannel === 'string') {
                this.registerHandler(subChannel);
              }
            });
          }
        });
      }
    });
  }

  private registerHandler(channel: string): void {
    ipcMain.handle(channel, async (event, ...args) => {
      try {
        const handler = this.handlers[channel];
        if (!handler) {
          throw new Error(`No hay manejador registrado para el canal: ${channel}`);
        }

        const result = await handler(event, ...args);
        return {
          success: true,
          data: result
        } as IpcResponse;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        } as IpcResponse;
      }
    });
  }

  public registerHandlers(handlers: IpcHandlerMap): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  public unregisterHandler(channel: string): void {
    delete this.handlers[channel];
    ipcMain.removeHandler(channel);
  }

  public unregisterAllHandlers(): void {
    Object.keys(this.handlers).forEach((channel) => {
      this.unregisterHandler(channel);
    });
    this.handlers = {};
  }
} 