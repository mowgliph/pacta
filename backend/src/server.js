/**
 * Punto de entrada principal para el servidor de PACTA
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from 'dotenv';
import { handleError } from './utils/errors.js';
import { apiLimiter } from './api/middleware/rateLimit.js';
import routes from './api/routes/index.js';
import { logger } from './utils/logger.js';
import { testConnection } from './database/prisma.js';

// Load environment variables
config();

// Crear directorio de logs si no existe
import fs from 'fs';
import path from 'path';
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }),
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  }),
);

// Performance middleware
app.use(compression());
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  }),
);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: { write: message => logger.http(message.trim()) } }));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.http(message.trim()) } }));
}

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await testConnection();

    res.status(200).json({
      status: 'success',
      message: 'Server is healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server is running but database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }
});

// 404 handler
app.use((req, res, _next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(handleError);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Inicializar la base de datos y servicios antes de iniciar el servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    logger.info('Conexión a la base de datos establecida correctamente');

    // Iniciar el servidor
    const server = app.listen(PORT, HOST, () => {
      logger.info(`Servidor PACTA iniciado en http://${HOST}:${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('Señal SIGTERM recibida. Cerrando servidor...');
      server.close(async () => {
        logger.info('Servidor cerrado');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error('Error al iniciar el servidor:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Iniciar el servidor
const serverInstance = startServer();

export default app;
