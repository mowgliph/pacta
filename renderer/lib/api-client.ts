import { z } from 'zod';

/**
 * Tipos para las respuestas de la API
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Cliente de API modular para reemplazar axios, usando la comunicación IPC con Electron
 */
class ApiClient {
  /**
   * Realiza una petición GET a través de Electron IPC
   * @param endpoint - Endpoint de la API
   * @param params - Parámetros de consulta (opcional)
   * @returns Promesa con los datos de respuesta
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await window.Electron.api.request({
        method: 'GET',
        endpoint,
        params
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Realiza una petición POST a través de Electron IPC
   * @param endpoint - Endpoint de la API
   * @param data - Datos a enviar
   * @returns Promesa con los datos de respuesta
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await window.Electron.api.request({
        method: 'POST',
        endpoint,
        data
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Realiza una petición PUT a través de Electron IPC
   * @param endpoint - Endpoint de la API
   * @param data - Datos a enviar
   * @returns Promesa con los datos de respuesta
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await window.Electron.api.request({
        method: 'PUT',
        endpoint,
        data
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Realiza una petición PATCH a través de Electron IPC
   * @param endpoint - Endpoint de la API
   * @param data - Datos a enviar
   * @returns Promesa con los datos de respuesta
   */
  async patch<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await window.Electron.api.request({
        method: 'PATCH',
        endpoint,
        data
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Realiza una petición DELETE a través de Electron IPC
   * @param endpoint - Endpoint de la API
   * @param params - Parámetros opcionales
   * @returns Promesa con los datos de respuesta
   */
  async delete<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await window.Electron.api.request({
        method: 'DELETE',
        endpoint,
        params
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Maneja la respuesta de la API
   * @param response - Respuesta de la API
   * @returns Datos de la respuesta
   */
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'Error en la petición');
    }
    
    return response.data;
  }

  /**
   * Maneja errores de la API
   * @param error - Error ocurrido
   * @throws Error - Relanza el error con mensaje más descriptivo
   */
  private handleError<T>(error: any): never {
    console.error('Error en la petición API:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error desconocido en la comunicación con la API');
  }
}

// Exportar una instancia única
const apiClient = new ApiClient();
export default apiClient; 