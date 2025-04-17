const cron = require('node-cron');
const notificationService = require('./notificationService');

// Verificar contratos por vencer todos los días a las 9:00 AM
const checkExpiringContracts = cron.schedule('0 9 * * *', async () => {
    try {
        await notificationService.checkExpiringContracts();
        console.log('Verificación de contratos por vencer completada');
    } catch (error) {
        console.error('Error en la verificación de contratos por vencer:', error);
    }
});

// Procesar cola de notificaciones cada 5 minutos
const processNotificationQueue = cron.schedule('*/5 * * * *', async () => {
    try {
        await notificationService.processQueue();
        console.log('Procesamiento de cola de notificaciones completado');
    } catch (error) {
        console.error('Error procesando cola de notificaciones:', error);
    }
});

// Limpiar notificaciones antiguas una vez al día a las 3:00 AM
const cleanOldNotifications = cron.schedule('0 3 * * *', async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await prisma.notification.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo
                },
                isRead: true
            }
        });
        console.log('Limpieza de notificaciones antiguas completada');
    } catch (error) {
        console.error('Error limpiando notificaciones antiguas:', error);
    }
});

module.exports = {
    checkExpiringContracts,
    processNotificationQueue,
    cleanOldNotifications,
    
    // Iniciar todas las tareas
    startAllJobs: () => {
        checkExpiringContracts.start();
        processNotificationQueue.start();
        cleanOldNotifications.start();
        console.log('Tareas programadas iniciadas');
    },
    
    // Detener todas las tareas
    stopAllJobs: () => {
        checkExpiringContracts.stop();
        processNotificationQueue.stop();
        cleanOldNotifications.stop();
        console.log('Tareas programadas detenidas');
    }
};