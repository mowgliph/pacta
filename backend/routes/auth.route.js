const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');
const { loginSchema } = require('../utils/schemas.zod');

const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
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

    res.json({ message: 'Login exitoso', token });

  } catch (error) {
    if (error instanceof require('zod').ZodError) {
      return res.status(400).json({ message: 'Datos de entrada inválidos', errors: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Add other auth routes...

module.exports = router;