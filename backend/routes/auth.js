import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken, loginLimiter, validateLogin, isAdmin } from '../middleware/auth.js';
import { db } from '../config/database.js';
import { User, License } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// Login endpoint con rate limiting y validación
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario usando Sequelize
    const foundUser = await User.findOne({ 
      where: { username },
      include: [
        { 
          model: License, 
          as: 'license',
          required: false
        }
      ]
    });

    if (!foundUser) {
      return res.status(401).json({
        message: 'Usuario no encontrado',
        status: 401
      });
    }

    // Verificar contraseña usando el método del modelo
    const validPassword = await foundUser.validatePassword(password);
    if (!validPassword) {
      return res.status(401).json({
        message: 'Contraseña incorrecta',
        status: 401
      });
    }

    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Enviar respuesta
    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role
      },
      license: foundUser.license,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      status: 500
    });
  }
});

// Endpoint para activar licencia
router.post('/activate-license', authenticateToken, async (req, res) => {
  try {
    const { licenseCode } = req.body;
    const userId = req.user.id;

    // Validar código de promoción
    if (!['DEMOPACTA', 'TRYPACTA'].includes(licenseCode)) {
      return res.status(400).json({
        message: 'Código de promoción inválido',
        status: 400
      });
    }

    // Buscar usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        status: 404
      });
    }

    // Calcular fecha de expiración
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + (licenseCode === 'DEMOPACTA' ? 30 : 7));

    // Crear o actualizar licencia
    const licenseType = licenseCode === 'DEMOPACTA' ? 'DEMO' : 'TRIAL';
    
    const [license, created] = await License.findOrCreate({
      where: { licenseKey: licenseCode },
      defaults: {
        licenseKey: licenseCode,
        type: licenseType,
        startDate: new Date(),
        expiryDate: expirationDate,
        active: true,
        maxUsers: licenseCode === 'DEMOPACTA' ? 10 : 3,
        features: {
          maxContracts: licenseCode === 'DEMOPACTA' ? 100 : 20,
          supportedFeatures: ['contracts', 'reports', 'analytics']
        }
      }
    });

    if (!created) {
      // Actualizar licencia existente
      license.type = licenseType;
      license.expiryDate = expirationDate;
      license.active = true;
      license.maxUsers = licenseCode === 'DEMOPACTA' ? 10 : 3;
      license.features = {
        maxContracts: licenseCode === 'DEMOPACTA' ? 100 : 20,
        supportedFeatures: ['contracts', 'reports', 'analytics']
      };
      await license.save();
    }

    // Asignar licencia al usuario
    user.licenseId = license.id;
    await user.save();

    res.json({
      message: 'Licencia activada exitosamente',
      license: license
    });
  } catch (error) {
    console.error('License activation error:', error);
    res.status(500).json({
      message: 'Error al activar la licencia',
      status: 500
    });
  }
});

// Endpoint para verificar estado de la licencia
router.get('/license-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [
        { 
          model: License, 
          as: 'license',
          required: false
        }
      ]
    });

    if (!user || !user.license || !user.license.isValid()) {
      return res.status(404).json({
        message: 'No se encontró una licencia activa',
        status: 404
      });
    }

    res.json({
      license: user.license
    });
  } catch (error) {
    console.error('License status check error:', error);
    res.status(500).json({
      message: 'Error al verificar el estado de la licencia',
      status: 500
    });
  }
});

// Endpoint para cerrar sesión
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // En una implementación más robusta, aquí podrías invalidar el token
    res.json({
      message: 'Sesión cerrada exitosamente',
      status: 200
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Error al cerrar sesión',
      status: 500
    });
  }
});

export default router;