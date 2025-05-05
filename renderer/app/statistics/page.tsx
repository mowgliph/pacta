"use client"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { BarChart2, TrendingUp, FileText } from "lucide-react"
import { BarChart, PieChart, LineChart } from "../../components/charts/charts"
import { useStatistics } from "../../lib/useStatistics"
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert"

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
  const { data, loading, error } = useStatistics();

  // Mapeo seguro de datos
  const total = data?.stats?.byStatus?.reduce((acc: number, s: any) => acc + (s._count?._all || 0), 0) || 0
  const active = data?.stats?.byStatus?.find((s: any) => s.status === "Vigente")?._count?._all || 0
  const expiring = data?.stats?.byStatus?.find((s: any) => s.status === "Próximo a Vencer")?._count?._all || 0
  const expired = data?.stats?.byStatus?.find((s: any) => s.status === "Vencido")?._count?._all || 0
  const byType = data?.stats?.byType?.reduce((acc: any, t: any) => ({ ...acc, [t.type]: t._count._all }), {}) || {}

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-[#001B48] font-inter mb-2">Estadísticas</h1>
      {loading ? (
        <div className="text-[#757575]">Cargando estadísticas...</div>
      ) : error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error al cargar estadísticas</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
          {/* Gráficos y métricas avanzadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribución por tipo de contrato (Bar) */}
            {data?.stats?.byType && Object.keys(byType).length > 0 ? (
              <BarChart
                data={{
                  labels: Object.keys(byType),
                  datasets: [
                    {
                      label: "Contratos por tipo",
                      data: Object.values(byType),
                      backgroundColor: ["#018ABE", "#97CADB"],
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: "Distribución por tipo de contrato", color: "#001B48", font: { size: 18, weight: "bold" } },
                  },
                  scales: {
                    x: { ticks: { color: "#001B48", font: { family: "Inter" } } },
                    y: { beginAtZero: true, ticks: { color: "#001B48", font: { family: "Inter" } } },
                  },
                }}
                className="h-64"
              />
            ) : (
              <ChartPlaceholder title="Distribución por tipo de contrato" />
            )}
            {/* Distribución por moneda (Pie) */}
            {data?.byCurrency && data.byCurrency.length > 0 ? (
              <PieChart
                data={{
                  labels: data.byCurrency.map((c: any) => c.currency || "Sin especificar"),
                  datasets: [
                    {
                      label: "Contratos por moneda",
                      data: data.byCurrency.map((c: any) => c._count._all),
                      backgroundColor: ["#018ABE", "#97CADB", "#D6E8EE", "#FF9800"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom", labels: { color: "#001B48", font: { family: "Inter" } } },
                    title: { display: true, text: "Distribución por moneda", color: "#001B48", font: { size: 18, weight: "bold" } },
                  },
                }}
                className="h-64"
              />
            ) : (
              <ChartPlaceholder title="Distribución por moneda" />
            )}
            {/* Evolución mensual de contratos creados (Line) */}
            {data?.contractsCreated && data.contractsCreated.length > 0 ? (
              <LineChart
                data={{
                  labels: data.contractsCreated.map((m: any) => m.month),
                  datasets: [
                    {
                      label: "Contratos creados",
                      data: data.contractsCreated.map((m: any) => m.count),
                      borderColor: "#018ABE",
                      backgroundColor: "#97CADB",
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: "Evolución mensual de contratos", color: "#001B48", font: { size: 18, weight: "bold" } },
                  },
                  scales: {
                    x: { ticks: { color: "#001B48", font: { family: "Inter" } } },
                    y: { beginAtZero: true, ticks: { color: "#001B48", font: { family: "Inter" } } },
                  },
                }}
                className="h-64"
              />
            ) : (
              <ChartPlaceholder title="Evolución mensual de contratos" />
            )}
            {/* Contratos vencidos por mes (Line) */}
            {data?.contractsExpired && data.contractsExpired.length > 0 ? (
              <LineChart
                data={{
                  labels: data.contractsExpired.map((m: any) => m.month),
                  datasets: [
                    {
                      label: "Contratos vencidos",
                      data: data.contractsExpired.map((m: any) => m.count),
                      borderColor: "#F44336",
                      backgroundColor: "#F4433622",
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: "Contratos vencidos por mes", color: "#001B48", font: { size: 18, weight: "bold" } },
                  },
                  scales: {
                    x: { ticks: { color: "#001B48", font: { family: "Inter" } } },
                    y: { beginAtZero: true, ticks: { color: "#001B48", font: { family: "Inter" } } },
                  },
                }}
                className="h-64"
              />
            ) : (
              <ChartPlaceholder title="Contratos vencidos por mes" />
            )}
          </div>
          {/* Tablas informativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contratos por usuario */}
            <Card>
              <CardHeader>
                <CardTitle>Contratos por usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-[#D6E8EE] text-[#001B48]">
                        <th className="px-4 py-2 text-left font-medium">Usuario</th>
                        <th className="px-4 py-2 text-left font-medium">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.byUser?.map((u: any) => (
                        <tr key={u.ownerId} className="even:bg-[#F9FBFC] hover:bg-[#D6E8EE] transition-colors">
                          <td className="px-4 py-2">{u.ownerId || "Sin asignar"}</td>
                          <td className="px-4 py-2">{u._count._all}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            {/* Suplementos por contrato */}
            <Card>
              <CardHeader>
                <CardTitle>Suplementos por contrato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-[#D6E8EE] text-[#001B48]">
                        <th className="px-4 py-2 text-left font-medium">Contrato</th>
                        <th className="px-4 py-2 text-left font-medium">Suplementos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.supplementsByContract?.map((s: any) => (
                        <tr key={s.contractId} className="even:bg-[#F9FBFC] hover:bg-[#D6E8EE] transition-colors">
                          <td className="px-4 py-2">{s.contractId}</td>
                          <td className="px-4 py-2">{s._count._all}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
} 