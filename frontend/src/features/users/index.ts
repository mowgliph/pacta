// Re-exportaciones de la característica de usuarios
export { UsersListPage } from './pages/UsersListPage';

// Exportación del servicio de usuarios
export {
  UsersService,
  type UserDetails,
  type UserSearchParams,
  type UsersResponse,
  type CreateUserData,
  type UpdateUserData
} from './services/users-service';

// Esta estructura permite importar los componentes directamente desde la feature
// Ejemplo: import { UsersListPage, UsersService } from '@/features/users';
