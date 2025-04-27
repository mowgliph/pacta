"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Chart, registerables } from "chart.js"

// Registrar componentes de Chart.js
Chart.register(...registerables)

interface ContractStatusChartProps {
  contracts: any[]
}

export function ContractStatusChart({ contracts }: ContractStatusChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Limpiar instancia anterior
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Calcular datos
    const statusCounts = {
      Vigente: 0,
      "Próximo a Vencer": 0,
      Vencido: 0,
      Archivado: 0,
    }

    contracts.forEach((contract) => {
      const status = contract.status
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++
      }
    })

    // Crear gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: Object.keys(statusCounts),
          datasets: [
            {
              data: Object.values(statusCounts),
              backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#6b7280"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
            },
            title: {
              display: false,
            },
          },
          cutout: "60%",
        },
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [contracts])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contratos por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          {contracts.length === 0 ? (
            <p className="text-gray-500">No hay datos disponibles</p>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
