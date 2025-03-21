import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.service';
import type { User, LoginResponse, LicenseResponse } from '@/types/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<LoginResponse['user'] | null>(null);
  const license = ref<LoginResponse['license'] | null>(null);
  const token = ref<string | null>(null);
  const errors = ref<string[]>([]);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const hasActiveLicense = computed(() => !!license.value);
  const isTokenExpired = computed(() => {
    if (!token.value) return true;
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  });

  function setAuthData(data: LoginResponse) {
    user.value = data.user;
    license.value = data.license;
    token.value = data.token;
    errors.value = [];
  }

  function setLicenseData(data: LicenseResponse) {
    license.value = data.license;
    errors.value = [];
  }

  function clearAuthData() {
    user.value = null;
    license.value = null;
    token.value = null;
    errors.value = [];
  }

  async function login(username: string, password: string): Promise<boolean> {
    loading.value = true;
    errors.value = [];
    
    try {
      const data = await authService.login(username, password);
      setAuthData(data);
      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      errors.value = [errorMessage];
      
      // Propagar el error para que el componente pueda manejarlo específicamente
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function activateLicense(licenseCode: string) {
    try {
      loading.value = true;
      errors.value = [];
      const response = await authService.activateLicense(licenseCode);
      setLicenseData(response);
      return true;
    } catch (error: any) {
      errors.value = [error.message];
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function checkLicenseStatus() {
    try {
      loading.value = true;
      errors.value = [];
      const response = await authService.checkLicenseStatus();
      setLicenseData(response);
      return true;
    } catch (error: any) {
      errors.value = [error.message];
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      loading.value = true;
      await authService.logout();
      clearAuthData();
      return true;
    } catch (error: any) {
      errors.value = [error.message];
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function refreshToken() {
    try {
      const response = await authService.refreshToken();
      if (response.token) {
        token.value = response.token;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async function checkAuth() {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return false;

    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        user.value = {
          id: currentUser.id,
          username: currentUser.username,
          role: currentUser.role
        };
        token.value = storedToken;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  return {
    user,
    license,
    token,
    errors,
    loading,
    isAuthenticated,
    isAdmin,
    hasActiveLicense,
    isTokenExpired,
    login,
    logout,
    refreshToken,
    checkAuth,
    activateLicense,
    checkLicenseStatus,
    clearErrors: () => errors.value = []
  };
});