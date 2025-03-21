import api from './api'
import type { LoginCredentials, LoginResponse, RefreshTokenResponse, ApiError, User, License, LicenseResponse } from '@/types/api'

class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { username, password })
      return response.data
    } catch (error: any) {
      if (error.status === 401) {
        if (error.message === 'Usuario no encontrado') {
          throw new Error('El usuario ingresado no existe en el sistema')
        } else if (error.message === 'Contraseña incorrecta') {
          throw new Error('La contraseña ingresada es incorrecta')
        } else {
          throw new Error('Credenciales inválidas')
        }
      } else if (error.status === 403) {
        throw new Error('Se requiere una licencia activa para acceder')
      } else if (error.status === 429) {
        throw new Error('Demasiados intentos fallidos. Por favor, inténtelo más tarde.')
      } else {
        throw new Error('Error de conexión con el servidor')
      }
    }
  }

  async activateLicense(licenseCode: string): Promise<LicenseResponse> {
    try {
      const response = await api.post<LicenseResponse>('/auth/activate-license', { licenseCode })
      return response.data
    } catch (error: any) {
      console.error('License activation error:', error)
      if (error.response?.status === 400) {
        throw new Error('Código de promoción inválido')
      }
      throw new Error('Error al activar la licencia')
    }
  }

  async checkLicenseStatus(): Promise<LicenseResponse> {
    try {
      const response = await api.get<LicenseResponse>('/auth/license-status')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('No se encontró una licencia activa')
      }
      throw new Error('Error al verificar el estado de la licencia')
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const response = await api.post<RefreshTokenResponse>('/auth/refresh-token')
      return response.data
    } catch (error) {
      console.error('Refresh token error:', error)
      throw error
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me')
      return response.data
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { oldPassword, newPassword })
  }

  async resetPassword(email: string): Promise<void> {
    await api.post('/auth/reset-password', { email })
  }

  async verifyResetToken(token: string): Promise<boolean> {
    try {
      await api.post('/auth/verify-reset-token', { token })
      return true
    } catch (error) {
      return false
    }
  }

  async validatePromoCode(code: string): Promise<{ valid: boolean; message?: string }> {
    try {
      const response = await api.post<{ valid: boolean; message?: string }>('/auth/validate-promo', { code })
      return response.data
    } catch (error: any) {
      console.error('Promo code validation error:', error)
      throw { response: { data: { message: 'Error al validar el código de promoción' } } }
    }
  }

  async uploadLicenseFile(formData: FormData): Promise<{ license: License; message: string }> {
    try {
      const response = await api.post('/api/upload-license', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('License file upload error:', error)
      if (error.response?.status === 400) {
        throw new Error('Archivo de licencia inválido o corrupto')
      } else if (error.response?.status === 415) {
        throw new Error('El tipo de archivo no es válido. Solo se permiten archivos .lic')
      }
      throw new Error('Error al procesar el archivo de licencia')
    }
  }
}

export const authService = new AuthService() 