import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken, loginLimiter, validateLogin, isAdmin } from '../middleware/auth.js';
import { db } from '../config/database.js';
import { User, License } from '../models/index.js';
import { Op } from 'sequelize';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

// Endpoint para solicitar restablecimiento de contraseña
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    
    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // No indicamos si el email existe o no por razones de seguridad
      return res.status(200).json({ 
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.' 
      });
    }

    // Generar token aleatorio
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora de validez
    
    // Guardar token y su expiración en la base de datos
    await user.update({
      resetToken,
      resetTokenExpiry
    });

    // Configurar el transporte de correo
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.example.com',
      port: process.env.MAIL_PORT || 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER || 'user@example.com',
        pass: process.env.MAIL_PASSWORD || 'password'
      }
    });

    // URL para restablecer contraseña (frontend)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    // Configurar el email
    const mailOptions = {
      from: process.env.MAIL_FROM || '"PACTA System" <noreply@example.com>',
      to: user.email,
      subject: 'Restablecimiento de contraseña - PACTA',
      html: `
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
        <a href="${resetUrl}">Restablecer contraseña</a>
        <p>Este enlace es válido por 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `
    };
    
    // Enviar el email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Verificar token de restablecimiento de contraseña
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Buscar usuario con el token y que no haya expirado
    const user = await User.findOne({ 
      where: { 
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }
      } 
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }
    
    res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Establecer nueva contraseña
router.post('/reset-password', [
  body('token').notEmpty().withMessage('El token es requerido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    .withMessage('La contraseña debe contener al menos una letra y un número')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;
    
    // Buscar usuario con el token y que no haya expirado
    const user = await User.findOne({ 
      where: { 
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }
      } 
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }
    
    // Actualizar contraseña y limpiar tokens
    await user.update({
      password: password,
      resetToken: null,
      resetTokenExpiry: null
    });
    
    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
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