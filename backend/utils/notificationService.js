const { PrismaClient } = require('@prisma/client');
const sendMail = require('./sendMail');
const prisma = new PrismaClient();

class NotificationService {
    async createNotification(data) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: data.userId,
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    subtype: data.subtype,
                    data: data.data || {}
                }
            });

            // Obtener preferencias del usuario
            const preferences = await this.getUserPreferences(data.userId, data.type);
            
            if (preferences.inApp) {
                await this.queueNotification('inApp', notification);
            }

            if (preferences.email) {
                await this.queueEmailNotification(notification);
            }

            if (preferences.system) {
                await this.queueNotification('system', notification);
            }

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async getUserPreferences(userId, type) {
        const preferences = await prisma.notificationPreference.findFirst({
            where: { userId, type }
        });

        // Si no existen preferencias, crear con valores por defecto
        if (!preferences) {
            return prisma.notificationPreference.create({
                data: {
                    userId,
                    type,
                    email: true,
                    inApp: true,
                    system: true
                }
            });
        }

        return preferences;
    }

    async queueNotification(type, notification) {
        return prisma.notificationQueue.create({
            data: {
                type,
                payload: notification,
                status: 'pending'
            }
        });
    }

    async queueEmailNotification(notification) {
        const user = await prisma.user.findUnique({
            where: { id: notification.userId }
        });

        if (!user || !user.email) return;

        const emailTemplate = await this.getEmailTemplate(notification.type);
        const emailData = {
            to: user.email,
            subject: emailTemplate.processSubject(notification),
            html: emailTemplate.processBody(notification)
        };

        return this.queueNotification('email', { ...notification, emailData });
    }

    async processQueue() {
        const pendingNotifications = await prisma.notificationQueue.findMany({
            where: {
                status: 'pending',
                attempts: { lt: 3 }
            }
        });

        for (const queuedNotification of pendingNotifications) {
            try {
                if (queuedNotification.type === 'email') {
                    await this.sendEmailNotification(queuedNotification.payload);
                }

                await prisma.notificationQueue.update({
                    where: { id: queuedNotification.id },
                    data: {
                        status: 'sent',
                        processedAt: new Date()
                    }
                });
            } catch (error) {
                await prisma.notificationQueue.update({
                    where: { id: queuedNotification.id },
                    data: {
                        status: 'failed',
                        attempts: { increment: 1 },
                        error: error.message
                    }
                });
            }
        }
    }

    async sendEmailNotification(payload) {
        const { emailData } = payload;
        return sendMail(emailData);
    }

    async getEmailTemplate(type) {
        // Implementar lógica para obtener y procesar plantillas
        return {
            processSubject: (notification) => `PACTA - ${notification.title}`,
            processBody: (notification) => `
                <h2>${notification.title}</h2>
                <p>${notification.message}</p>
                ${notification.data ? JSON.stringify(notification.data, null, 2) : ''}
            `
        };
    }

    // Métodos para monitoreo proactivo
    async checkExpiringContracts() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringContracts = await prisma.contract.findMany({
            where: {
                endDate: {
                    lte: thirtyDaysFromNow,
                    gt: new Date()
                },
                status: 'Active'
            },
            include: {
                user: true
            }
        });

        for (const contract of expiringContracts) {
            await this.createNotification({
                userId: contract.userId,
                title: 'Contrato próximo a vencer',
                message: `El contrato "${contract.name}" vencerá el ${contract.endDate.toLocaleDateString()}`,
                type: 'contract',
                subtype: 'expiration',
                data: { contractId: contract.id }
            });
        }
    }
}

module.exports = new NotificationService();