const { app } = require("electron");
const path = require("path");

// Environment
exports.isDevelopment = process.env.NODE_ENV !== "production";
exports.isProduction = process.env.NODE_ENV === "production";

// Paths
exports.APP_PATH = app.getAppPath();
exports.USER_DATA_PATH = app.getPath("userData");
exports.PRELOAD_PATH =
  process.env.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY ||
  path.join(__dirname, "../preload/preload.js");

// Window configuration
exports.MAIN_WINDOW_CONFIG = {
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  show: false, // No mostrar hasta que esté listo
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    preload: exports.PRELOAD_PATH,
  },
};

// Security
exports.CSP_POLICY = {
  "default-src": ["'self'"],
  "script-src": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https:"],
  "connect-src": ["'self'"],
  "font-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};
