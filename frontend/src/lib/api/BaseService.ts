import { apiClient } from './client'

export class BaseService {
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  protected async get<T>(path = '', params = {}) {
    return apiClient.get<T>(`${this.endpoint}${path}`, { params })
  }

  protected async post<T>(path = '', data = {}) {
    return apiClient.post<T>(`${this.endpoint}${path}`, data)
  }

  protected async put<T>(path = '', data = {}) {
    return apiClient.put<T>(`${this.endpoint}${path}`, data)
  }

  protected async delete<T>(path = '') {
    return apiClient.delete<T>(`${this.endpoint}${path}`)
  }

  protected async patch<T>(path = '', data = {}) {
    return apiClient.patch<T>(`${this.endpoint}${path}`, data)
  }
}