export interface User {
  id: number;
  username: string;
  role: string;
}

export interface License {
  id: number;
  type: string;
  expiration_date: string;
  features: {
    maxUsers: number;
    maxContracts: number;
    features: string[];
  };
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  license: License;
  token: string;
}

export interface LicenseResponse {
  message: string;
  license: License;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface ApiError {
  message: string;
  status: number;
} 