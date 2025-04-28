// renderer/pages/notifications/index.tsx
import React, { useEffect, useState } from "react";
import { Layout } from "../../components/layout/Layout";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { Heading } from "../../components/ui/heading";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { BellIcon, CheckIcon, ClockIcon } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/router";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "contract" | "system" | "user";
  status: "read" | "unread";
  createdAt: string;
  entityId?: string;
  entityType?: string;
};

export default function Notifications() {
  const auth = useRequireAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadNotifications() {
      if (auth.user) {
        try {
          setIsLoading(true);
          const notificationsData =
            await window.Electron.notificaciones.obtenerNoLeidas();
          setNotifications(notificationsData);
        } catch (error) {
          console.error("Error al cargar notificaciones:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();
  }, [auth.user]);

  const markAsRead = async (id: string) => {
    try {
      await window.Electron.notificaciones.marcarLeida(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, status: "read" } : notif
        )
      );
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);

    // Navegar según el tipo de notificación
    if (notification.entityType === "Contract" && notification.entityId) {
      router.push(`/contracts/${notification.entityId}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      const promises = notifications
        .filter((n) => n.status === "unread")
        .map((n) => window.Electron.notificaciones.marcarLeida(n.id));

      await Promise.all(promises);

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, status: "read" }))
      );
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones como leídas:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!auth.user) return null;

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center">
          <Heading
            title="Notificaciones"
            description="Centro de notificaciones y alertas"
          />

          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={isLoading}
            >
              <CheckIcon className="mr-2 h-4 w-4" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BellIcon className="mr-2 h-5 w-5" />
              Notificaciones recientes
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} sin leer
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Alertas y mensajes importantes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay notificaciones recientes
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="space-y-4">
                      <div
                        className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                          notification.status === "unread"
                            ? "bg-muted hover:bg-muted/80"
                            : "hover:bg-muted/20"
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="mr-3 mt-0.5">
                          {notification.status === "unread" ? (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          ) : (
                            <div className="w-2 h-2 rounded-full border border-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">
                              {notification.title}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                {
                                  addSuffix: true,
                                  locale: es,
                                }
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {notification.message}
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
