import { AuthApi, ApiResponse, User } from '@/types/electron';

// Tipos de credenciales
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Tipos de respuesta
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi: AuthApi = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await window.electron.auth.login(credentials);
      return response;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return {
        success: false,
        error: {
          message: 'Error al iniciar sesión',
          code: 'LOGIN_ERROR'
        }
      };
    }
  },

  async logout() {
    try {
      const response = await window.electron.auth.logout();
      return response;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return {
        success: false,
        error: {
          message: 'Error al cerrar sesión',
          code: 'LOGOUT_ERROR'
        }
      };
    }
  },

  async verify(token: string) {
    try {
      const response = await window.electron.auth.verify(token);
      return response;
    } catch (error) {
      console.error('Error al verificar la sesión:', error);
      return {
        success: false,
        error: {
          message: 'Error al verificar la sesión',
          code: 'VERIFICATION_ERROR'
        }
      };
    }
  },

  async refresh(refreshToken: string) {
    try {
      const response = await window.electron.auth.refresh(refreshToken);
      
      if (response.success && response.data) {
        // Asegurarnos de que la respuesta cumpla con AuthResponse
        const authResponse: AuthResponse = {
          user: response.data.user,
          token: response.data.token,
          refreshToken: (response.data as any).refreshToken || refreshToken // Usar el nuevo refreshToken si viene, o el existente
        };
        
        return {
          ...response,
          data: authResponse
        } as ApiResponse<AuthResponse>;
      }
      
      return response as unknown as ApiResponse<AuthResponse>;
    } catch (error) {
      console.error('Error al refrescar el token:', error);
      return {
        success: false,
        error: {
          message: 'Error al refrescar la sesión',
          code: 'REFRESH_ERROR'
        }
      } as ApiResponse<AuthResponse>;
    }
  },

  async changePassword(data: ChangePasswordData) {
    try {
      const response = await window.electron.auth.changePassword(data);
      return response;
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      return {
        success: false,
        error: {
          message: 'Error al cambiar la contraseña',
          code: 'CHANGE_PASSWORD_ERROR'
        }
      };
    }
  },

  async getProfile() {
    try {
      const response = await window.electron.auth.getProfile();
      return response;
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      return {
        success: false,
        error: {
          message: 'Error al obtener el perfil',
          code: 'GET_PROFILE_ERROR'
        }
      };
    }
  }
};

export default authApi;
