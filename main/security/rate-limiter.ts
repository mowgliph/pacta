import { RateLimiterMemory } from "rate-limiter-flexible";
import { logger } from "../utils/logger";

/**
 * Servicio de limitación de tasa para prevenir ataques de fuerza bruta
 * y proteger endpoints sensibles como la autenticación.
 */
export class RateLimiter {
  private static instance: RateLimiter;
  private loginLimiter: RateLimiterMemory;
  private apiLimiter: RateLimiterMemory;

  private constructor() {
    // Limiter para intentos de login (más restrictivo)
    this.loginLimiter = new RateLimiterMemory({
      points: 5, // 5 intentos
      duration: 60 * 15, // por 15 minutos
      blockDuration: 60 * 30, // bloqueo por 30 minutos
    });

    // Limiter para API general (menos restrictivo)
    this.apiLimiter = new RateLimiterMemory({
      points: 100, // 100 solicitudes
      duration: 60, // por minuto
    });
  }

  /**
   * Obtiene la instancia única del RateLimiter (Singleton)
   */
  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Verifica si un intento de login debe ser limitado
   * @param key Identificador único (IP, email o combinación)
   * @returns Promise<boolean> true si está permitido, false si debe ser bloqueado
   */
  public async checkLoginAttempt(key: string): Promise<boolean> {
    try {
      await this.loginLimiter.consume(key);
      return true;
    } catch (error) {
      // Si hay error, significa que excedió el límite
      const resetTime = new Date(Date.now() + error.msBeforeNext);
      logger.warn(
        `Intento de login bloqueado para ${key}. Desbloqueo: ${resetTime.toLocaleString()}`
      );
      return false;
    }
  }

  /**
   * Registra un intento de login exitoso y resetea el contador
   * @param key Identificador único (IP, email o combinación)
   */
  public async loginSuccessful(key: string): Promise<void> {
    try {
      await this.loginLimiter.delete(key);
      logger.info(
        `Contador de intentos reseteado para ${key} tras login exitoso`
      );
    } catch (error) {
      logger.error(`Error al resetear contador para ${key}:`, error);
    }
  }

  /**
   * Verifica si una solicitud a la API debe ser limitada
   * @param key Identificador único (IP, ruta, etc)
   * @returns Promise<boolean> true si está permitido, false si debe ser bloqueado
   */
  public async checkApiRequest(key: string): Promise<boolean> {
    try {
      await this.apiLimiter.consume(key);
      return true;
    } catch (error) {
      const resetTime = new Date(Date.now() + error.msBeforeNext);
      logger.warn(
        `Solicitud API bloqueada para ${key}. Desbloqueo: ${resetTime.toLocaleString()}`
      );
      return false;
    }
  }
}

// Exportar instancia global
export const rateLimiter = RateLimiter.getInstance();
