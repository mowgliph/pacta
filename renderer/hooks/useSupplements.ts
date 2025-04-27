"use client"

import { useState, useCallback } from "react"
import { useToast } from "../components/ui/use-toast"

export function useSupplements(contractId: string) {
  const [supplements, setSupplements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchSupplements = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/contracts/${contractId}/supplements`)
      if (!response.ok) {
        throw new Error("Error fetching supplements")
      }
      const data = await response.json()
      setSupplements(data.supplements)
    } catch (error) {
      console.error("Error fetching supplements:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los suplementos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [contractId, toast])

  const createSupplement = useCallback(
    async (data: any) => {
      try {
        const response = await fetch("/api/supplements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, contractId }),
        })
        if (!response.ok) {
          throw new Error("Error creating supplement")
        }
        const result = await response.json()
        return result.supplement
      } catch (error) {
        console.error("Error creating supplement:", error)
        toast({
          title: "Error",
          description: "No se pudo crear el suplemento",
          variant: "destructive",
        })
        return null
      }
    },
    [contractId, toast],
  )

  return {
    supplements,
    isLoading,
    fetchSupplements,
    createSupplement,
  }
}
