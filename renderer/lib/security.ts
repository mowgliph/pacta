import { ipcRenderer } from "electron";

/**
 * Servicio de seguridad para el proceso de renderer
 */
export class RendererSecurity {
  private static instance: RendererSecurity;
  private csrfToken: string | null = null;
  private sessionTimeout: number | null = null;

  private constructor() {
    this.setupSecurity();
  }

  public static getInstance(): RendererSecurity {
    if (!RendererSecurity.instance) {
      RendererSecurity.instance = new RendererSecurity();
    }
    return RendererSecurity.instance;
  }

  /**
   * Configura las medidas de seguridad básicas
   */
  private setupSecurity(): void {
    // Deshabilitar el menú contextual
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // Prevenir apertura de enlaces externos
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" &&
        target.getAttribute("href")?.startsWith("http")
      ) {
        e.preventDefault();
        console.warn("Intento de apertura de enlace externo bloqueado");
      }
    });

    // Configurar timeout de sesión
    this.setupSessionTimeout();
  }

  /**
   * Configura el timeout de sesión
   */
  private setupSessionTimeout(): void {
    const timeout = 30 * 60 * 1000; // 30 minutos
    let timeoutId: number;

    const resetTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        this.handleSessionTimeout();
      }, timeout);
    };

    // Resetear timeout en interacción del usuario
    ["mousemove", "keydown", "click", "scroll"].forEach((event) => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });

    resetTimeout();
  }

  /**
   * Maneja el timeout de sesión
   */
  private async handleSessionTimeout(): Promise<void> {
    try {
      await ipcRenderer.invoke("auth:logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al manejar timeout de sesión:", error);
    }
  }

  /**
   * Obtiene el token CSRF actual
   */
  public async getCsrfToken(): Promise<string> {
    if (!this.csrfToken) {
      const response = await ipcRenderer.invoke("security:generateCsrfToken");
      this.csrfToken = response.csrfToken;
    }
    return this.csrfToken!;
  }

  /**
   * Verifica si un token CSRF es válido
   */
  public async verifyCsrfToken(token: string): Promise<boolean> {
    try {
      return await ipcRenderer.invoke("security:verifyCsrfToken", { token });
    } catch (error) {
      console.error("Error al verificar token CSRF:", error);
      return false;
    }
  }

  /**
   * Sanitiza datos de entrada
   */
  public sanitizeInput(input: string): string {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Valida un email
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida una contraseña
   */
  public validatePassword(password: string): boolean {
    // Mínimo 8 caracteres, al menos una letra mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Encripta datos sensibles antes de enviarlos
   */
  public async encryptData(data: string): Promise<string> {
    try {
      return await ipcRenderer.invoke("security:encryptData", { data });
    } catch (error) {
      console.error("Error al encriptar datos:", error);
      throw error;
    }
  }

  /**
   * Desencripta datos sensibles recibidos
   */
  public async decryptData(encryptedData: string): Promise<string> {
    try {
      return await ipcRenderer.invoke("security:decryptData", {
        encryptedData,
      });
    } catch (error) {
      console.error("Error al desencriptar datos:", error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const rendererSecurity = RendererSecurity.getInstance();
