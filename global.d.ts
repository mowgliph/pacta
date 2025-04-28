/**
 * Declaraciones de tipo globales para la aplicación PACTA
 */

// Declaración para Electron
interface Window {
  Electron: {
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, listener: (...args: any[]) => void) => void;
      removeListener: (channel: string, listener: (...args: any[]) => void) => void;
    };
    api: {
      request: (options: any) => Promise<any>;
    };
    auth: {
      login: (credentials: { 
        usuario: string; 
        password: string; 
        rememberMe?: boolean;
        deviceId?: string;
        isSpecialUser?: boolean;
      }) => Promise<any>;
      logout: () => Promise<any>;
      getPerfil: () => Promise<any>;
      cambiarContrasena: (datos: { 
        currentPassword: string;
        newPassword: string;
      }) => Promise<any>;
    };
    theme: {
      getSystemTheme: () => Promise<'light' | 'dark'>;
      setAppTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
    };
  };
}

// Declaraciones para módulos específicos con problemas de importación
declare module '../../../api/notifications' {
  import * as mod from '../../api/notifications';
  export = mod;
}

declare module '../../../api/users' {
  import * as mod from '../../api/users';
  export = mod;
}

declare module '../../../api/contracts' {
  import * as mod from '../../api/contracts';
  export = mod;
}

declare module '../../../api/auth' {
  import * as mod from '../../api/auth';
  export = mod;
}

declare module '../../../api/backup' {
  import * as mod from '../../api/backup';
  export = mod;
}

declare module '../../../api/statistics' {
  import * as mod from '../../api/statistics';
  export = mod;
}

// Declaración para el Estado del usuario de autenticación
interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: any;
} 