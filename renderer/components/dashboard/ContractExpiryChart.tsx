"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import type { Contract } from "../../types"

interface ContractExpiryChartProps {
  contracts: Contract[]
}

export function ContractExpiryChart({ contracts }: ContractExpiryChartProps) {
  const data = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(now.getMonth() + i)
      return {
        month: date.toLocaleString("default", { month: "short" }),
        year: date.getFullYear(),
        date,
        count: 0,
      }
    })

    // Count contracts expiring in each month
    contracts.forEach((contract) => {
      const endDate = new Date(contract.endDate)

      months.forEach((month) => {
        if (endDate.getMonth() === month.date.getMonth() && endDate.getFullYear() === month.date.getFullYear()) {
          month.count++
        }
      })
    })

    return months.map(({ month, year, count }) => ({
      name: `${month} ${year}`,
      count,
    }))
  }, [contracts])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Contract Expirations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} contracts`, "Expiring"]} />
              <Legend />
              <Bar dataKey="count" name="Expiring Contracts" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
