"use client"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { BarChart2, TrendingUp, FileText } from "lucide-react"

// Placeholder para gráfico (puedes reemplazar por Recharts u otro)
function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="bg-[#F5F5F5] rounded-lg h-56 flex flex-col items-center justify-center border border-[#D6E8EE]">
      <span className="text-[#757575] text-sm mb-2">{title}</span>
      <div className="w-24 h-24 bg-[#D6E8EE] rounded-full flex items-center justify-center">
        <BarChart2 size={48} className="text-[#018ABE]" />
      </div>
      <span className="text-xs text-[#757575] mt-2">(Gráfico próximamente)</span>
    </div>
  )
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    window.Electron.statistics.contracts()
      .then((res: any) => {
        setStats(res)
      })
      .catch((err: any) => setError(err?.message || "Error de conexión"))
      .finally(() => setLoading(false))
  }, [])

  // Mapeo seguro de datos
  const total = stats?.byStatus?.reduce((acc: number, s: any) => acc + (s._count?._all || 0), 0) || 0
  const active = stats?.byStatus?.find((s: any) => s.status === "Vigente")?._count?._all || 0
  const expiring = stats?.byStatus?.find((s: any) => s.status === "Próximo a Vencer")?._count?._all || 0
  const expired = stats?.byStatus?.find((s: any) => s.status === "Vencido")?._count?._all || 0
  const byType = stats?.byType?.reduce((acc: any, t: any) => ({ ...acc, [t.type]: t._count._all }), {}) || {}

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-[#001B48] font-inter mb-2">Estadísticas</h1>
      {loading ? (
        <div className="text-[#757575]">Cargando estadísticas...</div>
      ) : error ? (
        <div className="text-[#F44336]">{error}</div>
      ) : (
        <>
          {/* Cards resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Contratos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-3xl font-bold text-[#018ABE]">
                  <FileText size={28} /> {total}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Vigentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-3xl font-bold text-[#4CAF50]">
                  <TrendingUp size={28} /> {active}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Próximos a Vencer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-3xl font-bold text-[#FF9800]">
                  <BarChart2 size={28} /> {expiring}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Vencidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-3xl font-bold text-[#F44336]">
                  <BarChart2 size={28} /> {expired}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartPlaceholder title="Distribución por tipo de contrato" />
            <ChartPlaceholder title="Evolución mensual de contratos" />
          </div>
          {/* Tabla de contratos destacados (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Contratos destacados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[#D6E8EE] text-[#001B48]">
                      <th className="px-4 py-2 text-left font-medium">Estado</th>
                      <th className="px-4 py-2 text-left font-medium">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.byStatus?.map((s: any) => (
                      <tr key={s.status} className="even:bg-[#F9FBFC] hover:bg-[#D6E8EE] transition-colors">
                        <td className="px-4 py-2">{s.status}</td>
                        <td className="px-4 py-2">{s._count._all}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 