import { useState } from 'react'
import apiClient from '../lib/api-client'
import { toast } from 'sonner'

// Tipos
export interface Contract {
  id: string
  number: string
  company: string
  type: 'CLIENT' | 'PROVIDER'
  startDate: string
  endDate: string
  amount: number
  description: string
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export interface ContractFilters {
  status?: string
  type?: string
  search?: string
}

export interface ContractStats {
  active: number
  pending: number
  expired: number
  archived: number
  total: number
}

/**
 * Hook para la gestión de contratos
 */
export function useContracts() {
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Obtiene la lista de contratos con filtros opcionales
   */
  const getContracts = async (filters?: ContractFilters): Promise<Contract[]> => {
    setIsLoading(true)
    try {
      const data = await apiClient.get<Contract[]>('/api/contracts', filters)
      return data
    } catch (error) {
      toast.error('Error al cargar los contratos')
      console.error(error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Obtiene un contrato por su ID
   */
  const getContractById = async (id: string): Promise<Contract | null> => {
    setIsLoading(true)
    try {
      const data = await apiClient.get<Contract>(`/api/contracts/${id}`)
      return data
    } catch (error) {
      toast.error('Error al cargar el contrato')
      console.error(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Crea un nuevo contrato
   */
  const createContract = async (newContract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract | null> => {
    setIsLoading(true)
    try {
      const data = await apiClient.post<Contract>('/api/contracts', newContract)
      toast.success('Contrato creado correctamente')
      return data
    } catch (error) {
      toast.error('Error al crear el contrato')
      console.error(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Actualiza el estado de un contrato
   */
  const updateContractStatus = async (id: string, status: Contract['status']): Promise<Contract | null> => {
    setIsLoading(true)
    try {
      const data = await apiClient.patch<Contract>(`/api/contracts/${id}/status`, { status })
      
      const statusMessages = {
        ACTIVE: 'activado',
        PENDING: 'puesto en revisión',
        EXPIRED: 'marcado como vencido',
        ARCHIVED: 'archivado'
      }
      
      toast.success(`Contrato ${statusMessages[status]} correctamente`)
      return data
    } catch (error) {
      toast.error('Error al actualizar el estado del contrato')
      console.error(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Obtiene estadísticas de contratos
   */
  const getContractStats = async (): Promise<ContractStats | null> => {
    setIsLoading(true)
    try {
      const data = await apiClient.get<ContractStats>('/api/contracts/stats')
      return data
    } catch (error) {
      toast.error('Error al cargar las estadísticas')
      console.error(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    getContracts,
    getContractById,
    createContract,
    updateContractStatus,
    getContractStats
  }
}