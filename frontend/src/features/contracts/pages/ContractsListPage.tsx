import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { 
  IconPlus,
  IconSearch, 
  IconFilter, 
  IconArrowsSort 
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ContractsService, type Contract } from '../services/contracts-service'
import { ContractList } from '../components/ContractList'

/**
 * Página principal para mostrar la lista de contratos
 */
export const ContractsListPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  // Cargar contratos al montar el componente
  useEffect(() => {
    const loadContracts = async () => {
      setIsLoading(true)
      try {
        const response = await ContractsService.getContracts({
          search: searchTerm,
          page: 1,
          limit: 20
        })
        setContracts(response.data)
      } catch (error) {
        console.error('Error al cargar los contratos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadContracts()
  }, [searchTerm])
  
  // Manejar la búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // La búsqueda ya se ejecuta mediante el useEffect cuando cambia searchTerm
  }
  
  // Navegar a la página de crear contrato
  const handleCreateContract = () => {
    navigate({ to: '/_authenticated/contracts/create' })
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
          <CardTitle>Lista de contratos</CardTitle>
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
            <Button size="icon" variant="outline" title="Ordenar">
              <IconArrowsSort size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ContractList 
            contracts={contracts} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>
    </div>
  )
} 