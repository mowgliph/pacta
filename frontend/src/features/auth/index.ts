// Re-exportaciones de la característica de autenticación
export { LoginPage } from './pages/LoginPage';
export { LoginForm } from './components/LoginForm';

// Exportación del servicio de autenticación
export { 
  AuthService,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type ChangePasswordRequest
} from './services/auth-service';

// Esta estructura permite importar los componentes directamente desde la feature
// Ejemplo: import { LoginPage, AuthService } from '@/features/auth';
