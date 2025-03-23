import api from './api'
import type { User } from '@/types/api'

export interface UserCreateData {
  username: string
  email: string
  password: string
  role: 'admin' | 'advanced' | 'readonly'
}

export interface UserUpdateData {
  username?: string
  email?: string
  password?: string
  role?: 'admin' | 'advanced' | 'readonly'
  active?: boolean
}

export interface UserResponse {
  message: string
  user: User
}

export interface UsersListResponse {
  users: User[]
}

class UserService {
  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/protected/users')
      return response.data
    } catch (error: any) {
      console.error('Error fetching users:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios')
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await api.get<User>(`/protected/users/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching user ${id}:`, error)
      throw new Error(error.response?.data?.message || 'Error al obtener usuario')
    }
  }

  async createUser(userData: UserCreateData): Promise<UserResponse> {
    try {
      const response = await api.post<UserResponse>('/protected/users', userData)
      return response.data
    } catch (error: any) {
      console.error('Error creating user:', error)
      throw new Error(error.response?.data?.message || 'Error al crear usuario')
    }
  }

  async updateUser(id: number, userData: UserUpdateData): Promise<UserResponse> {
    try {
      const response = await api.put<UserResponse>(`/protected/users/${id}`, userData)
      return response.data
    } catch (error: any) {
      console.error(`Error updating user ${id}:`, error)
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario')
    }
  }

  async deleteUser(id: number): Promise<{ message: string, userId: number }> {
    try {
      const response = await api.delete<{ message: string, userId: number }>(`/protected/users/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error deleting user ${id}:`, error)
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario')
    }
  }
}

export const userService = new UserService() 