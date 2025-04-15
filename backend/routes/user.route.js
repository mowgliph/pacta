const router = require('express').Router();
const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT, authorizeRole } = require('../middleware/auth.middleware');
const { createUserSchema, updateUserProfileSchema, smtpConfigSchema } = require('../utils/schemas.zod'); 

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
  try {
    // Validar con Zod
    const { username, email, password, role, notifications } = createUserSchema.parse(req.body);
    
    const hashedPassword = await argon2.hash(password);

    // Verificar si el usuario o email ya existen (Prisma lo haría con try-catch, pero es bueno verificar antes)
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existingUser) {
      return res.status(409).json({ message: 'El nombre de usuario o email ya existe.' });
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        notifications,
      },
      // Devolver solo campos no sensibles
      select: { id: true, username: true, email: true, role: true, notifications: true }
    });

    // await prisma.accessLog.create({...}); // Log omitido

    res.status(201).json(user);

  } catch (error) {
    if (error instanceof require('zod').ZodError) {
      return res.status(400).json({ message: 'Datos de entrada inválidos', errors: error.errors });
    }
    // Otros errores
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
});

// --- Rutas de Perfil del Usuario Actual ---

// GET /profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateJWT, async (req, res) => {
  const userId = req.user.id; // ID del usuario obtenido del token JWT
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Excluir la contraseña del resultado
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        notifications: true,
        // Incluir otros campos necesarios para el perfil
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: 'Error al obtener el perfil.', error: error.message });
  }
});

// PUT /profile - Actualizar perfil del usuario autenticado
router.put('/profile', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Validar con Zod
    const validatedData = updateUserProfileSchema.parse(req.body);
    const dataToUpdate = { ...validatedData }; // Copiar datos validados

    // Manejo opcional de cambio de contraseña
    if (dataToUpdate.password) {
      dataToUpdate.password = await argon2.hash(dataToUpdate.password);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos válidos para actualizar.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { // Devolver solo los campos no sensibles
        id: true,
        username: true,
        email: true,
        role: true,
        notifications: true,
      },
    });

    res.json(updatedUser);

  } catch (error) {
    if (error instanceof require('zod').ZodError) {
      return res.status(400).json({ message: 'Datos de entrada inválidos', errors: error.errors });
    }
    // Manejar errores específicos (ej. email duplicado)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'El email ya está en uso.' });
    }
    if (error.code === 'P2025') { // Error si el usuario no se encuentra para actualizar
        return res.status(404).json({ message: 'Usuario no encontrado para actualizar.'});
    }
    console.error("Error updating profile:", error);
    res.status(500).json({ message: 'Error al actualizar el perfil.', error: error.message });
  }
});

module.exports = router;