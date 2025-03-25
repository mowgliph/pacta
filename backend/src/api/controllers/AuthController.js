import jwt from 'jsonwebtoken';
import { User, License } from '../models/index.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';

// Controller para login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario usando Prisma
    const foundUser = await prisma.user.findUnique({
      where: { username },
      include: {
        license: true
      }
    });

    if (!foundUser) {
      return res.status(401).json({
        message: 'Usuario no encontrado',
        status: 401,
      });
    }

    // Verificar contraseña
    const validPassword = await foundUser.validatePassword(password);
    if (!validPassword) {
      return res.status(401).json({
        message: 'Contraseña incorrecta',
        status: 401,
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
    );

    // Enviar respuesta
    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
      },
      license: foundUser.license,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      status: 500,
    });
  }
};

// Controller para olvido de contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // No indicamos si el email existe o no por razones de seguridad
      return res.status(200).json({
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
      });
    }

    // Generar token aleatorio
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora de validez

    // Guardar token y su expiración en la base de datos
    await user.update({
      resetToken,
      resetTokenExpiry,
    });

    // Configurar el transporte de correo
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.example.com',
      port: process.env.MAIL_PORT || 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER || 'user@example.com',
        pass: process.env.MAIL_PASSWORD || 'password',
      },
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
      `,
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Controller para verificar token de restablecimiento
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    // Buscar usuario con el token y que no haya expirado
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
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
};

// Controller para restablecer contraseña
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Buscar usuario con el token y que no haya expirado
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Actualizar contraseña y limpiar tokens
    await user.update({
      password: password,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Controller para activar licencia
export const activateLicense = async (req, res) => {
  try {
    const { licenseCode } = req.body;
    const userId = req.user.id;

    // Validar código de promoción
    if (!['DEMOPACTA', 'TRYPACTA'].includes(licenseCode)) {
      return res.status(400).json({
        message: 'Código de promoción inválido',
        status: 400,
      });
    }

    // Buscar usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        status: 404,
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
        userId: userId,
        licenseType: licenseType,
        description: `Licencia ${licenseType} activada el ${new Date().toLocaleDateString()}`,
        active: true,
        expiryDate: expirationDate,
      },
    });

    // Si no se creó porque ya existía, actualizarla
    if (!created) {
      await license.update({
        userId: userId,
        licenseType: licenseType,
        description: `Licencia ${licenseType} renovada el ${new Date().toLocaleDateString()}`,
        active: true,
        expiryDate: expirationDate,
      });
    }

    res.status(200).json({
      message: `Licencia ${licenseType} activada correctamente`,
      license: license,
      status: 200,
    });
  } catch (error) {
    console.error('License activation error:', error);
    res.status(500).json({
      message: 'Error al activar la licencia',
      status: 500,
    });
  }
};
