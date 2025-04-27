// User types
export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPermission {
  userId: string;
  name: string;
  email: string;
  permissions: {
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    assign: boolean;
  };
}

// Contract types

export interface Contract {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  documentUrl?: string;
  value?: {
    amount: number;
    currency: string;
  };
  owner: {
    name: string;
    [key: string]: any;
  };
  createdBy?:
    | {
        name: string;
        [key: string]: any;
      }
    | string;
  createdAt: string;
  updatedAt: string;
  parties?: Array<{
    name: string;
    role: string;
    contact?: string;
  }>;
  history?: Array<{
    action: string;
    date: string;
    user?:
      | {
          name: string;
          [key: string]: any;
        }
      | string;
    description?: string;
  }>;
  accessControl?: AccessControl;
}

export interface ContractPart {
  id: number;
  contractId: number;
  partyName: string;
  partyRole: string;
  partyContact: string;
  createdAt: string;
  updatedAt: string;
}

export interface Obligation {
  id: number;
  contractId: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: number;
  contractId: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  contractId: number;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guarantee {
  id: number;
  contractId: number;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplement {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  documentUrl?: string;
  changes: string;
  effectiveDate: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

// Company types
export interface Company {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  departments?: Department[];
}

export interface Department {
  id: number;
  name: string;
  description: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  contractId?: string;
  supplementId?: string;
  uploadedById: string;
  description?: string;
  tags?: string;
  isPublic: boolean;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
}

// Notification types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  subtype: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface NotificationPreference {
  id: number;
  userId: number;
  type: string;
  email: boolean;
  inApp: boolean;
  system: boolean;
}

// Activity types
export interface Activity {
  id: number;
  userId: number;
  contractId?: number;
  action: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

// Settings types
export interface Setting {
  key: string;
  value: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface SMTPConfig {
  id: number;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicViewSettings {
  id: number;
  userId: number;
  showLandingPage: boolean;
  showPublicStatistics: boolean;
  showPublicContracts: boolean;
  createdAt: string;
  updatedAt: string;
}

// Role types
export interface Permission {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  approve?: boolean;
  assign?: boolean;
  export?: boolean;
  view?: boolean;
  assign_roles?: boolean;
}

export interface Permissions {
  contracts: Permission;
  users: Permission;
  reports: Permission;
  settings: Permission;
}

export interface Roles {
  id: string;
  name: string;
  description: string;
  permissions: Permissions;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomPermissions {
  contracts: {
    create: boolean | null;
    read: boolean | null;
    update: boolean | null;
    delete: boolean | null;
    approve: boolean | null;
    assign: boolean | null;
    export: boolean | null;
  };
}

// Access control types
export interface ContractAccess {
  id: string;
  userId: string;
  user: User;
  contractId: string;
  contract: Contract;
  permissions: {
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    assign: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContractAccessRole {
  id: string;
  roleId: string;
  role: Roles;
  contractId: string;
  contract: Contract;
}

// Add these fields to Contract interface
export interface AccessControl {
  restricted: boolean;
  allowedRoles?: Array<Roles | string>;
}

export interface Backup {
  id: string;
  filename: string;
  size: number;
  path: string;
  createdAt: string;
  description: string;
  isAutomatic: boolean;
}
