"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { useContractDetail } from "../../../lib/useContractDetail"
import { useParams } from "next/navigation"
import { FileText, PlusCircle, Archive, ArrowLeft } from "lucide-react"
import { useAuth } from "../../../store/auth"
import { Alert, AlertTitle, AlertDescription } from "../../../components/ui/alert"

// @ts-ignore
// Asegurar tipado correcto para window.Electron
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: Window & typeof globalThis;

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Vigente"
      ? "bg-[#D6E8EE] text-[#018ABE]"
      : status === "Vencido"
      ? "bg-[#F44336]/10 text-[#F44336]"
      : status === "Próximo a Vencer"
      ? "bg-[#FF9800]/10 text-[#FF9800]"
      : "bg-[#F5F5F5] text-[#757575]"
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>
  )
}

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { contract, supplements, loading, error } = useContractDetail(id)
  const router = useRouter()
  const { user } = useAuth()

  const handleArchive = async () => {
    if (!contract) return
    try {
      // @ts-ignore
      await window.Electron.contracts.archive(contract.id)
      // @ts-ignore
      await window.Electron.notifications.show({ title: "Contrato archivado", body: "El contrato fue archivado correctamente." })
      router.push("/contracts")
    } catch (err) {
      // @ts-ignore
      await window.Electron.notifications.show({ title: "Error", body: "No se pudo archivar el contrato." })
    }
  }

  const handleExport = async () => {
    if (!contract) return
    if (!user) {
      router.push("/login")
      return
    }
    try {
      // @ts-ignore
      await window.Electron.contracts.export(contract.id)
      // @ts-ignore
      await window.Electron.notifications.show({ title: "Contrato exportado", body: "El contrato fue exportado como PDF." })
    } catch (err) {
      // @ts-ignore
      await window.Electron.notifications.show({ title: "Error", body: "No se pudo exportar el contrato." })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <button
        className="flex items-center gap-2 text-[#018ABE] hover:underline text-sm w-fit"
        onClick={() => router.push("/contracts")}
      >
        <ArrowLeft size={18} /> Volver a contratos
      </button>

      {loading ? (
        <div className="text-[#757575]">Cargando contrato...</div>
      ) : error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error al cargar contrato</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : contract ? (
        <>
          {/* Información principal */}
          <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-wrap items-center gap-6 justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[#001B48] font-inter mb-1">
                  Contrato {contract.number}
                </h1>
                <div className="text-[#757575] text-sm mb-1">{contract.company}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium">Tipo:</span> {contract.type}
                  <span className="font-medium ml-4">Estado:</span> <StatusBadge status={contract.status} />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#018ABE] text-white hover:bg-[#02457A] text-sm font-medium shadow-sm"
                  onClick={() => router.push(`/contracts/${contract.id}/supplements/new`)}
                >
                  <PlusCircle size={18} /> Agregar Suplemento
                </button>
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#757575] text-white hover:bg-[#333] text-sm font-medium shadow-sm"
                  onClick={handleArchive}
                >
                  <Archive size={18} /> Archivar
                </button>
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#D6E8EE] text-[#018ABE] hover:bg-[#97CADB] text-sm font-medium shadow-sm"
                  onClick={handleExport}
                >
                  <FileText size={18} /> Exportar PDF
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-xs text-[#757575] mb-1">Fecha de inicio</div>
                <div className="font-medium">{new Date(contract.startDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-[#757575] mb-1">Fecha de fin</div>
                <div className="font-medium">{new Date(contract.endDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-[#757575] mb-1">Monto</div>
                <div className="font-medium">{contract.amount.toLocaleString("es-ES", { style: "currency", currency: "USD" })}</div>
              </div>
              <div>
                <div className="text-xs text-[#757575] mb-1">Descripción</div>
                <div className="font-medium">{contract.description}</div>
              </div>
            </div>
          </section>

          {/* Historial de suplementos */}
          <section className="bg-white rounded-xl shadow p-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-[#001B48] font-inter mb-4">Historial de suplementos</h2>
            {supplements.length === 0 ? (
              <div className="text-[#757575]">No hay suplementos registrados para este contrato.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[#D6E8EE] text-[#001B48]">
                      <th className="px-4 py-2 text-left font-medium">Fecha</th>
                      <th className="px-4 py-2 text-left font-medium">Campo</th>
                      <th className="px-4 py-2 text-left font-medium">Valor anterior</th>
                      <th className="px-4 py-2 text-left font-medium">Nuevo valor</th>
                      <th className="px-4 py-2 text-left font-medium">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplements.map(s => (
                      <tr key={s.id} className="even:bg-[#F9FBFC] hover:bg-[#D6E8EE] transition-colors">
                        <td className="px-4 py-2">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{s.field}</td>
                        <td className="px-4 py-2">{s.oldValue}</td>
                        <td className="px-4 py-2">{s.newValue}</td>
                        <td className="px-4 py-2">{s.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  )
} 