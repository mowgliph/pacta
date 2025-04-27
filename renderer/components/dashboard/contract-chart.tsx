import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface ContractsByStatusProps {
  data: {
    name: string
    value: number
    color: string
  }[]
}

export function ContractsByStatus({ data }: ContractsByStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contratos por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} contratos`, "Cantidad"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface ContractsByMonthProps {
  data: {
    month: string
    created: number
    expired: number
  }[]
}

export function ContractsByMonth({ data }: ContractsByMonthProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contratos por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="created" name="Creados" fill="#018ABE" />
              <Bar dataKey="expired" name="Expirados" fill="#97CADB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
