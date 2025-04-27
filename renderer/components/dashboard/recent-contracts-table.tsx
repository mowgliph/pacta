"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Eye, BarChart, ArrowUpRight } from "lucide-react"
import { useRouter } from "next/router"

interface Contract {
  id: string
  title: string
  parties: string
  status: "draft" | "pending_approval" | "active" | "expired" | "terminated" | "archived"
  date: string
  value?: string
}

interface RecentContractsTableProps {
  contracts: Contract[]
}

export function RecentContractsTable({ contracts }: RecentContractsTableProps) {
  const router = useRouter()

  const getStatusBadge = (status: Contract["status"]) => {
    const statusConfig = {
      draft: { label: "Borrador", className: "bg-gray-100 text-gray-800 border-gray-200" },
      pending_approval: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      active: { label: "Activo", className: "bg-green-100 text-green-800 border-green-200" },
      expired: { label: "Expirado", className: "bg-red-100 text-red-800 border-red-200" },
      terminated: { label: "Terminado", className: "bg-red-100 text-red-800 border-red-200" },
      archived: { label: "Archivado", className: "bg-blue-100 text-blue-800 border-blue-200" },
    }

    const config = statusConfig[status]
    return <Badge className={`${config.className} font-normal`}>{config.label}</Badge>
  }

  if (contracts.length === 0) {
    return (
      <Card className="shadow-sm border">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b pb-3">
          <CardTitle className="flex items-center text-lg">
            <BarChart className="h-5 w-5 mr-2 text-primary" />
            Contratos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-gray-500">
          <p>No hay contratos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border overflow-hidden">
      <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b pb-3">
        <CardTitle className="flex items-center text-lg">
          <BarChart className="h-5 w-5 mr-2 text-primary" />
          Contratos Recientes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-b-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contrato</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Partes</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider sr-only">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white dark:bg-gray-950">
              {contracts.map((contract) => (
                <tr 
                  key={contract.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white">
                    <div className="max-w-[200px] truncate" title={contract.title}>
                      {contract.title}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                    {contract.parties}
                  </td>
                  <td className="px-4 py-3.5 text-sm">
                    {getStatusBadge(contract.status)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                    {contract.date}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white">
                    {contract.value || "N/A"}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-primary"
                      onClick={() => router.push(`/contracts/${contract.id}`)}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="sr-only">Ver contrato</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
