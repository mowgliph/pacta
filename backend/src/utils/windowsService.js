/**
 * Configuración del servicio de Windows para PACTA
 * Este módulo maneja la instalación, desinstalación y gestión del servicio de Windows
 */

import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del servicio
const SERVICE_NAME = process.env.SERVICE_NAME || 'PACTA-Backend';
const SERVICE_DESCRIPTION =
  process.env.SERVICE_DESCRIPTION || 'Servicio de backend para la plataforma PACTA';
const SCRIPT_PATH = path.join(__dirname, '../../src/server.js');

/**
 * Crea una instancia del servicio de Windows
 * @returns {Service} Instancia del servicio
 */
function createServiceInstance() {
  const svc = new Service({
    name: SERVICE_NAME,
    description: SERVICE_DESCRIPTION,
    script: SCRIPT_PATH,
    nodeOptions: ['--harmony', '--max_old_space_size=4096'],
    // Configuraciones adicionales
    workingDirectory: path.join(__dirname, '../..'),
    allowServiceLogon: true,
    env: [
      {
        name: 'NODE_ENV',
        value: process.env.NODE_ENV || 'production',
      },
      {
        name: 'PORT',
        value: process.env.PORT || '3000',
      },
      {
        name: 'HOST',
        value: process.env.HOST || 'localhost',
      },
    ],
  });

  return svc;
}

/**
 * Instala el servicio de Windows
 */
function installService() {
  const svc = createServiceInstance();

  svc.on('install', () => {
    logger.info(`Servicio ${SERVICE_NAME} instalado correctamente`);
    logger.info('Iniciando servicio...');
    svc.start();
  });

  svc.on('start', () => {
    logger.info(`Servicio ${SERVICE_NAME} iniciado correctamente`);
  });

  svc.on('error', error => {
    logger.error(`Error en el servicio ${SERVICE_NAME}:`, { error: error.message });
  });

  logger.info(`Instalando servicio ${SERVICE_NAME}...`);
  svc.install();
}

/**
 * Desinstala el servicio de Windows
 */
function uninstallService() {
  const svc = createServiceInstance();

  svc.on('uninstall', () => {
    logger.info(`Servicio ${SERVICE_NAME} desinstalado correctamente`);
  });

  svc.on('error', error => {
    logger.error(`Error al desinstalar el servicio ${SERVICE_NAME}:`, { error: error.message });
  });

  logger.info(`Desinstalando servicio ${SERVICE_NAME}...`);
  svc.uninstall();
}

/**
 * Inicia el servicio de Windows
 */
function startService() {
  const svc = createServiceInstance();

  svc.on('start', () => {
    logger.info(`Servicio ${SERVICE_NAME} iniciado correctamente`);
  });

  svc.on('error', error => {
    logger.error(`Error al iniciar el servicio ${SERVICE_NAME}:`, { error: error.message });
  });

  logger.info(`Iniciando servicio ${SERVICE_NAME}...`);
  svc.start();
}

/**
 * Detiene el servicio de Windows
 */
function stopService() {
  const svc = createServiceInstance();

  svc.on('stop', () => {
    logger.info(`Servicio ${SERVICE_NAME} detenido correctamente`);
  });

  svc.on('error', error => {
    logger.error(`Error al detener el servicio ${SERVICE_NAME}:`, { error: error.message });
  });

  logger.info(`Deteniendo servicio ${SERVICE_NAME}...`);
  svc.stop();
}

/**
 * Reinicia el servicio de Windows
 */
function restartService() {
  const svc = createServiceInstance();

  svc.on('stop', () => {
    logger.info(`Servicio ${SERVICE_NAME} detenido, reiniciando...`);
    svc.start();
  });

  svc.on('start', () => {
    logger.info(`Servicio ${SERVICE_NAME} reiniciado correctamente`);
  });

  svc.on('error', error => {
    logger.error(`Error al reiniciar el servicio ${SERVICE_NAME}:`, { error: error.message });
  });

  logger.info(`Reiniciando servicio ${SERVICE_NAME}...`);
  svc.stop();
}

/**
 * Verifica el estado del servicio
 */
function checkServiceStatus() {
  const svc = createServiceInstance();

  svc.on('error', error => {
    logger.error(`Error al verificar el estado del servicio ${SERVICE_NAME}:`, {
      error: error.message,
    });
  });

  logger.info(`Verificando estado del servicio ${SERVICE_NAME}...`);
  return new Promise(resolve => {
    svc.on('status', status => {
      logger.info(`Estado del servicio ${SERVICE_NAME}: ${status}`);
      resolve(status);
    });
    svc.getStatus();
  });
}

export {
  installService,
  uninstallService,
  startService,
  stopService,
  restartService,
  checkServiceStatus,
};
