import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Mapa para almacenar los rate limiters por ruta
const limiters: Map<string, RateLimiterMemory> = new Map();

// Opciones por defecto
const defaultOptions = {
  points: 10,         // Número de puntos (peticiones)
  duration: 60,       // Período de tiempo en segundos
  blockDuration: 300, // Bloqueo de 5 minutos si se supera el límite
};

// Middleware para controlar el rate limiting
export const rateLimiter = (options: { 
  routePoints?: number;     // Puntos específicos para esta ruta
  routeDuration?: number;   // Duración específica para esta ruta
  routeKey?: string;        // Clave opcional para agrupar rutas
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Crear identificador único para la ruta
      const routeKey = options.routeKey || `${req.method}:${req.originalUrl}`;
      
      // Obtener limiter para esta ruta, o crear uno nuevo
      if (!limiters.has(routeKey)) {
        limiters.set(
          routeKey,
          new RateLimiterMemory({
            points: options.routePoints || defaultOptions.points,
            duration: options.routeDuration || defaultOptions.duration,
            blockDuration: defaultOptions.blockDuration,
          })
        );
      }
      
      const limiter = limiters.get(routeKey)!;
      
      // Identificar al cliente (usando IP + UserID si está disponible)
      const identifier = req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
      
      // Consumir un punto
      await limiter.consume(identifier);
      
      // Si llegamos aquí, la petición está permitida
      next();
    } catch (error) {
      if (error.remainingPoints === 0) {
        // Límite excedido
        return res.status(429).json({
          message: 'Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde.',
          retryAfter: Math.ceil(error.msBeforeNext / 1000) || 60,
        });
      }
      
      // Otro tipo de error
      next(error);
    }
  };
};

// Middleware especializado para operaciones sensibles o costosas
export const sensitiveRateLimiter = rateLimiter({
  routePoints: 5,       // Menos peticiones permitidas
  routeDuration: 60,    // En el mismo período de tiempo
});

// Middleware para operaciones de consulta
export const queryRateLimiter = rateLimiter({
  routePoints: 30,      // Más peticiones permitidas
  routeDuration: 60,    // En el mismo período
}); 