"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { DatePicker } from "../ui/date-picker"
import { Filter, X } from "lucide-react"

interface ContractFilterProps {
  onFilter: (filters: any) => void
}

export function ContractFilter({ onFilter }: ContractFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    startDateFrom: null as Date | null,
    startDateTo: null as Date | null,
    search: "",
  })

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const applyFilters = () => {
    onFilter(filters)
  }

  const resetFilters = () => {
    setFilters({
      status: "",
      startDateFrom: null,
      startDateTo: null,
      search: "",
    })
    onFilter({})
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Filtros</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos los estados" />
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

            <div className="space-y-2">
              <Label htmlFor="search">Búsqueda</Label>
              <Input
                id="search"
                placeholder="Buscar en título, descripción..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de inicio desde</Label>
              <DatePicker date={filters.startDateFrom} setDate={(date) => handleFilterChange("startDateFrom", date)} />
            </div>

            <div className="space-y-2">
              <Label>Fecha de inicio hasta</Label>
              <DatePicker date={filters.startDateTo} setDate={(date) => handleFilterChange("startDateTo", date)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={resetFilters}>
              Limpiar
            </Button>
            <Button onClick={applyFilters}>Aplicar Filtros</Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
