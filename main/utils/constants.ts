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

// IPC Channels
export const IPC_CHANNELS = {
  // App management
  APP_QUIT: 'app:quit',
  APP_MINIMIZE: 'app:minimize',
  APP_MAXIMIZE: 'app:maximize',
  
  // Contracts
  CONTRACTS_GET_ALL: 'contracts:getAll',
  CONTRACTS_GET_BY_ID: 'contracts:getById',
  CONTRACTS_CREATE: 'contracts:create',
  CONTRACTS_UPDATE: 'contracts:update',
  CONTRACTS_DELETE: 'contracts:delete',
  
  // Supplements
  SUPPLEMENTS_GET_ALL: 'supplements:getAll',
  SUPPLEMENTS_GET_BY_CONTRACT: 'supplements:getByContract',
  SUPPLEMENTS_GET_BY_ID: 'supplements:getById',
  SUPPLEMENTS_CREATE: 'supplements:create',
  SUPPLEMENTS_UPDATE: 'supplements:update',
  SUPPLEMENTS_APPROVE: 'supplements:approve',
  SUPPLEMENTS_DELETE: 'supplements:delete',
  
  // Users
  USERS_LOGIN: 'users:login',
  USERS_LOGOUT: 'users:logout',
  
  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set'
}; 