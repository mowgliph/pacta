"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Button } from "@/src/components/ui/button"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Badge } from "@/src/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useNotifications } from "@/hooks/useNotifications"
import { LoadingSpinner } from "@/src/components/ui/loading-spinner"

export function NotificationCenter() {
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()

    // Actualizar cada minuto
    const interval = setInterval(() => {
      fetchNotifications()
    }, 60000)

    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    setOpen(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return `Hoy a las ${format(date, "HH:mm", { locale: es })}`
    } else if (diffInDays === 1) {
      return `Ayer a las ${format(date, "HH:mm", { locale: es })}`
    } else if (diffInDays < 7) {
      return format(date, "EEEE", { locale: es })
    } else {
      return format(date, "d 'de' MMMM", { locale: es })
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center px-1.5 py-0.5"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-medium">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${notification.isRead ? "bg-white" : "bg-blue-50"}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                  {notification.actionUrl && (
                    <Button
                      variant="link"
                      className="mt-1 h-auto p-0 text-xs text-blue-600"
                      onClick={() => {
                        handleMarkAsRead(notification.id)
                        window.location.href = notification.actionUrl!
                      }}
                    >
                      Ver detalles
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
