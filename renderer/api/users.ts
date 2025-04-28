import { z } from 'zod';

// Definir canales IPC para comunicación con el proceso principal
export const UsersChannels = {
  GET_ALL: "users:getAll",
  GET_BY_ID: "users:getById",
  CREATE: "users:create",
  UPDATE: "users:update",
  DELETE: "users:delete",
  CHANGE_PASSWORD: "users:changePassword",
  UPDATE_PREFERENCES: "users:updatePreferences",
  GET_ROLES: "users:getRoles",
  ASSIGN_ROLE: "users:assignRole",
};

// Esquemas para validación en el lado del cliente
export const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string(),
  active: z.boolean().default(true),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  lastLogin: z.string().or(z.date()).nullable().optional(),
  createdById: z.string().uuid().optional(),
});

export const createUserSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  role: z.string().default("RA"),
  active: z.boolean().default(true),
  preferences: z.record(z.any()).optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  fullName: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  role: z.string().optional(),
  active: z.boolean().optional(),
  preferences: z.record(z.any()).optional(),
});

export const changePasswordSchema = z.object({
  userId: z.string().uuid(),
  currentPassword: z.string(),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  notificationsEnabled: z.boolean().optional(),
  notificationDays: z.number().positive().optional(),
  dashboardLayout: z.record(z.any()).optional(),
});

// Servicios de API para usuarios
export const usersApi = {
  /**
   * Obtener lista de usuarios con filtros opcionales
   */
  getUsers: async (filters = {}) => {
    return window.Electron.ipcRenderer.invoke(UsersChannels.GET_ALL, filters);
  },

  /**
   * Obtener un usuario por ID
   */
  getUserById: async (id) => {
    return window.Electron.ipcRenderer.invoke(UsersChannels.GET_BY_ID, { id });
  },

  /**
   * Crear un nuevo usuario
   */
  createUser: async (userData, adminId) => {
    // Validar datos antes de enviar
    const validData = createUserSchema.parse(userData);
    return window.Electron.ipcRenderer.invoke(UsersChannels.CREATE, {
      userData: validData,
      adminId
    });
  },

  /**
   * Actualizar un usuario existente
   */
  updateUser: async (id, data, adminId = null) => {
    // Validar datos antes de enviar
    const validData = updateUserSchema.parse(data);
    return window.Electron.ipcRenderer.invoke(UsersChannels.UPDATE, { 
      id, 
      data: validData,
      adminId
    });
  },

  /**
   * Cambiar contraseña de usuario
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    const data = changePasswordSchema.parse({
      userId,
      currentPassword,
      newPassword
    });
    
    return window.Electron.ipcRenderer.invoke(UsersChannels.CHANGE_PASSWORD, data);
  },

  /**
   * Actualizar preferencias de usuario
   */
  updatePreferences: async (userId, preferences) => {
    const validPreferences = updatePreferencesSchema.parse(preferences);
    
    return window.Electron.ipcRenderer.invoke(UsersChannels.UPDATE_PREFERENCES, {
      userId,
      preferences: validPreferences
    });
  },

  /**
   * Obtener roles disponibles en el sistema
   */
  getRoles: async () => {
    return window.Electron.ipcRenderer.invoke(UsersChannels.GET_ROLES);
  },

  /**
   * Asignar rol a un usuario
   */
  assignRole: async (userId, role, adminId) => {
    return window.Electron.ipcRenderer.invoke(UsersChannels.ASSIGN_ROLE, {
      userId,
      role,
      adminId
    });
  }
}; 