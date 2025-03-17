import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import sequelize from './config/database.js';
import models from './models/index.js';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes); // Add protected routes

// Database connection test
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // After database connection
    await sequelize.sync({ alter: true });
    
    // Create admin user if not exists
    await models.User.createAdminIfNotExists();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PACTA API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});