const { authService } = require("./auth-service.cjs");
const { permissionService } = require("./permission-service.cjs");
const { rateLimiter } = require("./rate-limiter.cjs");
const { securityManager } = require("./security-manager.cjs");

/**
 * Servicio integrado de seguridad que unifica los diferentes
 * componentes de seguridad de la aplicación (autenticación,
 * autorización, rate limiting, etc.)
 */
function SecurityService() {
  if (SecurityService._instance) {
    return SecurityService._instance;
  }
  SecurityService._instance = this;
}

SecurityService.prototype.initialize = function () {
  console.info("Inicializando servicios de seguridad...");
  // Asegurar que todas las instancias singleton estén inicializadas
  authService;
  permissionService;
  rateLimiter;
  securityManager;
  console.info("Servicios de seguridad inicializados correctamente");
};

SecurityService.prototype.login = async function (params) {
  const { email, ipAddress } = params;
  const rateLimitKey = `login:${email}:${ipAddress || "unknown"}`;
  const allowed = await rateLimiter.checkLoginAttempt(rateLimitKey);
  if (!allowed) {
    console.warn(`Intento de login bloqueado por rate limiting: ${email}`);
    throw new Error(
      "Demasiados intentos de inicio de sesión. Por favor, inténtelo más tarde."
    );
  }
  const result = await authService.login(params);
  await rateLimiter.loginSuccessful(rateLimitKey);
  return result;
};

SecurityService.prototype.checkPermission = async function (params) {
  const { userId, token, resource, action } = params;
  // Si se proporciona token, verificar permisos con el token
  if (token) {
    return permissionService.verifyTokenPermission(token, resource, action);
  }
  // Si se proporciona userId, verificar permisos con el ID
  if (userId) {
    return permissionService.hasPermission(userId, resource, action);
  }
  // Si no se proporciona ni token ni userId, denegar acceso
  console.warn("Intento de verificar permisos sin token ni userId");
  return false;
};

SecurityService.prototype.checkApiRateLimit = async function (key) {
  return rateLimiter.checkApiRequest(key);
};

SecurityService.prototype.generateCsrfToken = function (jwtToken) {
  return securityManager.generateCsrfTokenForSession(jwtToken);
};

SecurityService.prototype.verifyCsrfToken = function (jwtToken, csrfToken) {
  return securityManager.verifyCsrfToken(jwtToken, csrfToken);
};

SecurityService.prototype.registerDevice = function (userId, deviceId) {
  return securityManager.registerDevice(userId, deviceId);
};

SecurityService.prototype.invalidateUserSessions = function (userId) {
  authService.invalidateUserSessions(userId);
};

SecurityService.prototype.logout = async function (token) {
  return authService.logout(token);
};

// Exportar instancia global
const securityService = new SecurityService();
module.exports = { SecurityService, securityService };
