const crypto = require("crypto");
const { ipcMain, BrowserWindow, app } = require("electron");
const { promisify } = require("util");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const scryptAsync = promisify(crypto.scrypt);

// Función constructora para SecurityManager (reemplaza clase)
function SecurityManager() {
  if (SecurityManager.instance) {
    return SecurityManager.instance;
  }
  SecurityManager.instance = this;

  this.csrfTokens = new Map();
  this.knownDevices = new Map();
  this.sessionInvalidationCallbacks = new Map();
  this.secretKeyCache = new Map();
  this.envFilePath = path.join(app.getPath("userData"), ".env.secrets");
  this.secureProtocols = ["https:", "wss:"];
  this.allowedOrigins = ["file://", "app://"];

  this.setupListeners();
  this.startCleanupTasks();
  this.setupSecurityHeaders();
}

// Métodos de SecurityManager
SecurityManager.prototype.setupSecurityHeaders = function () {
  app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      if (!this.isAllowedOrigin(parsedUrl.origin)) {
        event.preventDefault();
        console.warn(
          `Navegación bloqueada a origen no permitido: ${parsedUrl.origin}`
        );
      }
    });

    contents.setWindowOpenHandler(({ url }) => {
      const parsedUrl = new URL(url);
      if (!this.isAllowedOrigin(parsedUrl.origin)) {
        console.warn(
          `Apertura de ventana bloqueada a origen no permitido: ${parsedUrl.origin}`
        );
        return { action: "deny" };
      }
      return { action: "allow" };
    });
  });
};

SecurityManager.prototype.isAllowedOrigin = function (origin) {
  return this.allowedOrigins.some((allowed) => origin.startsWith(allowed));
};

SecurityManager.prototype.setupSecurity = function () {
  console.info("Configurando opciones de seguridad...");
  app.on("ready", () => {
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'", // Mantenemos unsafe-inline solo para estilos
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-src 'none'",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.session.webRequest.onHeadersReceived(
        (details, callback) => {
          callback({
            responseHeaders: {
              ...details.responseHeaders,
              "Content-Security-Policy": [csp],
              "X-Content-Type-Options": ["nosniff"],
              "X-Frame-Options": ["DENY"],
              "X-XSS-Protection": ["1; mode=block"],
              "Referrer-Policy": ["strict-origin-when-cross-origin"],
              "Permissions-Policy": [
                "camera=(), microphone=(), geolocation=()",
              ],
            },
          });
        }
      );
    });
  });
};

SecurityManager.prototype.setupListeners = function () {
  ipcMain.handle("security:verifyCsrfToken", (event, { token, csrfToken }) => {
    return this.verifyCsrfToken(token, csrfToken);
  });

  ipcMain.handle("security:generateCsrfToken", (event, { token }) => {
    return this.generateCsrfTokenForSession(token);
  });

  ipcMain.handle("security:registerDevice", (event, { userId, deviceId }) => {
    return this.registerDevice(userId, deviceId);
  });

  ipcMain.handle("security:verifyDevice", (event, { userId, deviceId }) => {
    return this.verifyDevice(userId, deviceId);
  });
};

SecurityManager.prototype.startCleanupTasks = function () {
  setInterval(() => this.cleanupExpiredCsrfTokens(), 60 * 60 * 1000);
  setInterval(() => this.cleanupInactiveDevices(30), 24 * 60 * 60 * 1000);
};

SecurityManager.prototype.generateCsrfTokenForSession = function (jwtToken) {
  try {
    if (!jwtToken)
      throw new Error("Token JWT requerido para generar CSRF token");
    const sessionId = this.createSessionIdFromJwt(jwtToken);
    const csrfToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    this.csrfTokens.set(sessionId, { token: csrfToken, expiresAt });
    console.info(
      `CSRF token generado para sesión: ${sessionId.substring(0, 8)}...`
    );
    return { csrfToken };
  } catch (error) {
    console.error("Error al generar CSRF token:", error);
    throw error;
  }
};

