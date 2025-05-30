const { BrowserWindow, app, screen, shell, dialog } = require("electron");
const { join, resolve } = require("path");
const ElectronStore = require("electron-store");
const { MAIN_WINDOW_CONFIG, isDevelopment } = require("../utils/constants.cjs");
const { securityManager } = require("../security/security-manager.cjs");
const { ErrorWindow } = require("./error-window.cjs");

// Gestor centralizado para la creación y manejo de ventanas de la aplicación
// Implementa el patrón Singleton para garantizar una única instancia
function WindowManager() {
  if (!(this instanceof WindowManager)) return new WindowManager();
  this.windows = new Map();
  this.store = new ElectronStore({ name: "window-state" });
  this.securityManager = securityManager;
  this.isQuitting = false;

  // Controlar el evento before-quit para no cerrar aplicación al cerrar ventanas
  app.on("before-quit", () => {
    this.isQuitting = true;
  });
}

WindowManager._instance = null;

WindowManager.getInstance = function () {
  if (!WindowManager._instance) {
    WindowManager._instance = new WindowManager();
  }
  return WindowManager._instance;
};

WindowManager.prototype.createMainWindow = async function () {
  const windowId = "main";
  console.log(`[WINDOW] Intentando crear ventana principal (${windowId})`);
  
  // Si la ventana ya existe, restaurarla y enfocarla
  if (this.windows.has(windowId)) {
    try {
      const existingWindow = this.windows.get(windowId);
      console.log(`[WINDOW] Ventana existente encontrada (ID: ${existingWindow.id})`);
      
      if (!existingWindow.isDestroyed()) {
        if (existingWindow.isMinimized()) {
          console.log('[WINDOW] Restaurando ventana minimizada');
          existingWindow.restore();
        }
        console.log('[WINDOW] Enfocando ventana existente');
        existingWindow.focus();
        return existingWindow;
      } else {
        console.log('[WINDOW] Ventana existente está destruida, creando una nueva');
        this.windows.delete(windowId);
      }
    } catch (error) {
      console.error('[WINDOW] Error al manejar ventana existente:', error);
      this.windows.delete(windowId);
    }
  }
  try {
    console.log('[WINDOW] Obteniendo estado de la ventana');
    const windowState = this.getWindowState();
    
    console.log('[WINDOW] Creando instancia de BrowserWindow');
    const window = new BrowserWindow({
      ...MAIN_WINDOW_CONFIG,
      ...windowState,
      show: false, // No mostrar hasta que esté lista
      icon: join(app.getAppPath(), "renderer", "favicon_b.ico"),
      backgroundColor: "#F5F5F5",
      webPreferences: {
        ...MAIN_WINDOW_CONFIG.webPreferences,
        preload: resolve(__dirname, "../../dist/preload/preload.cjs"),
        devTools: isDevelopment,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        nodeIntegrationInWorker: false,
        webviewTag: false,
      },
    });

    // Configurar manejador de errores de carga
    window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`[WINDOW] Error al cargar la ventana (${errorCode}): ${errorDescription}`);
      this.showErrorWindow(`Error al cargar la aplicación: ${errorDescription}`);
    });

    // Configurar evento para mostrar la ventana cuando esté lista
    window.once('ready-to-show', () => {
      console.log('[WINDOW] Ventana lista para mostrarse');
      try {
        window.show();
        if (windowState.isMaximized) {
          console.log('[WINDOW] Maximizando ventana');
          window.maximize();
        }
        window.focus();
        console.log(`[WINDOW] Ventana mostrada correctamente (ID: ${window.id})`);
      } catch (showError) {
        console.error('[WINDOW] Error al mostrar la ventana:', showError);
        this.showErrorWindow('Error al mostrar la ventana principal');
      }
    });

    // Forzar mostrar la ventana después de 5 segundos como respaldo
    const showTimeout = setTimeout(() => {
      if (!window.isDestroyed() && !window.isVisible()) {
        console.log('[WINDOW] Mostrando ventana (timeout)');
        window.show();
        window.focus();
      }
    }, 5000);

    // Configurar eventos de la ventana
    this.setupWindowEvents(window);

    // Cargar la URL de desarrollo o el archivo de producción
    try {
      if (process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        console.log('[WINDOW] Cargando URL de desarrollo:', process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL);
        await window.loadURL(process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL);
        if (isDevelopment) {
          window.webContents.openDevTools();
        }
      } else {
        const filePath = join(app.getAppPath(), "renderer", process.env.MAIN_WINDOW_VITE_NAME || 'index.html');
        console.log('[WINDOW] Cargando archivo:', filePath);
        await window.loadFile(filePath);
      }
    } catch (loadError) {
      console.error('[WINDOW] Error al cargar el contenido:', loadError);
      throw loadError;
    }

    // Limpiar el timeout cuando la ventana se muestre
    window.once('show', () => {
      clearTimeout(showTimeout);
      console.log('[WINDOW] Timeout de visibilidad limpiado');
    });

    // Configurar manejador para enlaces externos
    window.webContents.setWindowOpenHandler(({ url }) => {
      console.log(`[WINDOW] Intento de abrir URL: ${url}`);
      if (url.startsWith('http:') || url.startsWith('https:')) {
        shell.openExternal(url);
      }
      return { action: 'deny' };
    });

    // Registrar la ventana
    this.windows.set(windowId, window);
    console.log(`[WINDOW] Ventana principal creada (ID: ${window.id})`);
    
    return window;
    
  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    console.error('[WINDOW] Error crítico al crear la ventana principal:', error);
    
    // Mostrar ventana de error
    this.showErrorWindow(`Error crítico: ${errorMessage}`);
    
    // Si es un error de carga, intentar reiniciar la aplicación después de un tiempo
    if (errorMessage.includes('ERR_CONNECTION_REFUSED') || 
        errorMessage.includes('ERR_FILE_NOT_FOUND')) {
      console.log('Reintentando en 3 segundos...');
      setTimeout(() => {
        app.relaunch();
        app.exit(1);
      }, 3000);
    }
    
    throw error;
  }
};

