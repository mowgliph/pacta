import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import sequelize from './config/database.js';
import models from './models/index.js';
import apiRoutes from './routes/index.js';
import scheduler from './services/scheduler.js';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';

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
app.use(limiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

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
async function testConnection() {
  try {
    console.log('Intentando conectar a la base de datos en:', path.resolve(dbDir));
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    try {
      console.log('Iniciando sincronización de la base de datos...');
      
      // Forzar la recreación de las tablas con logging detallado
      console.log('Opciones de sincronización: { force: true }');
      await sequelize.sync({ 
        force: true, // Recrear las tablas
        logging: console.log // Mostrar queries SQL para debug
      });
      console.log('Database tables recreated successfully');
      
      console.log('Intentando crear usuario admin...');
      await models.User.createAdminIfNotExists();
      console.log('Admin user checked/created successfully');
      
      // Iniciar servicios adicionales
      if (scheduler && typeof scheduler.start === 'function') {
        scheduler.start();
        console.log('Contract expiration checker started');
      }
      
    } catch (syncError) {
      console.error('Error during database synchronization:', syncError);
      console.error('Details:', syncError.message);
      if (syncError.parent) {
        console.error('Cause:', syncError.parent.message);
      }
      console.error('Stack:', syncError.stack);
    }
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Error details:', error.message);
    if (error.parent) {
      console.error('Cause:', error.parent.message);
    }
    console.error('Please check that the database directory exists and has write permissions');
    
    // Verificar permisos de escritura
    try {
      const testFile = path.join(dbDir, 'test-write.tmp');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('Database directory has write permissions');
    } catch (fsError) {
      console.error('Cannot write to database directory. Permission issue:', fsError.message);
    }
  }
}

testConnection();

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