SecurityManager.prototype.verifyCsrfToken = function (jwtToken, csrfToken) {
  try {
    if (!jwtToken || !csrfToken) return false;
    const sessionId = this.createSessionIdFromJwt(jwtToken);
    const storedData = this.csrfTokens.get(sessionId);
    if (!storedData) {
      console.warn(
        `CSRF token no encontrado para sesión: ${sessionId.substring(0, 8)}...`
      );
      return false;
    }
    if (storedData.expiresAt < Date.now()) {
      this.csrfTokens.delete(sessionId);
      console.warn(
        `CSRF token expirado para sesión: ${sessionId.substring(0, 8)}...`
      );
      return false;
    }
    const isValid = csrfToken === storedData.token;
    if (!isValid)
      console.warn(
        `CSRF token inválido para sesión: ${sessionId.substring(0, 8)}...`
      );
    return isValid;
  } catch (error) {
    console.error("Error al verificar CSRF token:", error);
    return false;
  }
};

SecurityManager.prototype.registerDevice = function (userId, deviceId) {
  try {
    if (!userId || !deviceId) return { success: false };
    this.knownDevices.set(deviceId, { userId, lastActive: Date.now() });
    console.info(
      `Dispositivo registrado para usuario ${userId}: ${deviceId.substring(
        0,
        8
      )}...`
    );
    return { success: true };
  } catch (error) {
    console.error("Error al registrar dispositivo:", error);
    return { success: false };
  }
};

SecurityManager.prototype.verifyDevice = function (userId, deviceId) {
  try {
    if (!userId || !deviceId) return { valid: false, trusted: false };
    const device = this.knownDevices.get(deviceId);
    if (!device) return { valid: true, trusted: false };
    device.lastActive = Date.now();
    this.knownDevices.set(deviceId, device);
    const isTrusted = device.userId === userId;
    return { valid: true, trusted: isTrusted };
  } catch (error) {
    console.error("Error al verificar dispositivo:", error);
    return { valid: false, trusted: false };
  }
};

SecurityManager.prototype.invalidateUserSessions = function (
  userId,
  currentDeviceId
) {
  const devices = Array.from(this.knownDevices.entries());
  for (const [deviceId, device] of devices) {
    if (device.userId === userId && deviceId !== currentDeviceId) {
      this.triggerSessionInvalidationForUser(userId);
      this.knownDevices.delete(deviceId);
    }
  }
};

SecurityManager.prototype.onSessionInvalidation = function (userId, callback) {
  if (!this.sessionInvalidationCallbacks.has(userId)) {
    this.sessionInvalidationCallbacks.set(userId, []);
  }
  this.sessionInvalidationCallbacks.get(userId).push(callback);
};

SecurityManager.prototype.triggerSessionInvalidationForUser = function (
  userId
) {
  const callbacks = this.sessionInvalidationCallbacks.get(userId) || [];
  for (const callback of callbacks) {
    try {
      callback();
    } catch (error) {
      console.error(
        `Error al ejecutar callback de invalidación para usuario ${userId}:`,
        error
      );
    }
  }
};

SecurityManager.prototype.cleanupExpiredCsrfTokens = function () {
  const now = Date.now();
  let count = 0;
  const tokens = Array.from(this.csrfTokens.entries());
  for (const [sessionId, data] of tokens) {
    if (data.expiresAt < now) {
      this.csrfTokens.delete(sessionId);
      count++;
    }
  }
  if (count > 0) {
    console.info(
      `Limpieza de tokens CSRF: ${count} tokens expirados eliminados`
    );
  }
};

SecurityManager.prototype.cleanupInactiveDevices = function (maxDaysInactive) {
  const maxInactiveTime = Date.now() - maxDaysInactive * 24 * 60 * 60 * 1000;
  let count = 0;
  const devices = Array.from(this.knownDevices.entries());
  for (const [deviceId, data] of devices) {
    if (data.lastActive < maxInactiveTime) {
      this.knownDevices.delete(deviceId);
      count++;
    }
  }
  if (count > 0) {
    console.info(
      `Limpieza de dispositivos: ${count} dispositivos inactivos eliminados`
    );
  }
};

