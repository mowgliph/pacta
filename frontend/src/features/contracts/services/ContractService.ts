import { BaseService } from '@/lib/api/BaseService'
import { type Contract, type ContractFilters } from '../types'
import { type AxiosResponse } from 'axios'

class ContractService extends BaseService {
  constructor() {
    super('/contracts')
  }

  async getAll(filters?: ContractFilters): Promise<AxiosResponse<Contract[]>> {
    return this.get<Contract[]>('', { params: filters })
  }

  async getById(id: number): Promise<AxiosResponse<Contract>> {
    return this.get<Contract>(`/${id}`)
  }

  async create(data: Partial<Contract>): Promise<AxiosResponse<Contract>> {
    return this.post<Contract>('', data)
  }

  async update(id: number, data: Partial<Contract>): Promise<AxiosResponse<Contract>> {
    return this.put<Contract>(`/${id}`, data)
  }

  async updateStatus(id: number, status: Contract['status']): Promise<AxiosResponse<Contract>> {
    return this.patch<Contract>(`/${id}/status`, { status })
  }

  async deleteContract(id: number): Promise<AxiosResponse<void>> {
    return this.delete<void>(`/${id}`)
  }
}

export const contractService = new ContractService()