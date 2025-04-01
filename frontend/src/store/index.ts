import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Role, UserStatus } from '@/types/enums';
import { AuthService, LoginRequest } from '@/features/auth';
import { ApiError } from '@/lib/api';

// Types
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  status?: UserStatus;
  lastLogin?: string;
  profileImage?: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
};

// Tipo para el CommandK
export type CommandKRef = {
  toggle: () => void;
};

// Store state and actions type
type StoreState = {
  // Auth
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  verifySession: () => Promise<void>;
  hasRole: (roles: Role | Role[]) => boolean;
  
  // UI
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // CommandK
  commandK: CommandKRef | null;
  setCommandK: (ref: CommandKRef) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
};

// Helper para guardar tokens
const saveTokens = (accessToken: string, refreshToken: string = accessToken, rememberMe: boolean = false) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('accessToken', accessToken);
  storage.setItem('refreshToken', refreshToken);
};

// Helper para limpiar tokens
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
};

// Helper para recuperar tokens
const getStoredTokens = (): { accessToken: string | null; refreshToken: string | null } => {
  let accessToken = localStorage.getItem('accessToken');
  let refreshToken = localStorage.getItem('refreshToken');
  if (!accessToken) {
    accessToken = sessionStorage.getItem('accessToken');
    refreshToken = sessionStorage.getItem('refreshToken');
  }
  return { accessToken, refreshToken };
};

// Create the store
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          // Usar el servicio de autenticación real
          const loginData: LoginRequest = { email, password, rememberMe };
          const response = await AuthService.login(loginData);
          
          // Guardar tokens
          saveTokens(response.token, response.token, rememberMe);
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.token, // En algunas implementaciones puede ser diferente
            isAuthenticated: true,
            isLoading: false
          });
          
          return true;
        } catch (error) {
          clearTokens();
          const apiError = error as ApiError;
          set({
            isLoading: false,
            error: apiError.message || 'Error al iniciar sesión',
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null
          });
          
          return false;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          // Llamar al servicio de logout si hay token
          if (get().token) {
            await AuthService.logout();
          }
          clearTokens();
        } catch (error) {
          // Ignorar errores durante el logout
          console.error('Error durante el logout', error);
        } finally {
          // Limpiar el estado independientemente del resultado
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },
      
      verifySession: async () => {
        const { accessToken, refreshToken } = getStoredTokens();
        if (!accessToken) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          // Usar el servicio para verificar el token
          const isValid = await AuthService.validateToken(accessToken);
          
          if (isValid) {
            // Si el token es válido, obtener información del usuario
            const userData = await AuthService.getCurrentUser();
            
            set({ 
              user: userData,
              token: accessToken,
              refreshToken,
              isLoading: false,
              isAuthenticated: true,
              error: null 
            });
          } else {
            get().logout();
          }
        } catch (error) {
          get().logout();
          set({ isLoading: false });
        }
      },
      
      hasRole: (roles: Role | Role[]) => {
        const { user } = get();
        if (!user) return false;
        
        const rolesToCheck = Array.isArray(roles) ? roles : [roles];
        return rolesToCheck.includes(user.role as Role);
      },
      
      // UI state
      theme: 'light',
      sidebarCollapsed: false,
      
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      
      setTheme: (theme) => {
        set({ theme });
      },
      
      // CommandK state
      commandK: null,
      
      setCommandK: (ref: CommandKRef) => {
        set({ commandK: ref });
      },
      
      // Notifications state
      notifications: [],
      
      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotification = { ...notification, id };
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }));
        
        return id;
      },
      
      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      }
    }),
    {
      name: 'pacta-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme
      })
    }
  )
)