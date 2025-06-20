// Archivo de definición de canales IPC para CommonJS puro

const IPC_CHANNELS = {
  LICENSE: {
    VALIDATE: "license:validate",
    STATUS: "license:status",
    REVOKE: "license:revoke",
    LIST: "license:list",
    INFO: "license:info",
  },
  AUTH: {
    LOGIN: "auth:login",
    LOGOUT: "auth:logout",
    VERIFY: "auth:verify",
    REFRESH: "auth:refresh",
    CHANGE_PASSWORD: "auth:change-password",
    PROFILE: "auth:profile",
  },
  REPORT: {
    EXPORT_PDF: "export:pdf",
    EXPORT_EXCEL: "export:excel",
    TEMPLATES: {
      GET: "report:templates:get",
      SAVE: "report:template:save",
      DELETE: "report:template:delete",
    },
  },
  NOTIFICATIONS: {
    SHOW: "notifications:show",
    CLEAR: "notifications:clear",
    MARK_READ: "notifications:mark-read",
    GET_UNREAD: "notifications:get-unread",
  },

  STATISTICS: {
    DASHBOARD: "statistics:dashboard",
    CONTRACTS: "statistics:contracts",
    EXPORT: "statistics:export",
    CONTRACTS_BY_STATUS: "statistics:contracts-by-status",
    CONTRACTS_BY_TYPE: "statistics:contracts-by-type",
    CONTRACTS_BY_CURRENCY: "statistics:contracts-by-currency",
    CONTRACTS_BY_USER: "statistics:contracts-by-user",
    CONTRACTS_CREATED_BY_MONTH: "statistics:contracts-created-by-month",
    CONTRACTS_EXPIRED_BY_MONTH: "statistics:contracts-expired-by-month",
    CONTRACTS_EXPIRING_SOON: "statistics:contracts-expiring-soon",
    CONTRACTS_WITHOUT_DOCUMENTS: "statistics:contracts-without-documents",
    USERS_ACTIVITY: "statistics:users-activity"
  },
  
  DATA: {
    // Canales para representantes legales
    LEGAL_REPRESENTATIVES: {
      LIST: "legal-representatives:list",
      CREATE: "legal-representatives:create",
      UPDATE: "legal-representatives:update",
      GET: "legal-representatives:get",
      DELETE: "legal-representatives:delete",
      SEARCH: "legal-representatives:search",
    },
    
    // Canales para contratos
    CONTRACTS: {
      LIST: "contracts:list",
      CREATE: "contracts:create",
      UPDATE: "contracts:update",
      DELETE: "contracts:delete",
      EXPORT: "contracts:export",
      UPLOAD: "contracts:upload",
      ARCHIVE: "contracts:archive",
      RESTORE: "contracts:restore",
      LIST_ARCHIVED: "contracts:list-archived",
      UPDATE_ACCESS_CONTROL: "contracts:update-access-control",
      ASSIGN_USERS: "contracts:assign-users",
      GET_BY_ID: "contracts:getById",
      GET_ARCHIVED: "contracts:get-archived",
    },
    DOCUMENTS: {
      LIST: "documents:list",
      UPLOAD: "documents:upload",
      DELETE: "documents:delete",
      DOWNLOAD: "documents:download",
      GET_BY_CONTRACT: "documents:get-by-contract",
      GET_BY_SUPPLEMENT: "documents:get-by-supplement",
      OPEN: "documents:open",
    },
    USERS: {
      LIST: "users:list",
      CREATE: "users:create",
      UPDATE: "users:update",
      DELETE: "users:delete",
      TOGGLE_ACTIVE: "users:toggle-active",
      CHANGE_PASSWORD: "users:change-password",
      GET_BY_ID: "users:getById",
    },
    ROLES: {
      LIST: "roles:list",
      CREATE: "roles:create",
      UPDATE: "roles:update",
      DELETE: "roles:delete",
    },
    SUPPLEMENTS: {
      LIST: "supplements:list",
      CREATE: "supplements:create",
      UPDATE: "supplements:update",
      DELETE: "supplements:delete",
      EXPORT: "supplements:export",
      UPLOAD: "supplements:upload",
    },
  },
  SYSTEM: {
    OPEN_FILE: "system:open-file",
    SAVE_FILE: "system:save-file",
    BACKUP: "system:backup",
    RESTORE: "system:restore",
    SETTINGS: {
      GET: "settings:get",
      UPDATE: "settings:update",
      LOGS: "settings:logs",
    },
    APP: {
      RELAUNCH: "app:relaunch",
      EXIT: "app:exit",
      GET_VERSION: "app:get-version",
      GET_PATH: "app:get-path",
      GET_INFO: "app:get-info",
      UPDATE_AVAILABLE: "app:update-available",
      RESTART: "app:restart",
    },
  },
  SECURITY: {
    VALIDATE_FILE: "security:validate-file",
    CHECK_FILE_EXISTS: "security:check-file-exists",
    PERMISSIONS: {
      GET: "security:permissions:get",
      UPDATE: "security:permissions:update",
      CHECK: "security:permissions:check",
    },
    RATE_LIMIT: {
      CHECK: "security:rate-limit:check",
      RESET: "security:rate-limit:reset",
    },
  },
  STORE: {
    GET: "store:get",
    SET: "store:set",
    DELETE: "store:delete",
    CLEAR: "store:clear",
    BACKUP: "store:backup",
    RESTORE: "store:restore",
  },
  VALIDATION: {
    VALIDATE: "validation:validate",
    SCHEMA: {
      GET: "validation:schema:get",
      LIST: "validation:schema:list",
    },
  },
  WINDOW: {
    CREATE: "window:create",
    CLOSE: "window:close",
    MINIMIZE: "window:minimize",
    MAXIMIZE: "window:maximize",
    RESTORE: "window:restore",
    FOCUS: "window:focus",
    GET_STATE: "window:get-state",
    SET_STATE: "window:set-state",
  },
  BACKUPS: {
    CREATE: "backups:create",
    RESTORE: "backups:restore",
    DELETE: "backups:delete",
    LIST: "backups:list",
    CLEAN_OLD: "backups:clean-old",
  },
};

module.exports = { IPC_CHANNELS };
