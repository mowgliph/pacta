import { useEffect, useState } from "react"

export interface Contract {
  id: string
  number: string
  company: string
  type: "Cliente" | "Proveedor"
  startDate: string
  endDate: string
  amount: number
  status: string
  description: string
}

export function useContracts(tipo?: "Cliente" | "Proveedor") {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    // @ts-ignore
    if (window.Electron?.contracts?.list) {
      // @ts-ignore
      window.Electron.contracts.list(tipo ? { tipo } : {})
        .then((res: any) => {
          if (mounted) {
            if (res.success && Array.isArray(res.data)) {
              setContracts(res.data)
            } else {
              setError(res.error || "Error al obtener contratos")
            }
          }
        })
        .catch((err: any) => {
          if (mounted) setError(err?.message || "Error de conexión")
        })
        .finally(() => {
          if (mounted) setLoading(false)
        })
    } else {
      setError("API de contratos no disponible")
      setLoading(false)
    }
    return () => {
      mounted = false
    }
  }, [tipo])

  return { contracts, loading, error }
} 