WindowManager.prototype.createModalWindow = function (options) {
  options = options || {};
  const parentWindow = options.parent || this.getMainWindow();
  if (!parentWindow) {
    throw new Error(
      "No se pudo crear ventana modal: ventana principal no encontrada"
    );
  }
  const modalWindow = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    width: options.width || 600,
    height: options.height || 400,
    minWidth: options.minWidth || 400,
    minHeight: options.minHeight || 300,
    show: options.show !== undefined ? options.show : false,
    center: options.center !== undefined ? options.center : true,
    title: options.title || "PACTA",
    backgroundColor: options.backgroundColor || "#151A24",
    icon: options.icon || join(app.getAppPath(), "renderer", "favicon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: resolve(__dirname, "../../dist/preload/preload.cjs"),
      spellcheck: true,
      sandbox: true,
    },
  });
  const modalId = `modal-${modalWindow.id}`;
  this.windows.set(modalId, modalWindow);
  modalWindow.on("closed", () => {
    this.windows.delete(modalId);
  });
  console.info(`Ventana modal creada (${modalWindow.id})`);
  return modalWindow;
};

WindowManager.prototype.setupWindowEvents = function (window) {
  ["resize", "move"].forEach((event) => {
    window.on(event, () => {
      if (!window.isMaximized()) {
        const bounds = window.getBounds();
        this.saveWindowState({
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          isMaximized: false,
        });
      } else {
        this.saveWindowState({
          ...this.getWindowState(),
          isMaximized: true,
        });
      }
    });
  });
  window.on("close", (e) => {
    if (!this.isQuitting) {
      e.preventDefault();
      window.hide();
      return;
    }
    const bounds = window.getBounds();
    this.saveWindowState({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: window.isMaximized(),
    });
  });
  window.webContents.on(
    "did-fail-load",
    function (_, errorCode, errorDescription) {
      console.error("Window failed to load:", { errorCode, errorDescription });
    }
  );
};

