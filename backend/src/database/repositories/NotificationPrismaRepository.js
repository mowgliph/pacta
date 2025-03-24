/**
 * Repositorio para operaciones relacionadas con notificaciones usando Prisma
 */
import { BasePrismaRepository } from './BasePrismaRepository.js';

export class NotificationPrismaRepository extends BasePrismaRepository {
  constructor() {
    super('notification');
  }

  /**
   * Busca notificaciones de un usuario con filtros opcionales
   * @param {String} userId - ID del usuario
   * @param {Object} filters - Filtros opcionales (isRead, type)
   * @param {Number} page - Número de página
   * @param {Number} limit - Resultados por página
   * @returns {Promise<Object>} - Notificaciones con paginación
   */
  async findUserNotifications(userId, filters = {}, page = 1, limit = 10) {
    const { isRead, type } = filters;
    const skip = (page - 1) * limit;

    // Construir condiciones where
    const where = {
      userId,
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    // Ejecutar consulta con paginación
    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contract: true,
        },
      }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cuenta notificaciones no leídas de un usuario
   * @param {String} userId - ID del usuario
   * @returns {Promise<Number>} - Total de notificaciones no leídas
   */
  async countUnread(userId) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Marca notificaciones como leídas
   * @param {String|Array} notificationIds - ID o array de IDs de notificaciones
   * @param {String} userId - ID del usuario propietario
   * @returns {Promise<Number>} - Número de notificaciones actualizadas
   */
  async markAsRead(notificationIds, userId) {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    const result = await this.prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @param {String} userId - ID del usuario
   * @returns {Promise<Number>} - Número de notificaciones actualizadas
   */
  async markAllAsRead(userId) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Crea notificaciones para contratos próximos a vencer
   * @param {Number} daysThreshold - Días umbral para considerar vencimiento próximo
   * @returns {Promise<Number>} - Número de notificaciones creadas
   */
  async createExpirationNotifications(daysThreshold = 30) {
    // Calcular la fecha límite
    const today = new Date();
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + daysThreshold);

    // Obtener contratos que vencen dentro del umbral
    const expiringContracts = await this.prisma.contract.findMany({
      where: {
        endDate: {
          gte: today,
          lte: limitDate,
        },
        status: 'ACTIVE',
      },
      include: {
        author: true,
      },
    });

    // Crear notificaciones
    let createdCount = 0;

    for (const contract of expiringContracts) {
      // Verificar si ya existe una notificación para este contrato
      const existingNotification = await this.prisma.notification.findFirst({
        where: {
          contractId: contract.id,
          type: 'EXPIRATION_WARNING',
          createdAt: {
            gte: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Último día
          },
        },
      });

      if (!existingNotification) {
        // Calcular días restantes
        const daysRemaining = Math.ceil(
          (new Date(contract.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Crear notificación
        await this.prisma.notification.create({
          data: {
            type: 'EXPIRATION_WARNING',
            title: `Contrato próximo a vencer`,
            message: `El contrato "${contract.title}" vencerá en ${daysRemaining} días.`,
            userId: contract.authorId,
            contractId: contract.id,
          },
        });

        createdCount++;
      }
    }

    return createdCount;
  }
}

export default new NotificationPrismaRepository();
