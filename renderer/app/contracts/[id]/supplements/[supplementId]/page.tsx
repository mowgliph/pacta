"use client"
import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { FileDown, ArrowLeft } from "lucide-react"

interface Supplement {
  id: string
  contractId: string
  field: string
  oldValue: string
  newValue: string
  description: string
  createdAt: string
  fileName?: string
}

export default function SupplementDetailPage() {
  const params = useParams<{ id: string; supplementId: string }>()
  const router = useRouter()
  const contractId = params.id
  const supplementId = params.supplementId
  const [supplement, setSupplement] = useState<Supplement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    // @ts-ignore
    window.Electron.supplements.getById(supplementId)
      .then((res: any) => {
        if (res.success && res.data) {
          setSupplement(res.data)
        } else {
          setError(res.error || "No se pudo obtener el suplemento.")
        }
      })
      .catch((err: any) => setError(err?.message || "Error de conexión"))
      .finally(() => setLoading(false))
  }, [supplementId])

  const handleDownload = async () => {
    if (!supplement) return
    try {
      // @ts-ignore
      await window.Electron.supplements.download(supplement.id)
    } catch (err: any) {
      alert("No se pudo descargar el suplemento.")
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 flex flex-col gap-8">
      <button
        className="flex items-center gap-2 text-[#018ABE] hover:underline text-sm w-fit mb-2"
        onClick={() => router.push(`/contracts/${contractId}/supplements`)}
      >
        <ArrowLeft size={18} /> Volver a suplementos
      </button>
      <Card>
        <CardHeader>
          <CardTitle>Detalle del Suplemento</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-[#757575]">Cargando suplemento...</div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : supplement ? (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-[#757575]">Fecha de creación:</span>
                <div className="font-medium">{new Date(supplement.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-xs text-[#757575]">Campo modificado:</span>
                <div className="font-medium">{supplement.field}</div>
              </div>
              <div>
                <span className="text-xs text-[#757575]">Valor anterior:</span>
                <div className="font-medium">{supplement.oldValue}</div>
              </div>
              <div>
                <span className="text-xs text-[#757575]">Nuevo valor:</span>
                <div className="font-medium">{supplement.newValue}</div>
              </div>
              <div>
                <span className="text-xs text-[#757575]">Descripción / Motivo:</span>
                <div className="font-medium">{supplement.description}</div>
              </div>
              {supplement.fileName && (
                <div className="flex items-center gap-2 mt-2">
                  <Button size="sm" variant="default" onClick={handleDownload}>
                    <FileDown size={16} className="mr-1" /> Descargar documento
                  </Button>
                  <span className="text-xs text-[#757575]">{supplement.fileName}</span>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
} 