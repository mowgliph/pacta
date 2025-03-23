import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { db, testConnection, syncDatabase } from './database/dbconnection.js';
import models from './models/index.js';
import apiRoutes from './routes/index.js';
import scheduler from './services/scheduler.js';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import NotificationService from './services/NotificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 solicitudes por ventana
});
app.use('/api/', limiter);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Serve static files from frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist'), {
  maxAge: '1y',
  etag: false
}));

// Mount all API routes
app.use('/api', apiRoutes);

// Verificar permisos del directorio de la base de datos
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Directorio de base de datos creado:', dbDir);
}

// Crear directorio para archivos de licencia
const uploadsDir = path.join(__dirname, 'uploads/licenses');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Directorio para licencias creado:', uploadsDir);
}

// Database connection test
async function initializeDatabase() {
  try {
    console.log('Intentando conectar a la base de datos...');
    const connected = await testConnection();
    
    if (connected) {
      console.log('Iniciando sincronización de la base de datos...');
      const synced = await syncDatabase(true); // true para forzar la recreación de tablas
      
      if (synced) {
        console.log('Intentando crear usuario admin...');
        const adminUser = await models.User.findOne({ where: { role: 'admin' } });
        if (!adminUser) {
          await models.User.create({
            username: 'admin',
            email: 'admin@pacta.local',
            password: 'Pacta2024',
            role: 'admin',
            active: true
          });
          console.log('Admin user created successfully');
        }
        
        // Iniciar servicios adicionales
        if (scheduler && typeof scheduler.start === 'function') {
          scheduler.start();
          console.log('Contract expiration checker started');
        }

        // Iniciar limpieza periódica de notificaciones expiradas
        setInterval(() => {
          NotificationService.cleanupExpiredNotifications()
            .catch(error => console.error('Error cleaning up notifications:', error));
        }, 24 * 60 * 60 * 1000); // Cada 24 horas
      }
    }
  } catch (error) {
    console.error('Error durante la inicialización de la base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PACTA API' });
});

// Serve the frontend SPA for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});