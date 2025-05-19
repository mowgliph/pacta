const { app } = require("electron");
const path = require("path");

// Environment
exports.isDevelopment = process.env.NODE_ENV !== "production";
exports.isProduction = process.env.NODE_ENV === "production";

// Paths
exports.APP_PATH = app.getAppPath();
exports.USER_DATA_PATH = app.getPath("userData");
exports.PRELOAD_PATH = path.resolve(
  __dirname,
  "../../dist/preload/preload.cjs"
);

// Window configuration
exports.MAIN_WINDOW_CONFIG = {
  width: parseInt(process.env.MAIN_WINDOW_WIDTH) || 1200,
  height: parseInt(process.env.MAIN_WINDOW_HEIGHT) || 800,
  minWidth: parseInt(process.env.MAIN_WINDOW_MIN_WIDTH) || 800,
  minHeight: parseInt(process.env.MAIN_WINDOW_MIN_HEIGHT) || 600,
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
