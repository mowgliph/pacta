import axios from 'axios'
import { API_CONFIG } from '@/config/api'

export const apiClient = axios.create({
  baseURL: `${API_CONFIG.baseURL}/api/${API_CONFIG.version}`,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
})

apiClient.interceptors.request.use(
  (config) => {
    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error)
)