import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from '@remix-run/react'
import { 
  IconPlus,
  IconSearch, 
  IconFilter, 
  IconArrowsSort,
  IconRefresh
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ContractList } from '../components/ContractList'
import { useSearchContracts } from '../hooks/useContracts'
import type { ContractSearchParams } from '../services/contracts-service'

/**
 * Página principal para mostrar la lista de contratos
 */
export const ContractsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchParams, setSearchParams] = useState<ContractSearchParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  
  // Usar SWR para obtener los contratos
  const { 
    contracts, 
    pagination, 
    isLoading, 
    error, 
    mutate: refreshContracts 
  } = useSearchContracts(searchTerm, searchParams)
  
  // Manejar la búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // La búsqueda ya se ejecuta automáticamente cuando cambia searchTerm
  }
  
  // Manejar el cambio de página
  const handlePageChange = useCallback((newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }))
  }, [])
  
  // Manejar el ordenamiento
  const handleSort = useCallback((field: string) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }, [])
  
  // Navegar a la página de crear contrato
  const handleCreateContract = () => {
    navigate('/contracts/create')
  }
  
  // Refrescar los datos manualmente
  const handleRefresh = () => {
    refreshContracts()
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contratos</h1>
        <Button 
          onClick={handleCreateContract} 
          className="gap-2"
        >
          <IconPlus size={16} />
          <span>Nuevo contrato</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de contratos</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <IconRefresh size={16} className={isLoading ? 'animate-spin' : ''} />
              <span className="ml-2">Actualizar</span>
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative w-full">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  type="search"
                  placeholder="Buscar contratos..." 
                  className="w-full pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            <Button size="icon" variant="outline" title="Filtrar resultados">
              <IconFilter size={16} />
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              title="Ordenar por fecha" 
              onClick={() => handleSort('createdAt')}
            >
              <IconArrowsSort size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ContractList 
            contracts={contracts} 
            isLoading={isLoading} 
            error={error ? 'Error al cargar los contratos' : undefined}
            onRefresh={handleRefresh}
          />
          
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
              >
                Anterior
              </Button>
              <span>
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 