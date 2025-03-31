import { BaseController } from './BaseController.js';
import { ValidationService } from '../../services/ValidationService.js';
import { logger } from '../../utils/logger.js';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

// Directorio de backups
const BACKUP_BASE_PATH = process.env.BACKUP_BASE_PATH || './data/backups';
const BACKUP_MANUAL_DIR = process.env.BACKUP_MANUAL_DIR || 'manual';
const LOG_FILE = process.env.LOG_FILE || './data/logs/app.log';
const LOG_MAX_FILES = parseInt(process.env.LOG_MAX_FILES || '5');

/**
 * Controlador para la gestión del sistema
 * Incluye operaciones como estadísticas, logs, caché y backups
 */
export class SystemController extends BaseController {
  constructor() {
    super(null); // No necesita un servicio específico
    this.validationService = new ValidationService();
  }

  /**
   * Obtiene estadísticas del sistema
   */
  getSystemStats = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const cpuUsage = os.loadavg()[0]; // Promedio de carga en 1 minuto
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memUsage = (totalMem - freeMem) / totalMem;
        
        // Obtenemos estadísticas de la base de datos
        const userCount = await prisma.user.count();
        const contractCount = await prisma.contract.count();
        const activityCount = await prisma.activity.count();
        
        // Estadísticas del sistema operativo
        const uptimeHours = os.uptime() / 3600;
        const platform = os.platform();
        const hostname = os.hostname();
        
        // Información del disco
        let diskInfo = {};
        
        try {
          // Esto funcionará en Linux/Unix
          if (platform === 'linux' || platform === 'darwin') {
            const { stdout } = await execAsync('df -h / | awk \'NR==2 {print $5}\'');
            diskInfo.usedPercentage = stdout.trim();
          } else if (platform === 'win32') {
            // En Windows, usamos wmic para obtener espacio en disco
            const { stdout } = await execAsync('wmic logicaldisk where DeviceID="C:" get FreeSpace,Size /value');
            const freeMatch = stdout.match(/FreeSpace=(\d+)/);
            const sizeMatch = stdout.match(/Size=(\d+)/);
            
            if (freeMatch && sizeMatch) {
              const freeSpace = parseInt(freeMatch[1]);
              const totalSpace = parseInt(sizeMatch[1]);
              diskInfo.usedPercentage = `${Math.round((1 - freeSpace/totalSpace) * 100)}%`;
              diskInfo.freeSpace = `${Math.round(freeSpace / 1024 / 1024 / 1024)} GB`;
              diskInfo.totalSpace = `${Math.round(totalSpace / 1024 / 1024 / 1024)} GB`;
            }
          }
        } catch (error) {
          logger.error('Error getting disk info:', error);
          diskInfo = { error: 'No se pudo obtener información del disco' };
        }
        
