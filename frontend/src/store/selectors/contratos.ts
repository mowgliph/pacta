import { useStore } from '../index'
import { Contract, ContractFilters } from '@/features/contracts/types'

export const useContratosFiltrados = () => {
  return useStore((state) => {
    const { contratos, filtros } = state as { contratos: Contract[], filtros: ContractFilters }
    return contratos.filter((contrato: Contract) => {
      if (filtros.status && contrato.status !== filtros.status) {
        return false
      }
      
      // Check search term
      if (filtros.query) {
        const searchTerm = filtros.query.toLowerCase()
        const matchesSearch = 
          contrato.title.toLowerCase().includes(searchTerm) ||
          contrato.contractNumber.toLowerCase().includes(searchTerm)
        if (!matchesSearch) return false
      }
      
      // Check date range
      const startDateFrom = filtros.startDateFrom ? new Date(filtros.startDateFrom) : null
      const endDateTo = filtros.endDateTo ? new Date(filtros.endDateTo) : null
      
      if (startDateFrom && new Date(contrato.startDate) < startDateFrom) {
        return false
      }
      
      if (endDateTo && new Date(contrato.endDate) > endDateTo) {
        return false
      }
      
      return true
    })
  })
}

export const useContratosVencidos = () => {
  return useStore((state) => {
    const { contratos } = state
    return contratos.filter((contrato: Contract) => 
      new Date(contrato.endDate) < new Date()
    )
  })
}