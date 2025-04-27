"use client"

import { useEffect } from "react"
import { format } from "date-fns"
import { useNotifications } from "../../hooks/useNotifications"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { LoadingSpinner } from "../ui/loading-spinner"
import { Bell, Check, Calendar, FileText, Info } from "lucide-react"
import type { Notification } from "../../types"

export function NotificationList() {
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const getNotificationIcon = (type: string, subtype: string) => {
    if (type === "contract") {
      if (subtype === "expiration") {
        return <Calendar className="h-5 w-5 text-yellow-500" />
      } else if (subtype === "creation" || subtype === "modification") {
        return <FileText className="h-5 w-5 text-blue-500" />
      }
    }

    return <Info className="h-5 w-5 text-gray-500" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return `Today at ${format(date, "h:mm a")}`
    } else if (diffInDays === 1) {
      return `Yesterday at ${format(date, "h:mm a")}`
    } else if (diffInDays < 7) {
      return format(date, "EEEE")
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </h2>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No notifications</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: number) => void
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const { id, title, message, type, subtype, isRead, createdAt } = notification

  const getNotificationIcon = (type: string, subtype: string) => {
    if (type === "contract") {
      if (subtype === "expiration") {
        return <Calendar className="h-5 w-5 text-yellow-500" />
      } else if (subtype === "creation" || subtype === "modification") {
        return <FileText className="h-5 w-5 text-blue-500" />
      }
    }

    return <Info className="h-5 w-5 text-gray-500" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return `Today at ${format(date, "h:mm a")}`
    } else if (diffInDays === 1) {
      return `Yesterday at ${format(date, "h:mm a")}`
    } else if (diffInDays < 7) {
      return format(date, "EEEE")
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${isRead ? "bg-white" : "bg-blue-50 border-blue-100"}`}>
      <div className="flex">
        <div className="mr-3 mt-1">{getNotificationIcon(type, subtype)}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{title}</h3>
            <span className="text-xs text-gray-500">{formatDate(createdAt)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>
        {!isRead && (
          <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0" onClick={() => onMarkAsRead(id)}>
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
      </div>
    </div>
  )
}
