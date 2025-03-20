import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken, loginLimiter, validateLogin, isAdmin } from '../middleware/auth.js';
import { db } from '../database/index.js';

const router = express.Router();

// Login endpoint con rate limiting y validación
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const user = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
        status: 401
      });
    }

    const foundUser = user.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
        status: 401
      });
    }

    // Verificar si el usuario tiene licencia activa
    const license = await db.query(
      'SELECT * FROM licenses WHERE user_id = $1 AND expiration_date > NOW()',
      [foundUser.id]
    );

    if (license.rows.length === 0) {
      return res.status(403).json({
        message: 'Se requiere una licencia activa para acceder',
        status: 403
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
      license: license.rows[0],
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

    // Calcular fecha de expiración
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + (licenseCode === 'DEMOPACTA' ? 30 : 7));

    // Crear o actualizar licencia
    const result = await db.query(
      `INSERT INTO licenses (user_id, type, expiration_date, features)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         type = $2,
         expiration_date = $3,
         features = $4
       RETURNING *`,
      [
        userId,
        licenseCode,
        expirationDate,
        JSON.stringify({
          maxUsers: licenseCode === 'DEMOPACTA' ? 10 : 3,
          maxContracts: licenseCode === 'DEMOPACTA' ? 100 : 20,
          features: ['contracts', 'reports', 'analytics']
        })
      ]
    );

    res.json({
      message: 'Licencia activada exitosamente',
      license: result.rows[0]
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

    const license = await db.query(
      'SELECT * FROM licenses WHERE user_id = $1 AND expiration_date > NOW()',
      [userId]
    );

    if (license.rows.length === 0) {
      return res.status(404).json({
        message: 'No se encontró una licencia activa',
        status: 404
      });
    }

    res.json({
      license: license.rows[0]
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