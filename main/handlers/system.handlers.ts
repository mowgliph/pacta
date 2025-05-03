import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import { backupService } from '../utils/backup-service';
import { shell } from 'electron';
import { config } from '../utils/config';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(require('electron').app.getPath('userData'), 'config.json');

function getConfigValue(key: string): any {
  return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), config);
}

function setConfigValue(key: string, value: any): void {
  const keys = key.split('.');
  let obj: any = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
}

function persistConfig(): void {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { encoding: 'utf-8' });
    logger.info('Configuración persistida en disco');
  } catch (error) {
    logger.error('Error al persistir configuración:', error);
  }
}

export function registerSystemHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.SYSTEM.OPEN_FILE]: async (event, filePath) => {
      logger.info('Apertura de archivo solicitada', { filePath });
      try {
        const result = await shell.openPath(filePath);
        if (result) {
          logger.error('Error al abrir archivo:', result);
          throw new Error(result);
        }
        logger.info('Archivo abierto correctamente:', filePath);
        return true;
      } catch (error) {
        logger.error('Error al abrir archivo:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.SYSTEM.SAVE_FILE]: async (event, filePath, content) => {
      logger.info('Guardado de archivo solicitado', { filePath });
      try {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
        logger.info('Archivo guardado correctamente:', filePath);
        return true;
      } catch (error) {
        logger.error('Error al guardar archivo:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.SYSTEM.BACKUP]: async (event) => {
      logger.info('Creación de backup solicitada');
      try {
        backupService.runBackup();
        const files = require('fs').readdirSync(require('path').resolve(__dirname, '../../data/backups'));
        const backups = files.filter((f: string) => f.startsWith('backup_') && f.endsWith('.sqlite'));
        const lastBackup = backups.sort().reverse()[0];
        return { path: lastBackup };
      } catch (error) {
        logger.error('Error al crear backup manual:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.SYSTEM.RESTORE]: async (event, backupId) => {
      logger.info('Restauración de backup solicitada', { backupId });
      try {
        backupService.restoreBackup(backupId);
        return true;
      } catch (error) {
        logger.error('Error al restaurar backup:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.SYSTEM.SETTINGS.GET]: async (event, key) => {
      logger.info('Obtención de configuración solicitada', { key });
      try {
        const value = getConfigValue(key);
        return { value };
      } catch (error) {
        logger.error('Error al obtener configuración:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.SYSTEM.SETTINGS.UPDATE]: async (event, key, value) => {
      logger.info('Actualización de configuración solicitada', { key, value });
      try {
        setConfigValue(key, value);
        persistConfig();
        return true;
      } catch (error) {
        logger.error('Error al actualizar configuración:', error);
        throw error;
      }
    }
  };

  eventManager.registerHandlers(handlers);
}