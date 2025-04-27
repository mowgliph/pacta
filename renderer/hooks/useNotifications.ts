"use client"

import { useState, useCallback } from "react"
import { useAuth } from "./useAuth"

interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Obtener notificaciones
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications")

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Marcar notificación como leída
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
        )
        setUnreadCount((prev) => prev - 1)
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
