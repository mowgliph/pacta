const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT } = require('../middleware/auth.middleware');
const notificationService = require('../utils/notificationService');
const { z } = require('zod');

const prisma = new PrismaClient();

// Schema de validación para preferencias
const preferencesSchema = z.object({
    type: z.string(),
    email: z.boolean(),
    inApp: z.boolean(),
    system: z.boolean()
});

// Obtener notificaciones del usuario
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: req.user.id,
                isRead: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error al obtener notificaciones' });
    }
});

// Marcar notificación como leída
router.patch('/:id/read', authenticateJWT, async (req, res) => {
    try {
        const notification = await prisma.notification.update({
            where: {
                id: parseInt(req.params.id),
                userId: req.user.id
            },
            data: { isRead: true }
        });
        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        res.status(500).json({ message: 'Error al actualizar notificación' });
    }
});

// Marcar todas las notificaciones como leídas
router.post('/mark-all-read', authenticateJWT, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                userId: req.user.id,
                isRead: false
            },
            data: { isRead: true }
        });
        res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Error al actualizar notificaciones' });
    }
});

// Obtener preferencias de notificación
router.get('/preferences', authenticateJWT, async (req, res) => {
    try {
        const preferences = await prisma.notificationPreference.findMany({
            where: { userId: req.user.id }
        });
        res.json(preferences);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ message: 'Error al obtener preferencias' });
    }
});

// Actualizar preferencias de notificación
router.put('/preferences/:type', authenticateJWT, async (req, res) => {
    try {
        const { type } = req.params;
        const data = preferencesSchema.parse(req.body);

        const preference = await prisma.notificationPreference.upsert({
            where: {
                userId_type: {
                    userId: req.user.id,
                    type: type
                }
            },
            update: {
                email: data.email,
                inApp: data.inApp,
                system: data.system
            },
            create: {
                userId: req.user.id,
                type: type,
                email: data.email,
                inApp: data.inApp,
                system: data.system
            }
        });

        res.json(preference);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
        }
        console.error('Error updating preferences:', error);
        res.status(500).json({ message: 'Error al actualizar preferencias' });
    }
});

// Eliminar notificaciones antiguas (admin only)
router.delete('/cleanup', authenticateJWT, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await prisma.notification.deleteMany({
            where: {
                isRead: true,
                createdAt: {
                    lt: thirtyDaysAgo
                }
            }
        });

        res.json({ message: 'Limpieza de notificaciones completada' });
    } catch (error) {
        console.error('Error cleaning up notifications:', error);
        res.status(500).json({ message: 'Error al limpiar notificaciones' });
    }
});

module.exports = router;