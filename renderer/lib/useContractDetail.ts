import { useEffect, useState } from "react"
import type { Contract } from "./useContracts"

export interface Supplement {
  id: string
  contractId: string
  field: string
  oldValue: string
  newValue: string
  description: string
  createdAt: string
}

export function useContractDetail(id: string) {
  const [contract, setContract] = useState<Contract | null>(null)
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    Promise.all([
      window.Electron.contracts.getById(id),
      window.Electron.supplements.list(id)
    ])
      .then(([cRes, sRes]: any[]) => {
        if (mounted) {
          if (cRes.success && cRes.data) setContract(cRes.data)
          else setError(cRes.error || "No se encontró el contrato")
          if (sRes.success && Array.isArray(sRes.data)) setSupplements(sRes.data)
        }
      })
      .catch((err: any) => {
        if (mounted) setError(err?.message || "Error de conexión")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [id])

  return { contract, supplements, loading, error }
} 