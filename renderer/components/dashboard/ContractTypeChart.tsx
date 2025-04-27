"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Chart, registerables } from "chart.js"

// Registrar componentes de Chart.js
Chart.register(...registerables)

interface ContractTypeChartProps {
  contracts: any[]
}

export function ContractTypeChart({ contracts }: ContractTypeChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Limpiar instancia anterior
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Calcular datos
    const typeCounts = {
      Cliente: 0,
      Proveedor: 0,
    }

    contracts.forEach((contract) => {
      const type = contract.type
      if (type in typeCounts) {
        typeCounts[type as keyof typeof typeCounts]++
      }
    })

    // Crear gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: Object.keys(typeCounts),
          datasets: [
            {
              data: Object.values(typeCounts),
              backgroundColor: ["#8b5cf6", "#3b82f6"],
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
        <CardTitle>Contratos por Tipo</CardTitle>
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
