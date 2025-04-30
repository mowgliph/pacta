import { PrismaClient, UserNotification } from "@prisma/client";
import {
  NotificationPayload,
  NotificationType,
  NotificationPriority,
} from "../channels/notifications.channels";
import { BrowserWindow } from "electron";
import { NotificationChannels } from "../channels/notifications.channels";
import { ipcMain } from "electron";

export class NotificationService {
  private static instance: NotificationService;
  private mainWindow: BrowserWindow | null = null;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  public async createNotification(
    payload: NotificationPayload
  ): Promise<UserNotification> {
    const notification = await this.prisma.userNotification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        priority: payload.priority,
        metadata: payload.metadata || {},
        isRead: false,
      },
    });

    if (this.mainWindow) {
      this.mainWindow.webContents.send(
        NotificationChannels.NOTIFICATION_CREATED,
        notification
      );
    }

    return notification;
  }

  public async getUserNotifications(
    userId: string
  ): Promise<UserNotification[]> {
    return this.prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  public async markAsRead(
    id: string,
    userId: string
  ): Promise<UserNotification> {
    const notification = await this.prisma.userNotification.update({
      where: { id },
      data: { isRead: true },
    });

    if (this.mainWindow) {
      this.mainWindow.webContents.send(NotificationChannels.NOTIFICATION_READ, {
        id,
        userId,
      });
    }

    return notification;
  }

  public async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.userNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    if (this.mainWindow) {
      this.mainWindow.webContents.send(NotificationChannels.NOTIFICATION_READ, {
        userId,
      });
    }

    return { count: result.count };
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.userNotification.count({
      where: { userId, isRead: false },
    });
  }

  public async deleteNotification(id: string, userId: string): Promise<void> {
    await this.prisma.userNotification.delete({
      where: { id },
    });

    if (this.mainWindow) {
      this.mainWindow.webContents.send(
        NotificationChannels.NOTIFICATION_DELETED,
        { id, userId }
      );
    }
  }

  public async checkExpiringContracts(): Promise<void> {
    const contracts = await this.prisma.contract.findMany({
      where: {
        endDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          gt: new Date(),
        },
      },
    });

    for (const contract of contracts) {
      await this.createNotification({
        userId: contract.ownerId,
        title: "Contrato próximo a vencer",
        message: `El contrato ${contract.contractNumber} vence en ${Math.ceil(
          (contract.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )} días`,
        type: NotificationType.CONTRACT,
        priority: NotificationPriority.HIGH,
        metadata: {
          contractId: contract.id,
          daysUntilExpiration: Math.ceil(
            (contract.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
        },
      });
    }
  }
}

// Inicializar el servicio y configurar los handlers IPC
export const notificationService = NotificationService.getInstance();

ipcMain.handle(
  NotificationChannels.CREATE,
  async (_, payload: NotificationPayload) => {
    return notificationService.createNotification(payload);
  }
);

ipcMain.handle(
  NotificationChannels.GET_USER_NOTIFICATIONS,
  async (_, userId: string) => {
    return notificationService.getUserNotifications(userId);
  }
);

ipcMain.handle(
  NotificationChannels.MARK_AS_READ,
  async (_, id: string, userId: string) => {
    return notificationService.markAsRead(id, userId);
  }
);

ipcMain.handle(
  NotificationChannels.MARK_ALL_AS_READ,
  async (_, userId: string) => {
    return notificationService.markAllAsRead(userId);
  }
);

ipcMain.handle(
  NotificationChannels.GET_UNREAD_COUNT,
  async (_, userId: string) => {
    return notificationService.getUnreadCount(userId);
  }
);

ipcMain.handle(
  NotificationChannels.DELETE,
  async (_, id: string, userId: string) => {
    return notificationService.deleteNotification(id, userId);
  }
);
