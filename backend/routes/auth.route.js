const router = require('express').Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');
const { loginSchema } = require('../utils/schemas.zod');

const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        password: true
      }
    });

    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    await prisma.accessLog.create({
      data: {
        userId: user.id,
        action: 'Login',
        details: 'User logged in',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    if (error instanceof require('zod').ZodError) {
      return res.status(400).json({ message: 'Datos de entrada inválidos', errors: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;