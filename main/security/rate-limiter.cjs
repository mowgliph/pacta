const { RateLimiterMemory } = require("rate-limiter-flexible");

/**
 * Servicio de limitación de tasa para prevenir ataques de fuerza bruta
 * y proteger endpoints sensibles como la autenticación.
 */
class RateLimiter {
  // Instancia única (Singleton)
  static instance;

  constructor() {
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
   * @returns {RateLimiter}
   */
  static getInstance() {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Verifica si un intento de login debe ser limitado
   * @param {string} key Identificador único (IP, email o combinación)
   * @returns {Promise<boolean>} true si está permitido, false si debe ser bloqueado
   */
  async checkLoginAttempt(key) {
    try {
      await this.loginLimiter.consume(key);
      return true;
    } catch (error) {
      let resetTime = new Date();
      if (
        error &&
        typeof error === "object" &&
        "msBeforeNext" in error &&
        typeof error.msBeforeNext === "number"
      ) {
        resetTime = new Date(Date.now() + error.msBeforeNext);
      }
      console.warn(
        `Intento de login bloqueado para ${key}. Desbloqueo: ${resetTime.toLocaleString()}`
      );
      return false;
    }
  }

  /**
   * Registra un intento de login exitoso y resetea el contador
   * @param {string} key Identificador único (IP, email o combinación)
   */
  async loginSuccessful(key) {
    try {
      await this.loginLimiter.delete(key);
      console.info(
        `Contador de intentos reseteado para ${key} tras login exitoso`
      );
    } catch (error) {
      console.error(`Error al resetear contador para ${key}:`, error);
    }
  }

  /**
   * Verifica si una solicitud a la API debe ser limitada
   * @param {string} key Identificador único (IP, ruta, etc)
   * @returns {Promise<boolean>} true si está permitido, false si debe ser bloqueado
   */
  async checkApiRequest(key) {
    try {
      await this.apiLimiter.consume(key);
      return true;
    } catch (error) {
      let resetTime = new Date();
      if (
        error &&
        typeof error === "object" &&
        "msBeforeNext" in error &&
        typeof error.msBeforeNext === "number"
      ) {
        resetTime = new Date(Date.now() + error.msBeforeNext);
      }
      console.warn(
        `Solicitud API bloqueada para ${key}. Desbloqueo: ${resetTime.toLocaleString()}`
      );
      return false;
    }
  }
}

// Exportar instancia global
const rateLimiter = RateLimiter.getInstance();

module.exports = { RateLimiter, rateLimiter };
