import { create } from "zustand";

// Definir tipos para el usuario
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'ra' | 'user';
  avatar?: string;
  permissions?: string[];
}

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
      // @ts-ignore
      const res = await window.Electron.auth.login(credentials);
      console.log('Respuesta de login:', res);
      
      if (res.success && res.data?.user && res.data?.token) {
        const user = res.data.user;
        const token = res.data.token;
        const isAdmin = user.role === 'admin';
        const isRA = user.role === 'ra';
        
        set({ 
          user, 
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
        const errorMessage = res.error || 'Credenciales incorrectas';
        set({ error: errorMessage, loading: false });
        return false;
      }
    } catch (e: any) {
      const errorMessage = e.message || 'Error de conexión con el servidor';
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      // @ts-ignore
      await window.Electron.auth.logout();
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
      // @ts-ignore
      const res = await window.Electron.auth.verify();
      
      if (res.success && res.user) {
        const isAdmin = res.user.role === 'admin';
        const isRA = res.user.role === 'ra';
        
        set({ 
          user: res.user, 
          token: res.token || token,
          isAuthenticated: true,
          isAdmin,
          isRA,
          loading: false 
        });
        return true;
      }
      
      // Si la verificación falla, limpiar el token
      localStorage.removeItem('authToken');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
      return false;
      
    } catch (error) {
      console.error('Error al verificar la sesión:', error);
      localStorage.removeItem('authToken');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));
