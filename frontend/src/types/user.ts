export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  active: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}