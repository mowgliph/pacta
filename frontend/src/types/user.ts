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
  password?: string;
  role: 'admin' | 'user';
  active: boolean;
  firstLogin: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  license?: License;
}