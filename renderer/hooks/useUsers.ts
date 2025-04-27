"use client"

import { useState, useCallback } from "react"
import { useToast } from "../components/ui/use-toast"

export function useUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Error fetching users")
      }
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const toggleUserStatus = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(`/api/users/${userId}/toggle-status`, {
          method: "PUT",
        })
        if (!response.ok) {
          throw new Error("Error toggling user status")
        }
        return true
      } catch (error) {
        console.error("Error toggling user status:", error)
        toast({
          title: "Error",
          description: "No se pudo cambiar el estado del usuario",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  return {
    users,
    isLoading,
    fetchUsers,
    toggleUserStatus,
  }
}