        return {
          system: {
            hostname,
            platform,
            uptime: `${Math.round(uptimeHours)} horas`,
            cpu: `${Math.round(cpuUsage * 100 / os.cpus().length)}%`,
            memory: {
              total: `${Math.round(totalMem / 1024 / 1024 / 1024)} GB`,
              free: `${Math.round(freeMem / 1024 / 1024 / 1024)} GB`,
              usage: `${Math.round(memUsage * 100)}%`
            },
            disk: diskInfo
          },
          database: {
            userCount,
            contractCount,
            activityCount
          },
          application: {
            version: process.env.npm_package_version || '0.3.0',
            environment: process.env.NODE_ENV || 'development',
            apiPrefix: process.env.API_PREFIX || '/api'
          }
        };
      },
      { action: 'getSystemStats' }
    );
  };

  /**
   * Obtiene los logs del sistema
   */
  getSystemLogs = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { lines = 100, level = 'info' } = req.query;
        const maxLines = Math.min(parseInt(lines), 1000); // Limitamos a 1000 líneas máximo
        
        try {
          // Comprobar si el archivo existe
          await fs.access(LOG_FILE);
          
          // Leer el archivo de logs
          const logContent = await fs.readFile(LOG_FILE, 'utf8');
          
          // Filtrar por nivel y limitar las líneas
          const logLines = logContent.split('\n')
            .filter(line => {
              if (!line.trim()) return false;
              try {
                const logObj = JSON.parse(line);
                return level === 'all' || logObj.level === level;
              } catch (e) {
                return false;
              }
            })
            .slice(-maxLines);
          
          // Convertir las líneas en objetos JSON
          const logs = logLines.map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return { message: line, level: 'unknown', timestamp: new Date() };
            }
          });
          
          return {
            count: logs.length,
            logs
          };
        } catch (error) {
          if (error.code === 'ENOENT') {
            return {
              count: 0,
              logs: [],
              message: 'Archivo de logs no encontrado'
            };
          }
          throw error;
        }
      },
      { query: req.query }
    );
  };

  /**
   * Limpia la caché del sistema
   */
  clearCache = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        // Implementación básica - en producción se usaría Redis u otro sistema
        global.cachedData = {};
        
        logger.info('Cache cleared by admin', {
          userId: req.user.id,
          action: 'clearCache'
        });
        
        return {
          message: 'Caché limpiada correctamente',
          timestamp: new Date()
        };
      },
      { userId: req.user.id }
    );
  };

  /**
   * Crea un backup manual del sistema
   */
  createBackup = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        // Asegurar que el directorio de backups existe
        const backupDir = path.join(BACKUP_BASE_PATH, BACKUP_MANUAL_DIR);
        await fs.mkdir(backupDir, { recursive: true });
        
        // Crear nombre de archivo con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-manual-${timestamp}.sqlite`;
        const backupPath = path.join(backupDir, filename);
        
        try {
          // Extraer la ruta de la base de datos desde DATABASE_URL
          const dbPath = process.env.DATABASE_URL.replace('file:', '');
          
          // Copiar la base de datos (esto es específico para SQLite)
          await fs.copyFile(dbPath, backupPath);
          
          logger.info('Manual backup created', {
            userId: req.user.id,
            filename,
            path: backupPath
          });
          
          return {
            message: 'Backup creado correctamente',
            filename,
            timestamp: new Date(),
            path: backupPath
          };
        } catch (error) {
          logger.error('Error creating backup:', error);
          throw new Error(`Error al crear backup: ${error.message}`);
        }
      },
      { userId: req.user.id }
    );
  };

  /**
   * Lista todos los backups disponibles
   */
  listBackups = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const backupDir = path.join(BACKUP_BASE_PATH, BACKUP_MANUAL_DIR);
        
        try {
          // Asegurar que el directorio existe
          await fs.mkdir(backupDir, { recursive: true });
          
          // Leer archivos en el directorio
          const files = await fs.readdir(backupDir);
          
          // Obtener información de cada archivo
          const backupFiles = await Promise.all(
            files.map(async (file) => {
              const filePath = path.join(backupDir, file);
              const stats = await fs.stat(filePath);
              
              return {
                filename: file,
                size: stats.size,
                created: stats.ctime,
                path: filePath
              };
            })
          );
          
          // Ordenar por fecha, más reciente primero
          backupFiles.sort((a, b) => b.created - a.created);
          
          return {
            count: backupFiles.length,
            backups: backupFiles
          };
        } catch (error) {
          logger.error('Error listing backups:', error);
          throw new Error(`Error al listar backups: ${error.message}`);
        }
      },
      { action: 'listBackups' }
    );
  };

  /**
   * Descarga un backup específico
   */
  downloadBackup = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { filename } = req.params;
        const backupDir = path.join(BACKUP_BASE_PATH, BACKUP_MANUAL_DIR);
        const filePath = path.join(backupDir, filename);
        
        // Verificar que el archivo existe y está dentro del directorio de backups
        if (!filePath.startsWith(backupDir) || !existsSync(filePath)) {
          res.status(404).json({
            success: false,
            message: 'Backup no encontrado'
          });
          return;
        }
        
        // Configurar cabeceras para la descarga
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        
        // Crear stream de lectura y enviarlo al cliente
        const fileStream = createReadStream(filePath);
        fileStream.pipe(res);
        
        // Esta función no debería retornar nada ya que estamos enviando un stream
        return null;
      },
      { filename: req.params.filename }
    );
  };
}

export default new SystemController(); 