import { PrismaClient } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";

export class NotificationService {
  private static instance: NotificationService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = prisma;

    // Iniciar las verificaciones programadas
    this.scheduleChecks();
  }

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Crea una nueva notificación para un usuario
   */
  public async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    contractId?: string;
  }) {
    try {
      return await this.prisma.userNotification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          contractId: data.contractId,
        },
      });
    } catch (error) {
      logger.error("Error creando notificación:", error);
      throw error;
    }
  }

  /**
   * Obtiene las notificaciones de un usuario con filtros
   */
  public async getUserNotifications(filters: {
    userId: string;
    isRead?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const { userId, isRead, type, page = 1, limit = 10 } = filters;

      // Construir condiciones de filtrado
      const where: any = {
        userId,
      };

      if (isRead !== undefined) {
        where.isRead = isRead;
      }

      if (type) {
        where.type = type;
      }

      // Obtener conteo total
      const total = await this.prisma.userNotification.count({ where });

      // Obtener notificaciones paginadas
      const notifications = await this.prisma.userNotification.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          contract: {
            select: {
              id: true,
              title: true,
              contractNumber: true,
            },
          },
        },
      });

      return {
        notifications,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error(`Error obteniendo notificaciones para usuario:`, error);
      throw error;
    }
  }

  /**
   * Marca una notificación como leída
   */
  public async markAsRead(notificationId: string, userId: string) {
    try {
      // Verificar que la notificación pertenece al usuario
      const notification = await this.prisma.userNotification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        return false;
      }

      await this.prisma.userNotification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      logger.error(`Error marcando notificación como leída:`, error);
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  public async markAllAsRead(userId: string) {
    try {
      const result = await this.prisma.userNotification.updateMany({
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
    } catch (error) {
      logger.error(
        `Error marcando todas las notificaciones como leídas:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene el conteo de notificaciones no leídas
   */
  public async getUnreadCount(userId: string) {
    try {
      return await this.prisma.userNotification.count({
        where: {
          userId,
          isRead: false,
        },
      });
    } catch (error) {
      logger.error(
        `Error obteniendo conteo de notificaciones no leídas:`,
        error
      );
      throw error;
    }
  }

  /**
   * Elimina una notificación
   */
  public async deleteNotification(notificationId: string, userId: string) {
    try {
      // Verificar que la notificación pertenece al usuario
      const notification = await this.prisma.userNotification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        return false;
      }

      await this.prisma.userNotification.delete({
        where: { id: notificationId },
      });

      return true;
    } catch (error) {
      logger.error(`Error eliminando notificación:`, error);
      throw error;
    }
  }

  /**
   * Verifica contratos próximos a vencer y crea notificaciones
   */
  public async checkContractsExpirations() {
    try {
      // Obtener preferencias de notificación de cada usuario
      const userPreferences = await this.prisma.userPreference.findMany({
        where: {
          notificationsEnabled: true,
        },
        include: {
          user: true,
        },
      });

      // Para cada usuario con notificaciones habilitadas
      for (const pref of userPreferences) {
        if (!pref.user.isActive) continue;

        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + pref.notificationDays);

        // Buscar contratos que vencen en el período configurado
        const expiringContracts = await this.prisma.contract.findMany({
          where: {
            status: "Vigente",
            endDate: {
              gte: today,
              lte: futureDate,
            },
          },
        });

        // Crear notificaciones para cada contrato
        for (const contract of expiringContracts) {
          // Verificar si ya existe una notificación para este contrato
          const existingNotification =
            await this.prisma.userNotification.findFirst({
              where: {
                userId: pref.userId,
                contractId: contract.id,
                type: "contract_expiration",
                isRead: false,
              },
            });

          if (!existingNotification) {
            const daysUntilExpiration = Math.ceil(
              (contract.endDate!.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            await this.createNotification({
              userId: pref.userId,
              title: "Contrato próximo a vencer",
              message: `El contrato "${contract.title}" (${contract.contractNumber}) vencerá en ${daysUntilExpiration} días.`,
              type: "contract_expiration",
              contractId: contract.id,
            });
          }
        }
      }

      return true;
    } catch (error) {
      logger.error("Error verificando contratos próximos a vencer:", error);
      return false;
    }
  }

  /**
   * Actualiza automáticamente el estado de los contratos
   */
  public async updateContractsStatus() {
    try {
      const today = new Date();

      // Actualizar contratos vencidos
      const expiredContracts = await this.prisma.contract.updateMany({
        where: {
          status: "Vigente",
          endDate: {
            lt: today,
          },
        },
        data: {
          status: "Vencido",
        },
      });

      // Actualizar contratos próximos a vencer (30 días)
      const nearExpirationDate = new Date();
      nearExpirationDate.setDate(today.getDate() + 30);

      const nearExpirationContracts = await this.prisma.contract.updateMany({
        where: {
          status: "Vigente",
          endDate: {
            gte: today,
            lte: nearExpirationDate,
          },
        },
        data: {
          status: "Próximo a Vencer",
        },
      });

      logger.info(
        `Estados de contratos actualizados: ${expiredContracts.count} vencidos, ${nearExpirationContracts.count} próximos a vencer`
      );

      return {
        expired: expiredContracts.count,
        nearExpiration: nearExpirationContracts.count,
      };
    } catch (error) {
      logger.error("Error actualizando estado de contratos:", error);
      throw error;
    }
  }

  /**
   * Programa tareas de verificación
   */
  private scheduleChecks() {
    // Importación condicional para node-schedule
    try {
      const schedule = require("node-schedule");

      // Actualizar estados a las 1 AM
      schedule.scheduleJob("0 1 * * *", async () => {
        logger.info(
          "Ejecutando actualización automática de estados de contratos"
        );
        await this.updateContractsStatus();
      });

      // Verificar vencimientos y crear notificaciones a las 2 AM
      schedule.scheduleJob("0 2 * * *", async () => {
        logger.info(
          "Ejecutando verificación automática de contratos próximos a vencer"
        );
        await this.checkContractsExpirations();
      });

      logger.info("Verificaciones automáticas programadas");
    } catch (error) {
      logger.error("Error al programar verificaciones automáticas:", error);
    }
  }
}
