const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const argon2 = require('argon2');
const upload = require('./middleware/upload.middleware');
const { PrismaClient } = require('@prisma/client');
const cronJobs = require('./utils/cronJobs');
const os = require('os');
const nodemailer = require('nodemailer');

// Importar rutas
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const contractRoutes = require('./routes/contract.route');
const statisticsRoutes = require('./routes/statistics.route');
const publicRoutes = require('./routes/public.route');
const settingsRoutes = require('./routes/settings.route');
const notificationRoutes = require('./routes/notification.route');

const prisma = new PrismaClient();
const app = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware para validar JWT
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware para validar roles
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) return res.sendStatus(403);
    next();
  };
};

// Asegurarse de que el directorio de uploads existe
const uploadDir = path.join(__dirname, '../data/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Validación de entradas con Joi
const userSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('User', 'Admin', 'RA').default('User'),
  notifications: Joi.boolean().default(true),
});

const contractSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  status: Joi.string().valid('Active', 'Expired', 'Pending', 'Terminated').default('Active'),
  fileUrl: Joi.string().optional(),
  userId: Joi.number().required(),
  companyId: Joi.number().optional(),
  departmentId: Joi.number().optional(),
});

const supplementSchema = Joi.object({
  contractId: Joi.number().required(),
  description: Joi.string().required(),
  fileUrl: Joi.string().optional(),
});

const notificationSchema = Joi.object({
  userId: Joi.number().required(),
  message: Joi.string().required(),
  isRead: Joi.boolean().default(false),
});

const activitySchema = Joi.object({
  userId: Joi.number().required(),
  contractId: Joi.number().optional(),
  action: Joi.string().required(),
  details: Joi.string().required(),
});

const accessLogSchema = Joi.object({
  userId: Joi.number().required(),
  action: Joi.string().required(),
  details: Joi.required(),
  ip: Joi.string().required(),
  userAgent: Joi.string().required(),
});

const permissionSchema = Joi.object({
  userId: Joi.number().required(),
  resource: Joi.string().required(),
  canCreate: Joi.boolean().default(false),
  canRead: Joi.boolean().default(false),
  canUpdate: Joi.boolean().default(false),
  canDelete: Joi.boolean().default(false),
});

const backupSchema = Joi.object({
  filename: Joi.string().required(),
  filepath: Joi.string().required(),
  encrypted: Joi.boolean().default(true),
});

