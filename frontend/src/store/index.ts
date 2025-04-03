import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Role, type UserStatus } from '@/types/enums';
import { ServicioAutenticacion, type SolicitudLogin } from '@/features/auth/services/auth-service';
import { type ApiError } from '@/lib/api';

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
  usuario: User | null;
  token: string | null;
  tokenRefresco: string | null;
  estaAutenticado: boolean;
  cargando: boolean;
  error: string | null;
  iniciarSesion: (username: string, password: string, recordarme?: boolean) => Promise<boolean>;
  cerrarSesion: () => Promise<void>;
  verificarSesion: () => Promise<void>;
  tienePermiso: (roles: Role | Role[]) => boolean;
  
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
const guardarTokens = (tokenAcceso: string, tokenRefresco: string = tokenAcceso, recordarme: boolean = false) => {
  // Verificar si estamos en el navegador
  if (typeof window === 'undefined') return;
  
  const storage = recordarme ? localStorage : sessionStorage;
  storage.setItem('tokenAcceso', tokenAcceso);
  storage.setItem('tokenRefresco', tokenRefresco);
};

// Helper para limpiar tokens
const limpiarTokens = () => {
  // Verificar si estamos en el navegador
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('tokenAcceso');
  localStorage.removeItem('tokenRefresco');
  sessionStorage.removeItem('tokenAcceso');
  sessionStorage.removeItem('tokenRefresco');
};

// Helper para obtener tokens almacenados
const obtenerTokensAlmacenados = () => {
  // Verificar si estamos en el navegador
  if (typeof window === 'undefined') return { tokenAcceso: null, tokenRefresco: null };
  
  // Intentar obtener desde localStorage primero (recordarme)
  let tokenAcceso = localStorage.getItem('tokenAcceso');
  let tokenRefresco = localStorage.getItem('tokenRefresco');
  
  // Si no hay en localStorage, intentar sessionStorage
  if (!tokenAcceso) {
    tokenAcceso = sessionStorage.getItem('tokenAcceso');
    tokenRefresco = sessionStorage.getItem('tokenRefresco');
  }
  
  return { tokenAcceso, tokenRefresco };
};

// Create the store
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth state
      usuario: null,
      token: null,
      tokenRefresco: null,
      estaAutenticado: false,
      cargando: false,
      error: null,
      
      iniciarSesion: async (username: string, password: string, recordarme = false) => {
        set({ cargando: true, error: null });
        try {
          // Usar el servicio de autenticación real
          const datosSolicitud: SolicitudLogin = { username, password, rememberMe: recordarme };
          const respuesta = await ServicioAutenticacion.iniciarSesion(datosSolicitud);
          
          // Guardar tokens
          guardarTokens(respuesta.token, respuesta.token, recordarme);
          
          set({
            usuario: respuesta.user,
            token: respuesta.token,
            tokenRefresco: respuesta.token, // En algunas implementaciones puede ser diferente
            estaAutenticado: true,
            cargando: false
          });
          
          return true;
        } catch (error) {
          limpiarTokens();
          const apiError = error as ApiError;
          set({
            cargando: false,
            error: apiError.message || 'Error al iniciar sesión',
            estaAutenticado: false,
            usuario: null,
            token: null,
            tokenRefresco: null
          });
          
          return false;
        }
      },
      
      cerrarSesion: async () => {
        set({ cargando: true });
        try {
          // Llamar al servicio de logout si hay token
          if (get().token) {
            await ServicioAutenticacion.cerrarSesion();
          }
          limpiarTokens();
        } catch (error) {
          // Ignorar errores durante el logout
          console.error('Error durante el cierre de sesión', error);
        } finally {
          // Limpiar el estado independientemente del resultado
          set({
            usuario: null,
            token: null,
            tokenRefresco: null,
            estaAutenticado: false,
            cargando: false
          });
        }
      },
      
      verificarSesion: async () => {
        const { tokenAcceso, tokenRefresco } = obtenerTokensAlmacenados();
        if (!tokenAcceso) {
          set({ estaAutenticado: false });
          return;
        }

        set({ cargando: true });
        try {
          // Usar el servicio para verificar el token
          const esValido = await ServicioAutenticacion.validarToken(tokenAcceso);
          
          if (esValido) {
            // Si el token es válido, obtener información del usuario
            const datosUsuario = await ServicioAutenticacion.obtenerUsuarioActual();
            
            set({ 
              usuario: datosUsuario,
              token: tokenAcceso,
              tokenRefresco: tokenRefresco,
              cargando: false,
              estaAutenticado: true,
              error: null 
            });
          } else {
            get().cerrarSesion();
          }
        } catch (error) {
          get().cerrarSesion();
          set({ cargando: false });
        }
      },
      
      tienePermiso: (roles: Role | Role[]) => {
        const { usuario } = get();
        if (!usuario) return false;
        
        const rolesToCheck = Array.isArray(roles) ? roles : [roles];
        return rolesToCheck.includes(usuario.role as Role);
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
        usuario: state.usuario,
        token: state.token,
        tokenRefresco: state.tokenRefresco,
        estaAutenticado: state.estaAutenticado,
        theme: state.theme
      })
    }
  )
)