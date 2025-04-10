const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');
const schemas = require('../utils/validation');

const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
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

  res.json({ message: 'Login successful', user, token });
});

// Add other auth routes...

module.exports = router;