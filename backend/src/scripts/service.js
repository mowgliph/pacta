#!/usr/bin/env node

/**
 * Script para gestionar el servicio de Windows de PACTA
 * Uso: node service.js [install|uninstall|start|stop|restart|status]
 */

import { 
    installService, 
    uninstallService, 
    startService, 
    stopService, 
    restartService,
    checkServiceStatus
  } from '../utils/windowsService.js';
  import { logger } from '../utils/logger.js';
  
  // Comando proporcionado
  const command = process.argv[2];
  
  // Validar el comando
  const validCommands = ['install', 'uninstall', 'start', 'stop', 'restart', 'status'];
  if (!command || !validCommands.includes(command)) {
    console.log(`
    PACTA Windows Service Manager
  
    Uso: node service.js [comando]
  
    Comandos disponibles:
      install   - Instala el servicio de Windows
      uninstall - Desinstala el servicio de Windows
      start     - Inicia el servicio
      stop      - Detiene el servicio
      restart   - Reinicia el servicio
      status    - Verifica el estado del servicio
  
    Ejemplo: node service.js install
    `);
    process.exit(1);
  }
  
  // Ejecutar el comando correspondiente
  async function executeCommand() {
    try {
      switch (command) {
        case 'install':
          installService();
          break;
        case 'uninstall':
          uninstallService();
          break;
        case 'start':
          startService();
          break;
        case 'stop':
          stopService();
          break;
        case 'restart':
          restartService();
          break;
        case 'status':
          await checkServiceStatus();
          break;
        default:
          console.log('Comando no reconocido');
          process.exit(1);
      }
    } catch (error) {
      logger.error('Error al ejecutar el comando:', { command, error: error.message });
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
  
  executeCommand();