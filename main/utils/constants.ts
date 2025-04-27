import { app } from 'electron';
import path from 'path';

// Environment
export const isDevelopment = process.env.NODE_ENV !== 'production';
export const isProduction = process.env.NODE_ENV === 'production';

// Paths
export const APP_PATH = app.getAppPath();
export const USER_DATA_PATH = app.getPath('userData');
export const PRELOAD_PATH = path.join(__dirname, '../preload/preload.js');

// Window configuration
export const MAIN_WINDOW_CONFIG = {
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  show: false, // No mostrar hasta que esté listo
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    preload: PRELOAD_PATH
  }
};

// Security
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'"],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};