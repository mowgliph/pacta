export const IPC_CHANNELS = {
  AUTH: {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    VERIFY: 'auth:verify',
    REFRESH: 'auth:refresh',
    CHANGE_PASSWORD: 'auth:change-password',
    PROFILE: 'auth:profile'
  },
  DATA: {
    CONTRACTS: {
      LIST: 'contracts:list',
      CREATE: 'contracts:create',
      UPDATE: 'contracts:update',
      DELETE: 'contracts:delete',
      EXPORT: 'contracts:export',
      ARCHIVE: 'contracts:archive',
      UPDATE_ACCESS_CONTROL: 'contracts:update-access-control',
      ASSIGN_USERS: 'contracts:assign-users'
    },
    DOCUMENTS: {
      LIST: 'documents:list',
      UPLOAD: 'documents:upload',
      DELETE: 'documents:delete',
      DOWNLOAD: 'documents:download',
      GET_BY_CONTRACT: 'documents:get-by-contract',
      GET_BY_SUPPLEMENT: 'documents:get-by-supplement',
      OPEN: 'documents:open'
    },
    USERS: {
      LIST: 'users:list',
      CREATE: 'users:create',
      UPDATE: 'users:update',
      DELETE: 'users:delete',
      TOGGLE_ACTIVE: 'users:toggle-active',
      CHANGE_PASSWORD: 'users:change-password'
    },
    ROLES: {
      LIST: 'roles:list',
      CREATE: 'roles:create',
      UPDATE: 'roles:update',
      DELETE: 'roles:delete'
    },
    SUPPLEMENTS: {
      LIST: 'supplements:list',
      CREATE: 'supplements:create',
      UPDATE: 'supplements:update',
      DELETE: 'supplements:delete'
    }
  },
  SYSTEM: {
    OPEN_FILE: 'system:open-file',
    SAVE_FILE: 'system:save-file',
    BACKUP: 'system:backup',
    RESTORE: 'system:restore',
    SETTINGS: {
      GET: 'settings:get',
      UPDATE: 'settings:update',
      THEME: 'settings:theme',
      LOGS: 'settings:logs'
    },
    APP: {
      RELAUNCH: 'app:relaunch',
      EXIT: 'app:exit',
      GET_VERSION: 'app:get-version',
      GET_PATH: 'app:get-path',
      GET_INFO: 'app:get-info'
    }
  },
  NOTIFICATIONS: {
    SHOW: 'notifications:show',
    CLEAR: 'notifications:clear',
    MARK_READ: 'notifications:mark-read',
    GET_UNREAD: 'notifications:get-unread'
  },
  STATISTICS: {
    DASHBOARD: 'statistics:dashboard',
    CONTRACTS: 'statistics:contracts',
    EXPORT: 'statistics:export'
  },
  SECURITY: {
    VALIDATE_FILE: 'security:validate-file',
    CHECK_FILE_EXISTS: 'security:check-file-exists',
    PERMISSIONS: {
      GET: 'security:permissions:get',
      UPDATE: 'security:permissions:update',
      CHECK: 'security:permissions:check'
    },
    RATE_LIMIT: {
      CHECK: 'security:rate-limit:check',
      RESET: 'security:rate-limit:reset'
    }
  },
  STORE: {
    GET: 'store:get',
    SET: 'store:set',
    DELETE: 'store:delete',
    CLEAR: 'store:clear',
    BACKUP: 'store:backup',
    RESTORE: 'store:restore'
  },
  VALIDATION: {
    VALIDATE: 'validation:validate',
    SCHEMA: {
      GET: 'validation:schema:get',
      LIST: 'validation:schema:list'
    }
  },
  WINDOW: {
    CREATE: 'window:create',
    CLOSE: 'window:close',
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    RESTORE: 'window:restore',
    FOCUS: 'window:focus',
    GET_STATE: 'window:get-state',
    SET_STATE: 'window:set-state'
  }
} as const;

export type IpcChannel = typeof IPC_CHANNELS; 