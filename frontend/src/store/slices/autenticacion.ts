import { StateCreator } from 'zustand'
import { apiClient } from '@/lib/api/client'
import { Role, UserStatus } from '@/types/enums'; 

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isSystemUser: boolean;
  status?: UserStatus; // Opcional, puede venir del backend
  profileImage?: string;
  lastLogin?: string; // O Date si se prefiere
}

export interface SliceAutenticacion {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  verifySession: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
  hasRole: (role: Role | Role[]) => boolean;
}

// Helper para guardar tokens
const saveTokens = (accessToken: string, refreshToken: string, rememberMe: boolean = false) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('accessToken', accessToken);
  storage.setItem('refreshToken', refreshToken);
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

// Helper para limpiar tokens
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  delete apiClient.defaults.headers.common['Authorization'];
};

// Helper para recuperar tokens (considerando rememberMe)
const getStoredTokens = (): { accessToken: string | null; refreshToken: string | null } => {
  let accessToken = localStorage.getItem('accessToken');
  let refreshToken = localStorage.getItem('refreshToken');
  if (!accessToken) {
    accessToken = sessionStorage.getItem('accessToken');
    refreshToken = sessionStorage.getItem('refreshToken');
  }
  return { accessToken, refreshToken };
};

export const crearSliceAutenticacion: StateCreator<SliceAutenticacion> = (set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  isLoggedIn: false,

  login: async (email, password, rememberMe = false) => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiClient.post<{ user: User; accessToken: string; refreshToken: string }>('/login', { email, password });
      
      saveTokens(data.accessToken, data.refreshToken, rememberMe);
      
      set({ 
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        loading: false,
        isLoggedIn: true,
        error: null
      });
      return true;
    } catch (error: any) {
      clearTokens();
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      set({ 
        error: errorMessage,
        loading: false,
        isLoggedIn: false,
        user: null,
        accessToken: null,
        refreshToken: null
      });
      return false;
    }
  },

  logout: () => {
    clearTokens();
    set({ 
      user: null, 
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      error: null
    });
  },

  verifySession: async () => {
    const { accessToken, refreshToken } = getStoredTokens();
    if (!accessToken) {
      set({ isLoggedIn: false });
      return;
    }

    set({ loading: true });
    try {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      const { data } = await apiClient.post<{ user: User }>('/verify-token', { token: accessToken });
      
      set({ 
        user: data.user,
        accessToken: accessToken,
        refreshToken: refreshToken,
        loading: false,
        isLoggedIn: true,
        error: null 
      });
    } catch (error) {
      const refreshed = await get().refreshAuthToken();
      if (!refreshed) {
          get().logout();
      }
      set({ loading: false });
    }
  },
  
  refreshAuthToken: async () => {
    const { refreshToken } = getStoredTokens();
    if (!refreshToken) {
      return false;
    }

    try {
      const { data } = await apiClient.post<{ accessToken: string; refreshToken: string }>('/refresh-token', { refreshToken });

      const rememberMe = !!localStorage.getItem('refreshToken');
      saveTokens(data.accessToken, data.refreshToken, rememberMe);
      
      set({ accessToken: data.accessToken, refreshToken: data.refreshToken, isLoggedIn: true, error: null });
      
      return true;
    } catch (error) {
      get().logout();
      return false;
    }
  },

  hasRole: (role) => {
    const currentUser = get().user;
    if (!currentUser) return false;
    
    const rolesToCheck = Array.isArray(role) ? role : [role];
    return rolesToCheck.includes(currentUser.role);
  }
});