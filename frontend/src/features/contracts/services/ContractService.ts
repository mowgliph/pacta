import { BaseService } from '@/lib/api/BaseService'
import { Contract } from '../types'
import { AxiosResponse } from 'axios'

class ContractService extends BaseService {
  constructor() {
    super('/contracts')
  }

  async getAll(): Promise<AxiosResponse<Contract[]>> {
    return this.get<Contract[]>()
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

  async deleteContract(id: number): Promise<AxiosResponse<void>> {
    return this.delete<void>(`/${id}`)
  }
}

export const contractService = new ContractService()