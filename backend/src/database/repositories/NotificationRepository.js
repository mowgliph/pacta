/**
 * Repositorio para operaciones relacionadas con Notificaciones
 * Extiende las funcionalidades básicas para el modelo Notification
 */
import { BasePrismaRepository } from './BasePrismaRepository.js';

export class NotificationRepository extends BasePrismaRepository {
  constructor() {
    super('notification');
  }

  /**
   * Encuentra notificaciones de un usuario
   * @param {String} userId - ID del usuario
   * @param {Object} options - Opciones adicionales (isRead, limit, etc.)
   * @param {Number} page - Número de página
   * @param {Number} limit - Límite de resultados por página
   * @returns {Promise<Object>} - Notificaciones encontradas con metadata
   */
  async findUserNotifications(userId, options = {}, page = 1, limit = 10) {
    const { isRead, type, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    // Construir condiciones de búsqueda
    const where = { userId };

    // Filtros específicos
    if (isRead !== undefined) where.isRead = isRead;
    if (type) where.type = type;

    // Configurar ordenamiento
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    return this.findAll(
      {
        where,
        orderBy,
        include: {
          contract: {
            select: {
              id: true,
              title: true,
              contractNumber: true,
              endDate: true,
            },
          },
        },
      },
      page,
      limit,
    );
  }

  /**
   * Marca notificaciones como leídas
   * @param {String|Array} ids - ID o array de IDs de notificaciones
   * @param {String} userId - ID del usuario propietario
   * @returns {Promise<Number>} - Número de notificaciones actualizadas
   */
  async markAsRead(ids, userId) {
    const notificationIds = Array.isArray(ids) ? ids : [ids];

    const result = await this.prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
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
   * @param {String} userId - ID del usuario propietario
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
   * Crea notificaciones para contratos por vencer
   * @param {Number} daysThreshold - Días umbral para alertas
   * @returns {Promise<Number>} - Número de notificaciones creadas
   */
  async createExpirationNotifications(daysThreshold = 30) {
    // Encontrar contratos por vencer que no tengan notificaciones recientes
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    // 1. Obtener contratos por vencer
    const expiringContracts = await this.prisma.contract.findMany({
      where: {
        endDate: {
          gte: today,
          lte: thresholdDate,
        },
        status: {
          in: ['ACTIVE', 'PENDING_RENEWAL'],
        },
        deletedAt: null,
      },
      include: {
        author: true,
        company: true,
        department: {
          include: {
            users: true,
          },
        },
      },
    });

    // 2. Crear notificaciones
    let notificationsCreated = 0;

    for (const contract of expiringContracts) {
      // Verificar si ya existe una notificación reciente para este contrato
      const existingNotification = await this.prisma.notification.findFirst({
        where: {
          contractId: contract.id,
          type: 'EXPIRATION_WARNING',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
          },
        },
      });

      if (existingNotification) {
        continue; // Ya existe una notificación reciente
      }

      // Calcular días hasta vencimiento
      const daysToExpiration = Math.ceil((contract.endDate - today) / (1000 * 60 * 60 * 24));

      // Crear notificación para el autor del contrato
      await this.prisma.notification.create({
        data: {
          type: 'EXPIRATION_WARNING',
          title: `Contrato próximo a vencer: ${contract.title}`,
          message: `El contrato con ${contract.company.name} vencerá en ${daysToExpiration} días (${contract.endDate.toLocaleDateString()}).`,
          userId: contract.authorId,
          contractId: contract.id,
        },
      });
      notificationsCreated++;

      // Notificar a usuarios del departamento si existe
      if (contract.department && contract.department.users) {
        for (const user of contract.department.users) {
          // No duplicar notificación para el autor
          if (user.id === contract.authorId) continue;

          await this.prisma.notification.create({
            data: {
              type: 'EXPIRATION_WARNING',
              title: `Contrato próximo a vencer: ${contract.title}`,
              message: `El contrato con ${contract.company.name} vencerá en ${daysToExpiration} días (${contract.endDate.toLocaleDateString()}).`,
              userId: user.id,
              contractId: contract.id,
            },
          });
          notificationsCreated++;
        }
      }
    }

    return notificationsCreated;
  }
}
