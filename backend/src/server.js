/**
 * Punto de entrada principal para el servidor de PACTA
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import config from './config/app.config.js';
import { testConnection } from './database/prisma.js';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler.js';

// Importar rutas
import apiRoutes from './api/routes/index.js';

// Inicializar aplicación
const app = express();

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Rate limiting
app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    statusCode: 429
  }
}));

// Rutas de la API
app.use(config.apiPrefix, apiRoutes);

// Ruta de verificación de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
    environment: config.nodeEnv
  });
});

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Manejo centralizado de errores
app.use(errorHandler);

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos con Prisma
    await testConnection();
    console.log('Database connection established successfully');
    
    // Iniciar servidor
    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`API available at http://${config.host}:${config.port}${config.apiPrefix}`);
    });
    
    // Manejo de cierre adecuado
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
    
    return server;
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Iniciar el servidor si este archivo es ejecutado directamente
if (process.argv[1] === import.meta.url) {
  startServer();
}

export default app;