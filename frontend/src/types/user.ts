export interface License {
  id: number;
  type: 'trial' | 'basic' | 'premium';
  status: 'active' | 'expired' | 'suspended';
  startDate: string;
  expirationDate: string;
  maxUsers: number;
  features: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'advanced' | 'readonly';
  active: boolean;
  lastLogin?: string | Date | null;
  password?: string;
  firstLogin: boolean;
  createdAt?: string;
  updatedAt?: string;
  license?: License;
}