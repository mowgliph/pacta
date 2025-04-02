// Re-exportaciones de la característica de usuarios
export { UsersListPage } from './pages/UsersListPage';

// Exportación del servicio de usuarios
export { UsersService } from './services/users-service';

// Exportación de los tipos
export type {
  UserDetails,
  UserSearchParams,
  UsersResponse,
  CreateUserData,
  UpdateUserData,
  ChangePasswordData,
  UserProfileData
} from './types';

// Exportación de enums
export {
  UserPermission,
  UserRole
} from './types';

// Exportación de hooks
export {
  useUsersList,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateAvatar,
  useResetUserPassword,
  useUpdateUserPermissions,
  useChangePassword,
  useActiveUsers,
  useUsersByRole
} from './hooks/useUsers';

// Esta estructura permite importar los componentes directamente desde la feature
// Ejemplo: import { UsersListPage, UsersService } from '@/features/users';
