import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import sequelize from './config/database.js';
import models from './models/index.js';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import contractRoutes from './routes/contracts.js';
import scheduler from './services/scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist'), {
  maxAge: '1y',
  etag: false
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes); // Add contract routes
app.use('/api', protectedRoutes); // Add protected routes

// Database connection test
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: true });
      console.log('Database tables recreated successfully');
    } else {
      await sequelize.sync();
    }
    
    await models.User.createAdminIfNotExists();
    
    // Start contract expiration checker
    console.log('Contract expiration checker started');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
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