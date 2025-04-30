import { useState, useEffect, useCallback } from "react";
import { rendererSecurity } from "../lib/security";
import { useRouter } from "next/router";
import { ipcRenderer } from "electron";

/**
 * Hook personalizado para manejar la seguridad en componentes
 */
export function useSecurity() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        if (!token) {
          setIsAuthenticated(false);
          router.push("/login");
          return;
        }

        // Verificar token con el proceso main
        const isValid = await ipcRenderer.invoke("auth:verifyToken", token);
        setIsAuthenticated(isValid);

        if (!isValid) {
          localStorage.removeItem("auth-token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setIsAuthenticated(false);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Función para manejar el login
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        // Sanitizar y validar entrada
        const sanitizedEmail = rendererSecurity.sanitizeInput(email);
        if (!rendererSecurity.validateEmail(sanitizedEmail)) {
          throw new Error("Email inválido");
        }

        if (!rendererSecurity.validatePassword(password)) {
          throw new Error("Contraseña inválida");
        }

        // Obtener token CSRF
        const csrfToken = await rendererSecurity.getCsrfToken();

        // Enviar credenciales al proceso main
        const response = await ipcRenderer.invoke("auth:login", {
          email: sanitizedEmail,
          password,
          csrfToken,
        });

        if (response.token) {
          localStorage.setItem("auth-token", response.token);
          setIsAuthenticated(true);
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error en login:", error);
        throw error;
      }
    },
    [router]
  );

  // Función para manejar el logout
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (token) {
        await ipcRenderer.invoke("auth:logout", token);
      }
      localStorage.removeItem("auth-token");
      setIsAuthenticated(false);
      router.push("/login");
    } catch (error) {
      console.error("Error en logout:", error);
    }
  }, [router]);

  // Función para verificar permisos
  const hasPermission = useCallback(async (permission: string) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return false;

      return await ipcRenderer.invoke("auth:hasPermission", {
        token,
        permission,
      });
    } catch (error) {
      console.error("Error al verificar permisos:", error);
      return false;
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
  };
}
