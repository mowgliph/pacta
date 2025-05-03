import { Bar, Pie, Line } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

interface ChartProps {
  data: any
  options?: any
  className?: string
}

export function BarChart({ data, options, className }: ChartProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className || ''}`} aria-label="Gráfico de barras">
      <Bar data={data} options={options} />
    </div>
  )
}

export function PieChart({ data, options, className }: ChartProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className || ''}`} aria-label="Gráfico de pastel">
      <Pie data={data} options={options} />
    </div>
  )
}

export function LineChart({ data, options, className }: ChartProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className || ''}`} aria-label="Gráfico de líneas">
      <Line data={data} options={options} />
    </div>
  )
} 