WindowManager.prototype.getWindowState = function () {
  const defaultState = {
    width: MAIN_WINDOW_CONFIG.width,
    height: MAIN_WINDOW_CONFIG.height,
    isMaximized: false,
  };
  try {
    const savedState = this.store.get("mainWindow");
    if (!savedState) return defaultState;
    return this.ensureVisibleOnScreen(savedState);
  } catch (error) {
    console.error(
      "Error getting window state:",
      error && error.message ? error.message : String(error)
    );
    return defaultState;
  }
};

WindowManager.prototype.saveWindowState = function (state) {
  try {
    if (
      !state.width ||
      !state.height ||
      state.width < 200 ||
      state.height < 200
    ) {
      console.error("Intento de guardar un estado de ventana inválido", state);
      return;
    }
    this.store.set("mainWindow", state);
  } catch (error) {
    console.error(
      "Error saving window state:",
      error && error.message ? error.message : String(error)
    );
  }
};

WindowManager.prototype.ensureVisibleOnScreen = function (state) {
  const displaySize = screen.getPrimaryDisplay().workAreaSize;
  const width = displaySize.width;
  const height = displaySize.height;
  const result = Object.assign({}, state);
  if (typeof state.x === "number" && typeof state.y === "number") {
    const displays = screen.getAllDisplays();
    const isVisibleOnDisplay = displays.some(function (display) {
      const displayBounds = display.bounds;
      return (
        state.x + state.width > displayBounds.x &&
        state.x < displayBounds.x + displayBounds.width &&
        state.y + state.height > displayBounds.y &&
        state.y < displayBounds.y + displayBounds.height
      );
    });
    if (!isVisibleOnDisplay) {
      delete result.x;
      delete result.y;
    }
  }
  if (result.width > width) result.width = MAIN_WINDOW_CONFIG.width;
  if (result.height > height) result.height = MAIN_WINDOW_CONFIG.height;
  return result;
};

WindowManager.prototype.getMainWindow = function () {
  return this.windows.get("main") || null;
};

WindowManager.prototype.getWindowCount = function () {
  return this.windows.size;
};

/**
 * Muestra una ventana de error al usuario
 * @param {string} message - Mensaje de error a mostrar
 */
WindowManager.prototype.showErrorWindow = function (message) {
  console.error('[WINDOW] Mostrando ventana de error:', message);
  
  try {
    // Primero intentar usar la ventana principal si existe
    const mainWindow = this.getMainWindow();
    
    // Si hay una ventana principal y no está destruida, usarla para mostrar el error
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        mainWindow.webContents.send('show-error-dialog', {
          title: 'Error en la aplicación',
          message: message
        });
        mainWindow.show();
        mainWindow.focus();
        return;
      } catch (e) {
        console.error('[WINDOW] Error al usar ventana principal para mostrar error:', e);
      }
    }
    
    // Si no se pudo usar la ventana principal, crear una nueva ventana de error
    console.log('[WINDOW] Creando ventana de error dedicada');
    const errorWindow = new ErrorWindow(mainWindow);
    errorWindow.show(message);
    
  } catch (error) {
    console.error('[WINDOW] Error al mostrar la ventana de error:', error);
    
    // Si todo falla, mostrar un diálogo nativo
    dialog.showErrorBox(
      'Error en la aplicación',
      `No se pudo mostrar la interfaz de error. Detalles:\n\n${message || 'Error desconocido'}`
    );
  }
};

WindowManager.prototype.closeAllWindows = function () {
  BrowserWindow.getAllWindows().forEach(function (window) {
    window.close();
  });
};

module.exports = { WindowManager };
