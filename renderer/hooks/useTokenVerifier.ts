import { useState, useCallback, useEffect, useMemo } from "react";
import { jwtVerify, JWTVerifyResult } from "jose";
import { useAuth } from "./useAuth";
import { getEnvVariable } from '../lib/utils';

// Caché global para resultados de verificación (evita múltiples verificaciones del mismo token)
const tokenVerificationCache = new Map<string, {
  result: boolean;
  payload: any;
  expiresAt: number | null;
  timestamp: number;
}>();

// Tiempo máximo de validez de la caché (5 minutos)
const CACHE_MAX_AGE = 5 * 60 * 1000;

interface TokenVerifierOptions {
  onExpired?: () => void;
  refreshInterval?: number; // en milisegundos
  autoRefresh?: boolean;
  cacheResults?: boolean; // Opción para habilitar/deshabilitar caché
  cacheMaxAge?: number; // Personalizar el tiempo de validez de la caché en ms
}

interface UseTokenVerifierResult {
  isValid: boolean;
  isVerifying: boolean;
  error: Error | null;
  expiresAt: number | null;
  payload: any | null;
  verifyToken: (token: string) => Promise<boolean>;
  timeRemaining: number | null; // Tiempo restante en ms hasta expiración
  isExpiringSoon: boolean; // Indica si el token expira pronto (< 5 min)
}

/**
 * Hook optimizado para verificación de tokens JWT
 * 
 * Características:
 * - Verificación eficiente mediante Web Crypto API
 * - Caché de resultados para evitar verificaciones redundantes
 * - Manejo automático de tokens expirados
 * - Opción de refresco automático
 * - Cálculo optimizado de tiempo restante
 */
export function useTokenVerifier({
  onExpired,
  refreshInterval = 60000, // 1 minuto por defecto
  autoRefresh = false,
  cacheResults = true,
  cacheMaxAge = CACHE_MAX_AGE,
}: TokenVerifierOptions = {}): UseTokenVerifierResult {
  const { token: authToken } = useAuth();
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [payload, setPayload] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(authToken);
  const [lastVerified, setLastVerified] = useState<number>(0);

  // Función memoizada para obtener la clave secreta
  const getSecretKey = useMemo(() => {
    // Solo creamos la función una vez
    return async (): Promise<Uint8Array> => {
      // Obtener el JWT_SECRET desde una variable de entorno o servicio seguro
      // Nunca usar valores por defecto para secretos de producción
      const jwtSecret = await getEnvVariable('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT_SECRET no encontrado en el entorno');
      }
      
      const encoder = new TextEncoder();
      return encoder.encode(jwtSecret);
    };
  }, []);

  // Verificar si hay un resultado en caché para el token actual
  const getCachedResult = useCallback((tokenToCheck: string) => {
    if (!cacheResults) return null;
    
    const cachedData = tokenVerificationCache.get(tokenToCheck);
    if (!cachedData) return null;
    
    const now = Date.now();
    
    // Verificar si la caché ha expirado
    if (now - cachedData.timestamp > cacheMaxAge) {
      tokenVerificationCache.delete(tokenToCheck);
      return null;
    }
    
    // Verificar si el token ha expirado mientras estaba en caché
    if (cachedData.expiresAt && now >= cachedData.expiresAt) {
      tokenVerificationCache.delete(tokenToCheck);
      return null;
    }
    
    return cachedData;
  }, [cacheResults, cacheMaxAge]);

  // Función para verificar el token con caché optimizada
  const verifyToken = useCallback(async (newToken: string): Promise<boolean> => {
    if (!newToken) {
      setIsValid(false);
      setError(new Error('Token no proporcionado'));
      return false;
    }

    // Comprobar caché primero
    const cachedResult = getCachedResult(newToken);
    if (cachedResult) {
      setToken(newToken);
      setIsValid(cachedResult.result);
      setPayload(cachedResult.payload);
      setExpiresAt(cachedResult.expiresAt);
      setError(null);
      return cachedResult.result;
    }

    try {
      setIsVerifying(true);
      setToken(newToken);
      setError(null);

      const secretKey = await getSecretKey();
      const result: JWTVerifyResult = await jwtVerify(newToken, secretKey);

      if (result && result.payload) {
        const { exp, ...rest } = result.payload;
        
        // Verificar si el token ha expirado
        let expirationTime = null;
        let isTokenValid = true;
        
        if (exp) {
          expirationTime = exp as number * 1000; // Convertir a milisegundos
          setExpiresAt(expirationTime);
          
          const now = Date.now();
          if (now >= expirationTime) {
            isTokenValid = false;
            handleExpiredToken();
          }
        }
        
        setPayload(rest);
        setIsValid(isTokenValid);
        
        // Guardar resultado en caché
        if (cacheResults && isTokenValid) {
          tokenVerificationCache.set(newToken, {
            result: isTokenValid,
            payload: rest,
            expiresAt: expirationTime,
            timestamp: Date.now()
          });
        }
        
        // Actualizar timestamp de última verificación
        setLastVerified(Date.now());
        
        return isTokenValid;
      }

      setIsValid(false);
      return false;
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err : new Error('Error al verificar el token'));
      
      // Si el error es de expiración, manejar el token expirado
      if (err instanceof Error && err.message.includes('expired')) {
        handleExpiredToken();
      }
      
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [getSecretKey, getCachedResult, cacheResults]);

  const handleExpiredToken = useCallback(() => {
    // Limpiamos los estados
    setIsValid(false);
    setPayload(null);
    
    // Si se proporcionó un callback para manejar la expiración, lo ejecutamos
    if (onExpired) {
      onExpired();
    }
  }, [onExpired]);

  // Calcular tiempo restante hasta expiración
  const timeRemaining = useMemo(() => {
    if (!expiresAt) return null;
    const now = Date.now();
    return Math.max(0, expiresAt - now);
  }, [expiresAt]);

  // Determinar si el token expira pronto (< 5 minutos)
  const isExpiringSoon = useMemo(() => {
    if (!timeRemaining) return false;
    return timeRemaining < 5 * 60 * 1000;
  }, [timeRemaining]);

  // Sincronizar con el token de autenticación cuando cambie
  useEffect(() => {
    if (authToken !== token) {
      setToken(authToken);
    }
  }, [authToken, token]);

  // Verificar el token cuando cambia
  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token, verifyToken]);

  // Configurar verificación periódica optimizada
  useEffect(() => {
    if (!autoRefresh || !token || !refreshInterval) return;

    // Usamos verificación adaptativa: más frecuente si el token expira pronto
    const actualInterval = isExpiringSoon 
      ? Math.min(refreshInterval, 30000) // 30 segundos si expira pronto
      : refreshInterval;

    const intervalId = setInterval(() => {
      // Solo verificar si ha pasado suficiente tiempo desde la última verificación
      const now = Date.now();
      if (now - lastVerified > Math.min(refreshInterval / 2, 30000)) {
        verifyToken(token);
      }
    }, actualInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, token, verifyToken, isExpiringSoon, lastVerified]);

  // Limpiar tokens caducados de la caché globalmente (cada 5 minutos)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      tokenVerificationCache.forEach((value, key) => {
        if (now - value.timestamp > cacheMaxAge || 
           (value.expiresAt && now >= value.expiresAt)) {
          tokenVerificationCache.delete(key);
        }
      });
    }, 5 * 60 * 1000); // Cada 5 minutos

    return () => clearInterval(cleanupInterval);
  }, [cacheMaxAge]);

  return {
    isValid,
    isVerifying,
    error,
    expiresAt,
    payload,
    verifyToken,
    timeRemaining,
    isExpiringSoon
  };
} 