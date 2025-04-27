import { PrismaClient } from "@prisma/client"

export class NotificationService {
  private prisma: PrismaClient
  private logger: any

  constructor(prisma: PrismaClient, logger: any) {
    this.prisma = prisma
    this.logger = logger
    
    // Iniciar las verificaciones programadas
    this.scheduleChecks()
  }

  /**
   * Crea una nueva notificación para un usuario
   */
  async createNotification(data: {
    userId: string
    title: string
    message: string
    type: string
    contractId?: string
  }) {
    try {
      return await this.prisma.notification.create({
        data,
      })
    } catch (error) {
      this.logger.error("Error creando notificación:", error)
      throw error
    }
  }

  /**
   * Obtiene las notificaciones de un usuario
   */
  async getUserNotifications(userId: string, includeRead = false) {
    try {
      return await this.prisma.notification.findMany({
        where: {
          userId,
          ...(includeRead ? {} : { isRead: false }),
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } catch (error) {
      this.logger.error(`Error obteniendo notificaciones para usuario ${userId}:`, error)
      throw error
    }
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: string) {
    try {
      return await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })
    } catch (error) {
      this.logger.error(`Error marcando notificación ${notificationId} como leída:`, error)
      throw error
    }
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  async markAllAsRead(userId: string) {
    try {
      return await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })
    } catch (error) {
      this.logger.error(`Error marcando todas las notificaciones como leídas para usuario ${userId}:`, error)
      throw error
    }
  }

  /**
   * Verifica contratos próximos a vencer y crea notificaciones
   */
  async checkContractsExpirations() {
    try {
      // Obtener preferencias de notificación de cada usuario
      const userPreferences = await this.prisma.userPreference.findMany({
        where: {
          notificationsEnabled: true,
        },
        include: {
          user: true,
        },
      })

      // Para cada usuario con notificaciones habilitadas
      for (const pref of userPreferences) {
        if (!pref.user.isActive) continue

        const today = new Date()
        const futureDate = new Date()
        futureDate.setDate(today.getDate() + pref.notificationDays)

        // Buscar contratos que vencen en el período configurado
        const expiringContracts = await this.prisma.contract.findMany({
          where: {
            status: "Vigente",
            endDate: {
              gte: today,
              lte: futureDate,
            },
          },
        })

        // Crear notificaciones para cada contrato
        for (const contract of expiringContracts) {
          // Verificar si ya existe una notificación para este contrato
          const existingNotification = await this.prisma.notification.findFirst({
            where: {
              userId: pref.userId,
              contractId: contract.id,
              type: "contract_expiration",
              isRead: false,
            },
          })

          if (!existingNotification) {
            const daysUntilExpiration = Math.ceil(
              (contract.endDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            )

            await this.createNotification({
              userId: pref.userId,
              title: "Contrato próximo a vencer",
              message: `El contrato "${contract.title}" (${contract.contractNumber}) vencerá en ${daysUntilExpiration} días.`,
              type: "contract_expiration",
              contractId: contract.id,
            })
          }
        }
      }

      return true
    } catch (error) {
      this.logger.error("Error verificando contratos próximos a vencer:", error)
      return false
    }
  }

  /**
   * Actualiza automáticamente el estado de los contratos
   */
  async updateContractsStatus() {
    try {
      const today = new Date()

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
      })

      // Actualizar contratos próximos a vencer (30 días)
      const nearExpirationDate = new Date()
      nearExpirationDate.setDate(today.getDate() + 30)

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
      })

      this.logger.info(
        `Estados de contratos actualizados: ${expiredContracts.count} vencidos, ${nearExpirationContracts.count} próximos a vencer`,
      )

      return {
        expired: expiredContracts.count,
        nearExpiration: nearExpirationContracts.count,
      }
    } catch (error) {
      this.logger.error("Error actualizando estado de contratos:", error)
      throw error
    }
  }

  /**
   * Programa tareas de verificación
   */
  scheduleChecks() {
    // Importación condicional para node-schedule
    try {
      const schedule = require("node-schedule")

      // Actualizar estados a las 1 AM
      schedule.scheduleJob("0 1 * * *", async () => {
        this.logger.info("Ejecutando actualización automática de estados de contratos")
        await this.updateContractsStatus()
      })

      // Verificar vencimientos y crear notificaciones a las 2 AM
      schedule.scheduleJob("0 2 * * *", async () => {
        this.logger.info("Ejecutando verificación automática de contratos próximos a vencer")
        await this.checkContractsExpirations()
      })

      this.logger.info("Verificaciones automáticas programadas")
    } catch (error) {
      this.logger.error("Error al programar verificaciones automáticas:", error)
    }
  }
}
