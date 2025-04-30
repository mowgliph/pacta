import { Icons } from "../components/ui/icons";

export interface Route {
  path: string;
  label: string;
  icon?: keyof typeof Icons;
  roles?: ("admin" | "ra")[];
  children?: Route[];
}

export const ROUTES = {
  // Rutas de autenticación
  AUTH: {
    LOGIN: "/auth",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // Rutas principales
  DASHBOARD: "/dashboard",
  
  // Contratos
  CONTRACTS: {
    LIST: "/contracts",
    CREATE: "/contracts/create",
    DETAIL: (id: string) => `/contracts/${id}`,
    SUPPLEMENTS: (id: string) => `/contracts/${id}/supplements`,
  },

  // Estadísticas
  STATISTICS: "/statistics",

  // Notificaciones
  NOTIFICATIONS: "/notifications",

  // Configuración
  SETTINGS: {
    GENERAL: "/settings",
    PROFILE: "/settings/profile",
    BACKUP: "/settings/backup",
    SMTP: "/settings/smtp",
  },

  // Admin
  ADMIN: {
    USERS: "/admin/users",
    ACTIVITY_LOG: "/admin/activity-log",
  },
} as const;

export const NAVIGATION_ITEMS: Route[] = [
  {
    path: ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: "LayoutDashboard",
  },
  {
    path: ROUTES.CONTRACTS.LIST,
    label: "Contratos",
    icon: "FileText",
  },
  {
    path: ROUTES.STATISTICS,
    label: "Estadísticas",
    icon: "BarChart",
  },
  {
    path: ROUTES.NOTIFICATIONS,
    label: "Notificaciones",
    icon: "Bell",
  },
  {
    path: ROUTES.SETTINGS.GENERAL,
    label: "Configuración",
    icon: "Settings",
    children: [
      {
        path: ROUTES.SETTINGS.PROFILE,
        label: "Perfil",
      },
      {
        path: ROUTES.SETTINGS.BACKUP,
        label: "Respaldos",
        roles: ["admin"],
      },
      {
        path: ROUTES.SETTINGS.SMTP,
        label: "Configuración SMTP",
        roles: ["admin"],
      },
    ],
  },
  {
    path: ROUTES.ADMIN.USERS,
    label: "Administración",
    icon: "Shield",
    roles: ["admin"],
    children: [
      {
        path: ROUTES.ADMIN.USERS,
        label: "Usuarios",
      },
      {
        path: ROUTES.ADMIN.ACTIVITY_LOG,
        label: "Registro de Actividad",
      },
    ],
  },
]; 