import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.service';
import type { User, LoginResponse, LicenseResponse } from '@/types/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<LoginResponse['user'] | null>(
    JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null')
  );
  const license = ref<LoginResponse['license'] | null>(
    JSON.parse(localStorage.getItem('license') || sessionStorage.getItem('license') || 'null')
  );
  const token = ref<string | null>(
    localStorage.getItem('token') || sessionStorage.getItem('token')
  );
  const errors = ref<string[]>([]);
  const successMessage = ref<string | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !isTokenExpired.value);
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
    
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('license', JSON.stringify(data.license));
    localStorage.setItem('token', data.token);
  }

  function setLicenseData(data: LicenseResponse) {
    license.value = data.license;
    errors.value = [];
    
    localStorage.setItem('license', JSON.stringify(data.license));
  }

  function clearAuthData() {
    user.value = null;
    license.value = null;
    token.value = null;
    errors.value = [];
    
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('license');
    localStorage.removeItem('token');
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('license');
    sessionStorage.removeItem('token');
  }

  function setMessage(message: string) {
    successMessage.value = message;
    // Limpiar el mensaje después de 5 segundos
    setTimeout(() => {
      successMessage.value = null;
    }, 5000);
  }

  async function login(username: string, password: string, remember: boolean = false): Promise<boolean> {
    loading.value = true;
    errors.value = [];
    
    try {
      const data = await authService.login(username, password);
      setAuthData(data);
      
      if (!remember) {
        localStorage.removeItem('user');
        localStorage.removeItem('license');
        localStorage.removeItem('token');
        
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('license', JSON.stringify(data.license));
        sessionStorage.setItem('token', data.token);
      }
      
      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      errors.value = [errorMessage];
      
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
    if (!token.value) return false;
    
    if (isTokenExpired.value) {
      const success = await refreshToken();
      if (!success) {
        clearAuthData();
        return false;
      }
    }

    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        // Asegurarnos de que el objeto usuario contiene todos los campos necesarios
        user.value = {
          id: currentUser.id,
          username: currentUser.username,
          role: currentUser.role,
          email: currentUser.email || '',
          active: currentUser.active !== undefined ? currentUser.active : true
        };
        localStorage.setItem('user', JSON.stringify(user.value));
      }
      return true;
    } catch (error) {
      clearAuthData();
      return false;
    }
  }

  return {
    user,
    license,
    token,
    errors,
    successMessage,
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
    setMessage,
    clearErrors: () => errors.value = []
  };
});