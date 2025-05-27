import { create } from "zustand";
import { authApi } from "@/api/auth.api";
import { User } from "@/api/common";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isRA: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  verify: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
  isRA: false,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      console.log('Respuesta de login:', response);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        const isAdmin = user.roleId === 'admin';
        const isRA = user.roleId === 'ra';
        
        const userData: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        
        set({ 
          user: userData, 
          token, 
          isAuthenticated: true,
          isAdmin,
          isRA,
          loading: false 
        });
        
        // Almacenar el token en localStorage para persistencia
        localStorage.setItem('authToken', token);
        return true;
      } else {
        const errorMessage = response.error?.message || 'Credenciales incorrectas';
        set({ error: errorMessage, loading: false });
        return false;
      }
    } catch (e: any) {
      console.error('Error en login:', e);
      const errorMessage = e?.response?.data?.message || e.message || 'Error de conexión con el servidor';
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar el estado local
      localStorage.removeItem('authToken');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isAdmin: false,
        isRA: false 
      });
      // Redirigir al login
      window.location.href = '/login';
    }
  },

  verify: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    set({ loading: true });
    try {
      const response = await authApi.verify(token);
      
      if (response.success && response.data?.user) {
        const { user } = response.data;
        const isAdmin = user.roleId === 'admin';
        const isRA = user.roleId === 'ra';
        
        const userData: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        
        set({ 
          user: userData,
          token,
          isAuthenticated: true,
          isAdmin,
          isRA,
          loading: false 
        });
        return true;
      }
      
      // Si la verificación falla, limpiar el token
      localStorage.removeItem('authToken');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isAdmin: false,
        isRA: false,
        loading: false 
      });
      return false;
      
    } catch (error) {
      console.error('Error al verificar la sesión:', error);
      localStorage.removeItem('authToken');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isAdmin: false,
        isRA: false,
        loading: false 
      });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));
