"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { LoadingSpinner } from "../ui/loading-spinner"
import { useToast } from "../ui/use-toast"
import { useTheme } from "next-themes"

export function UserPreferences() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preferences, setPreferences] = useState({
    notificationsEnabled: true,
    notificationDays: 30,
  })
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/users/preferences")
        if (response.ok) {
          const data = await response.json()
          setPreferences({
            notificationsEnabled: data.notificationsEnabled,
            notificationDays: data.notificationDays,
          })
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreferences()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/users/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Preferencias actualizadas correctamente",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "No se pudieron actualizar las preferencias",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar las preferencias",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
    <Card>
      <CardHeader>
        <CardTitle>Preferencias</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Apariencia</h3>
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Seleccionar tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notificaciones</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex-grow">
                Habilitar notificaciones
              </Label>
              <Switch
                id="notifications"
                checked={preferences.notificationsEnabled}
                onCheckedChange={(checked) => setPreferences({ ...preferences, notificationsEnabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationDays">Días de anticipación para notificaciones</Label>
              <Select
                value={preferences.notificationDays.toString()}
                onValueChange={(value) => setPreferences({ ...preferences, notificationDays: Number.parseInt(value) })}
                disabled={!preferences.notificationsEnabled}
              >
                <SelectTrigger id="notificationDays">
                  <SelectValue placeholder="Seleccionar días" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="15">15 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                  <SelectItem value="90">90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner className="mr-2" />
                Guardando...
              </>
            ) : (
              "Guardar Preferencias"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