SecurityManager.prototype.createSessionIdFromJwt = function (jwt) {
  return crypto.createHash("sha256").update(jwt).digest("hex");
};

SecurityManager.prototype.getJwtSecret = function () {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET no está configurado");
  return jwtSecret;
};

// Instancia única
const securityManager = new SecurityManager();

// Función constructora para SecurityService
function SecurityService() {
  if (SecurityService.instance) {
    return SecurityService.instance;
  }
  SecurityService.instance = this;

  this.secretKeyCache = new Map();
  this.envFilePath = path.join(app.getPath("userData"), ".env.secrets");
  this.loadEnvironmentVariables();
}

// Métodos de SecurityService
SecurityService.prototype.loadEnvironmentVariables = function () {
  if (fs.existsSync(this.envFilePath)) {
    const envConfig = dotenv.parse(fs.readFileSync(this.envFilePath));
    for (const key in envConfig) {
      process.env[key] = envConfig[key];
    }
  } else {
    this.generateAndSaveSecrets();
  }
};

SecurityService.prototype.generateAndSaveSecrets = function () {
  const secrets = {
    JWT_SECRET: this.generateSecureRandomString(32),
    ENCRYPTION_KEY: this.generateSecureRandomString(32),
    DB_ENCRYPTION_KEY: this.generateSecureRandomString(32),
    API_KEY_SALT: this.generateSecureRandomString(16),
  };

  let fileContent = "";
  for (const [key, value] of Object.entries(secrets)) {
    process.env[key] = value;
    fileContent += `${key}=${value}\n`;
  }

  const dir = path.dirname(this.envFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(this.envFilePath, fileContent, { mode: 0o600 });
};

SecurityService.prototype.generateSecureRandomString = function (length = 32) {
  return crypto.randomBytes(length).toString("hex");
};

SecurityService.prototype.generateUUID = function () {
  return uuidv4();
};

SecurityService.prototype.getJwtSecret = function () {
  const cachedSecret = this.secretKeyCache.get("JWT_SECRET");
  if (cachedSecret) return cachedSecret;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret)
    throw new Error("JWT Secret no encontrado en variables de entorno");
  this.secretKeyCache.set("JWT_SECRET", jwtSecret);
  return jwtSecret;
};

SecurityService.prototype.getEncryptionKey = function () {
  const cachedKey = this.secretKeyCache.get("ENCRYPTION_KEY");
  if (cachedKey) return cachedKey;
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey)
    throw new Error(
      "Clave de encriptación no encontrada en variables de entorno"
    );
  this.secretKeyCache.set("ENCRYPTION_KEY", encryptionKey);
  return encryptionKey;
};

SecurityService.prototype.hashPassword = async function (password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
};

SecurityService.prototype.verifyPassword = async function (
  storedPassword,
  suppliedPassword
) {
  const [salt, hashedPassword] = storedPassword.split(":");
  const derivedKey = await scryptAsync(suppliedPassword, salt, 64);
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  return crypto.timingSafeEqual(derivedKey, hashedPasswordBuf);
};

SecurityService.prototype.clearSecretCache = function () {
  this.secretKeyCache.clear();
};

// Funciones de utilidad
function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;") // Escapar & primero para no interferir con otros reemplazos
    .replace(/</g, "&lt;") // Convertir < a entidad HTML
    .replace(/>/g, "&gt;") // Convertir > a entidad HTML
    .replace(/"/g, "&quot;") // Convertir " a entidad HTML
    .replace(/'/g, "&#39;") // Convertir ' a entidad HTML
    .replace(/`/g, "&#96;") // Escapar backticks para prevenir template strings
    .trim();
}

function sanitizeFileName(fileName) {
  if (typeof fileName !== "string") return "";
  return fileName
    .replace(/\.\./g, "")
    .replace(/[/\\?%*:|"<>]/g, "_")
    .trim();
}

// Exportaciones
module.exports = { SecurityManager, securityManager };
