import axios from 'axios';

// Crea una instancia de axios con la configuración por defecto
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    // Obtiene el token del localStorage si existe
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Si el token existe, lo agrega a los headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Maneja errores 401 (No autorizado) - Token expirado o inválido
    if (error.response && error.response.status === 401) {
      // Limpia el token del localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        
        // Redirecciona a la página de login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Funciones helper para llamadas API comunes
export const apiHelpers = {
  get: async (url: string, params?: any) => {
    const response = await apiClient.get(url, { params });
    return response.data;
  },
  
  post: async (url: string, data: any) => {
    const response = await apiClient.post(url, data);
    return response.data;
  },
  
  put: async (url: string, data: any) => {
    const response = await apiClient.put(url, data);
    return response.data;
  },
  
  patch: async (url: string, data: any) => {
    const response = await apiClient.patch(url, data);
    return response.data;
  },
  
  delete: async (url: string) => {
    const response = await apiClient.delete(url);
    return response.data;
  },
};

// Función para determinar si una llamada API está en progreso
let activeRequests = 0;

export const isApiLoading = () => activeRequests > 0;

// Interceptores para controlar requests activos
apiClient.interceptors.request.use(
  (config) => {
    activeRequests++;
    return config;
  },
  (error) => {
    activeRequests--;
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    activeRequests--;
    return response;
  },
  (error) => {
    activeRequests--;
    return Promise.reject(error);
  }
); 