// Autenticación
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

  // Guardar en AccessLog
  await prisma.accessLog.create({
    data: {
      userId: user.id,
      action: 'Login',
      details: 'User logged in',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  res.json({ message: 'Login successful', user, token });
});

app.post('/register', async (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password, role, notifications } = value;
  const hashedPassword = await argon2.hash(password);

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

    // Guardar en AccessLog
    await prisma.accessLog.create({
      data: {
        userId: user.id,
        action: 'Register',
        details: 'User registered',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Gestión de Usuarios
app.get('/users', authenticateJWT, authorizeRole('RA'), async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

app.post('/users', authenticateJWT, authorizeRole('RA'), async (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password, role, notifications } = value;
  const hashedPassword = await argon2.hash(password);

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

    // Guardar en AccessLog
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

// Gestión de Contratos
app.get('/contracts', authenticateJWT, async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        user: true,
        company: true,
        department: true,
        obligations: true,
        deliveries: true,
        payments: true,
        guarantees: true,
        supplements: true,
        activities: true,
      },
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contracts', error });
  }
});

app.post('/contracts', authenticateJWT, upload.single('file'), async (req, res) => {
  const { error, value } = contractSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, description, startDate, endDate, status, userId, companyId, departmentId } = value;
  let fileUrl = null;

  if (req.file) {
    fileUrl = req.file.path;
  }

  try {
    const contract = await prisma.contract.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        fileUrl,
        userId,
        companyId,
        departmentId,
      },
    });

    // Guardar en AccessLog
    await prisma.accessLog.create({
      data: {
        userId: req.user.id,
        action: 'Create Contract',
        details: `Contract ${name} created`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({ message: 'Contract created', contract });
  } catch (error) {
    if (fileUrl) {
      await deleteFile(fileUrl);
    }
    res.status(500).json({ message: 'Error creating contract', error });
  }
});

// Gestión de Suplementos
app.get('/supplements', authenticateJWT, async (req, res) => {
  try {
    const supplements = await prisma.supplement.findMany({
      include: {
        contract: true,
      },
    });
    res.json(supplements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supplements', error });
  }
});

app.post('/supplements', authenticateJWT, upload.single('file'), async (req, res) => {
  const { error, value } = supplementSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { contractId, description } = value;
  let fileUrl = null;

  if (req.file) {
    fileUrl = req.file.path;
  }

  try {
    const supplement = await prisma.supplement.create({
      data: {
        contractId,
        description,
        fileUrl,
      },
    });

    // Guardar en AccessLog
    await prisma.accessLog.create({
      data: {
        userId: req.user.id,
        action: 'Create Supplement',
        details: `Supplement for contract ${contractId} created`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({ message: 'Supplement created', supplement });
  } catch (error) {
    if (fileUrl) {
      await deleteFile(fileUrl);
    }
    res.status(500).json({ message: 'Error creating supplement', error });
  }
});

// Gestión de Notificaciones
app.get('/notifications', authenticateJWT, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
});

app.post('/notifications', authenticateJWT, async (req, res) => {
  const { error, value } = notificationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { userId, message, isRead } = value;

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        isRead,
      },
    });

    // Guardar en AccessLog
    await prisma.accessLog.create({
      data: {
        userId: req.user.id,
        action: 'Create Notification',
        details: `Notification for user ${userId} created`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({ message: 'Notification created', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification', error });
  }
});

// Gestión de Actividades
app.get('/activities', authenticateJWT, async (req, res) => {
    try {
        const activities = await prisma.activity.findMany({
            where: {
              userId: req.user.id,
            },
        });
        res.json(activities);
        } catch (error) {
          res.status(500).json({ message: 'Error fetching activities', error });
        }
    });

    app.post('/activities', authenticateJWT, async (req, res) => {
        const { error, value } = activitySchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
      
        const { contractId, action, details } = value;
      
        try {
          const activity = await prisma.activity.create({
            data: {
              userId: req.user.id,
              contractId,
              action,
              details,
            },
        });
      
        // Guardar en AccessLog
        await prisma.accessLog.create({
            data: {
              userId: req.user.id,
              action: 'Create Activity',
              details: `Activity for user ${req.user.id} created`,
              ip: req.ip,
              userAgent: req.headers['user-agent'],
            },
        });
      
        res.status(201).json({ message: 'Activity created', activity });
        } catch (error) {
          res.status(500).json({ message: 'Error creating activity', error });
        }
    });
    
// Gestión de Permisos
app.get('/permissions', authenticateJWT, async (req, res) => {
    try {
      const permissions = await prisma.permission.findMany({
        where: {
          userId: req.user.id,
        },
      });
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching permissions', error });
    }
  });
  
app.post('/permissions', authenticateJWT, authorizeRole('RA'), async (req, res) => {
  const { error, value } = permissionSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { userId, resource, canCreate, canRead, canUpdate, canDelete } = value;

  try {
    const permission = await prisma.permission.create({
      data: {
        userId,
        resource,
        canCreate,
        canRead,
        canUpdate,
        canDelete,
      },
    });

    // Guardar en AccessLog
    await prisma.accessLog.create({
      data: {
        userId: req.user.id,
        action: 'Create Permission',
        details: `Permission for user ${userId} created`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({ message: 'Permission created', permission });
  } catch (error) {
    res.status(500).json({ message: 'Error creating permission', error });
  }
});
  
// Gestión de Copias de Seguridad
app.get('/backups', authenticateJWT, authorizeRole('Admin'), async (req, res) => {
  try {
    const backups = await prisma.backup.findMany();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching backups', error });
  }
});
  
app.post('/backups', authenticateJWT, authorizeRole('Admin'), async (req, res) => {
  const { error, value } = backupSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { filename, filepath, encrypted } = value;

  try {
    const backup = await prisma.backup.create({
      data: {
        filename,
        filepath,
        encrypted,
      },
    });

    // Guardar en AccessLog
    await prisma.accessLog.create({
      data: {
        userId: req.user.id,
        action: 'Create Backup',
        details: `Backup ${filename} created`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({ message: 'Backup created', backup });
  } catch (error) {
    res.status(500).json({ message: 'Error creating backup', error });
  }
});

// Configuración de copias de seguridad manuales
const backupDatabase = async () => {
  const date = new Date();
  const filename = `backup_${date.toISOString().replace(/:/g, '-')}.sqlite`;
  const filepath = path.join(__dirname, '../data/backups', filename);

  try {
    // Asegurarse de que el directorio existe
    const backupDir = path.join(__dirname, '../data/backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Crear el backup
    await prisma.$executeRaw`VACUUM INTO ${filepath}`;

    // Guardar registro en la base de datos
    await prisma.backup.create({
      data: {
        filename,
        filepath,
        encrypted: false,
      },
    });

    console.log(`Backup creado exitosamente: ${filename}`);
    return { success: true, filename };
  } catch (error) {
    console.error('Error creando backup:', error);
    return { success: false, error };
  }
};

// Endpoint para crear backups manualmente
app.post('/api/backups/create', authenticateJWT, authorizeRole('Admin'), async (req, res) => {
  try {
    const result = await backupDatabase();
    if (result.success) {
      // Guardar en AccessLog
      await prisma.accessLog.create({
        data: {
          userId: req.user.id,
          action: 'Manual Backup',
          details: `Backup ${result.filename} creado manualmente`,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
      
      res.status(201).json({ message: 'Backup creado exitosamente', filename: result.filename });
    } else {
      res.status(500).json({ message: 'Error al crear backup', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al crear backup', error });
  }
});

// Endpoint para activar/desactivar backups automáticos
app.post('/api/settings/backup-schedule', authenticateJWT, authorizeRole('Admin'), async (req, res) => {
  const { enabled, intervalHours } = req.body;
  
  try {
    // Guardar la configuración en la base de datos
    const setting = await prisma.setting.upsert({
      where: { key: 'backup_schedule' },
      update: { value: JSON.stringify({ enabled, intervalHours }) },
      create: {
        key: 'backup_schedule',
        value: JSON.stringify({ enabled, intervalHours }),
        category: 'SYSTEM'
      }
    });
    
    // Guardar en AccessLog
    await prisma.accessLog.create({
      data: {
        userId: req.user.id,
        action: 'Update Backup Settings',
        details: `Backup automático ${enabled ? 'activado' : 'desactivado'}`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });
    
    res.status(200).json({ message: 'Configuración actualizada', setting });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar configuración', error });
  }
});

// Crear el directorio de backups si no existe
const backupDir = path.join(__dirname, '../data/backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Endpoint de salud
app.get('/api/health', async (req, res) => {
  // Estado de la base de datos
  let dbStatus = 'OK';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    dbStatus = 'ERROR';
  }

  // Estado de backups
  let lastBackup = null;
  let backupCount = 0;
  try {
    const backupDir = path.join(__dirname, '../data/backups');
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sqlite'));
    backupCount = files.length;
    if (files.length > 0) {
      lastBackup = fs.statSync(path.join(backupDir, files[files.length - 1])).mtime;
    }
  } catch (e) {
    // Si no hay backups o error, dejar valores por defecto
  }

  // Estado de espacio en disco
  let disk = { free: null, total: null };
  try {
    const diskInfo = os.freemem();
    disk.free = diskInfo;
    disk.total = os.totalmem();
  } catch (e) {}

  // Estado SMTP (opcional, solo si hay config guardada)
  let smtpStatus = 'UNKNOWN';
  try {
    const smtpConfig = await prisma.sMTPConfig.findFirst();
    if (smtpConfig && smtpConfig.host) {
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password
        }
      });
      await transporter.verify();
      smtpStatus = 'OK';
    } else {
      smtpStatus = 'NOT_CONFIGURED';
    }
  } catch (e) {
    smtpStatus = 'ERROR';
  }

  res.json({
    database: dbStatus,
    smtp: smtpStatus,
    backups: { lastBackup, count: backupCount },
    disk
  });
});

// Ruta de health check (opcional)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Middleware para manejar errores 404 (ruta no encontrada)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para manejar otros errores (ej. de Prisma, etc.)
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err);
  // Podrías añadir manejo específico para errores de Prisma aquí
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    // Solo incluir stack en desarrollo
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Inicialización del Servidor ---
const server = app.listen(port, () => {
  console.log(`Backend server escuchando en http://localhost:${port}`);
  // Iniciar tareas programadas
  cronJobs.startAllJobs();
});

// --- Manejo de Cierre Limpio (opcional pero recomendado) ---
const gracefulShutdown = async () => {
  console.log('Recibida señal de cierre, cerrando servidor HTTP...');
  server.close(async () => {
    console.log('Servidor HTTP cerrado.');
    // Cerrar conexión de Prisma
    try {
        await prisma.$disconnect();
        console.log('Conexión Prisma desconectada.');
    } catch (e) {
        console.error('Error desconectando Prisma:', e);
    }
    // Detener tareas programadas
    cronJobs.stopAllJobs();
    process.exit(0);
  });

  // Forzar cierre después de un timeout
  setTimeout(() => {
    console.error('No se pudo cerrar conexiones a tiempo, forzando cierre.');
    process.exit(1);
  }, 10000); // 10 segundos
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown); // Capturar Ctrl+C
