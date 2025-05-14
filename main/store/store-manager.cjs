const ElectronStore = require("electron-store");
const jwt = require("jsonwebtoken");

// Store principal para la aplicación
const appStore = new ElectronStore({
  name: "app-store",
  encryptionKey: process.env.STORE_ENCRYPTION_KEY || "pacta-secure-key",
  clearInvalidConfig: true,
});

// Inicializar valores por defecto si no existen
if (!appStore.has("settings")) {
  appStore.set("settings", {
    theme: "light",
    notificationsEnabled: true,
    notificationDays: 7,
  });
  console.info("Configuración por defecto inicializada");
}

exports.getTheme = function () {
  return appStore.get("settings.theme", "light");
};

exports.setTheme = function (theme) {
  appStore.set("settings.theme", theme);
  console.info(`Tema cambiado a: ${theme}`);
};

exports.getNotificationsEnabled = function () {
  return appStore.get("settings.notificationsEnabled", true);
};

exports.setNotificationsEnabled = function (enabled) {
  appStore.set("settings.notificationsEnabled", enabled);
};

exports.getNotificationDays = function () {
  return appStore.get("settings.notificationDays", 7);
};

exports.setNotificationDays = function (days) {
  appStore.set("settings.notificationDays", days);
};

exports.getAuthToken = function () {
  const token = appStore.get("auth.token");
  if (!token || typeof token !== "string") {
    return null;
  }
  const expiresAt = appStore.get("auth.expiresAt");
  if (expiresAt && typeof expiresAt === "string") {
    try {
      const expiryDate = new Date(expiresAt);
      if (expiryDate < new Date()) {
        console.info("Token expirado según fecha almacenada, limpiando");
        exports.clearAuth();
        return null;
      }
    } catch (error) {
      console.error("Error al parsear fecha de expiración del token:", error);
      return token;
    }
  }
  return token;
};

exports.setAuthToken = function (token) {
  try {
    const decoded = jwt.decode(token);
    let expiresAt = undefined;
    if (decoded && typeof decoded.exp === "number") {
      try {
        expiresAt = new Date(decoded.exp * 1000).toISOString();
      } catch (error) {
        console.error("Error al convertir exp a fecha:", error);
      }
    }
    const userId =
      decoded && typeof decoded.id === "string" ? decoded.id : undefined;
    appStore.set("auth", {
      token,
      userId,
      expiresAt,
    });
    console.info("Token de autenticación almacenado correctamente");
    if (expiresAt && typeof expiresAt === "string") {
      try {
        const expiryTime = new Date(expiresAt);
        const timeToExpiry = expiryTime.getTime() - Date.now();
        const hoursToExpiry = Math.round(timeToExpiry / (1000 * 60 * 60));
        console.info(`Token válido por aproximadamente ${hoursToExpiry} horas`);
      } catch (error) {
        console.error(
          "Error al calcular tiempo de expiración del token:",
          error
        );
      }
    }
  } catch (error) {
    console.error("Error al almacenar token de autenticación:", error);
  }
};

exports.getAuthUserId = function () {
  const userId = appStore.get("auth.userId");
  return userId && typeof userId === "string" ? userId : null;
};

exports.clearAuth = function () {
  appStore.delete("auth");
  console.info("Información de autenticación eliminada");
};

exports.clearStore = function () {
  appStore.clear();
  console.info("Configuración completa eliminada");
};
