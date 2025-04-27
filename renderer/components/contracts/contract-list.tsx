"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { format } from "date-fns"
import { useContracts } from "../../hooks/useContracts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { LoadingSpinner } from "../ui/loading-spinner"
import { Plus, Search, Filter, FileText, Calendar, FileEdit } from "lucide-react"

export function ContractList() {
  const { contracts, isLoading, error, fetchContracts } = useContracts()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"title" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const router = useRouter()

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  // Filter and sort contracts
  const filteredContracts = contracts
    .filter((contract) => {
      // Filter by search term
      const matchesSearch =
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false

      // Filter by status
      const matchesStatus = statusFilter === "all" || contract.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === "title") {
        return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      } else {
        // Sort by date
        const dateA = new Date(sortOrder === "asc" ? a.startDate : a.endDate || a.startDate).getTime()
        const dateB = new Date(sortOrder === "asc" ? b.startDate : b.endDate || b.startDate).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      }
    })

  const toggleSort = (field: "title" | "date") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case "terminated":
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>
      case "archived":
        return <Badge className="bg-blue-100 text-blue-800">Archived</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contratos</h2>
        <Button onClick={() => router.push("/contracts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Contrato
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar contratos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por estado" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="expired">Expirados</SelectItem>
              <SelectItem value="terminated">Terminados</SelectItem>
              <SelectItem value="archived">Archivados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No se encontraron contratos</p>
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <Card
              key={contract.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/contracts/${contract.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{contract.title}</CardTitle>
                  {getStatusBadge(contract.status)}
                </div>
                <div className="text-sm text-gray-500">{contract.contractNumber}</div>
                {contract.description && <div className="line-clamp-2 text-sm mt-1">{contract.description}</div>}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Inicio:
                    </span>
                    <span>{formatDate(contract.startDate)}</span>
                  </div>
                  {contract.endDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Fin:
                      </span>
                      <span>{formatDate(contract.endDate)}</span>
                    </div>
                  )}
                  {contract._count?.supplements > 0 && (
                    <div className="flex items-center text-blue-600 mt-2">
                      <FileEdit className="h-4 w-4 mr-1" />
                      <span>{contract._count.supplements} suplemento(s)</span>
                    </div>
                  )}
                  {contract._count?.documents > 0 && (
                    <div className="flex items-center text-blue-600 mt-2">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{contract._count.documents} documento(s)</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
