import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  active: boolean;
  lastLoginAt: string | null;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null
  }),

  getters: {
    activeUsers: (state) => state.users.filter(u => u.active),
    adminUsers: (state) => state.users.filter(u => u.role === 'admin'),
    isAdmin: (state) => state.currentUser?.role === 'admin'
  },

  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/api/users');
        this.users = response.data;
      } catch (error) {
        this.error = 'Error fetching users';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createUser(userData: Partial<User>) {
      try {
        const response = await axios.post('/api/users', userData);
        this.users.push(response.data);
        return response.data;
      } catch (error) {
        this.error = 'Error creating user';
        throw error;
      }
    },

    async updateUser(id: number, userData: Partial<User>) {
      try {
        const response = await axios.put(`/api/users/${id}`, userData);
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.users[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = 'Error updating user';
        throw error;
      }
    },

    async deleteUser(id: number) {
      try {
        await axios.delete(`/api/users/${id}`);
        this.users = this.users.filter(u => u.id !== id);
      } catch (error) {
        this.error = 'Error deleting user';
        throw error;
      }
    },

    async getCurrentUser() {
      try {
        const response = await axios.get('/api/users/me');
        this.currentUser = response.data;
        return response.data;
      } catch (error) {
        this.error = 'Error fetching current user';
        throw error;
      }
    },

    async updateProfile(userData: Partial<User>) {
      try {
        const response = await axios.put('/api/users/profile', userData);
        this.currentUser = response.data;
        return response.data;
      } catch (error) {
        this.error = 'Error updating profile';
        throw error;
      }
    },

    async changePassword(oldPassword: string, newPassword: string) {
      try {
        await axios.put('/api/users/change-password', {
          oldPassword,
          newPassword
        });
      } catch (error) {
        this.error = 'Error changing password';
        throw error;
      }
    }
  }
});