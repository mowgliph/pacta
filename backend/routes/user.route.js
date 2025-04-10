const router = require('express').Router();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT, authorizeRole } = require('../middleware/auth.middleware');
const { userSchema } = require('../utils/validation');

const prisma = new PrismaClient();

// Get all users (RA only)
router.get('/', authenticateJWT, authorizeRole('RA'), async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Create new user (RA only)
router.post('/', authenticateJWT, authorizeRole('RA'), async (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password, role, notifications } = value;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        notifications,
      },
    });

    await prisma.accessLog.create({
      data: {
        userId: req.user.id,
        action: 'Create User',
        details: `User ${username} created`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

module.exports = router;