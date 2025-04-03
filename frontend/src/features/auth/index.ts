// Componentes
export { LoginForm } from './components/LoginForm';
export { AuthProvider } from './components/AuthProvider';
export { ProtectedRoute } from './components/ProtectedRoute';

// Páginas
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';
export { default as ResetPasswordPage } from './pages/ResetPasswordPage';
export { default as AccessDeniedPage } from './pages/AccessDeniedPage';

// Hooks
export { useAuth } from './hooks/useAuth';

// Servicios
export { ServicioAutenticacion } from './services/auth-service';
export type { SolicitudLogin } from './services/auth-service';

// Exportar servicios
export { 
  type SolicitudRegistro,
  type SolicitudRestablecerPassword,
  type SolicitudCambiarPassword,
  type RespuestaLogin,
  type RespuestaRegistro,
  type RespuestaCerrarSesion,
  type RespuestaRestablecerPassword
} from './services/auth-service'; 