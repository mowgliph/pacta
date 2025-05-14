const { BrowserWindow, app, screen, shell } = require("electron");
const { join, resolve } = require("path");
const ElectronStore = require("electron-store");
const { MAIN_WINDOW_CONFIG, isDevelopment } = require("../utils/constants.cjs");
const { logger } = require("../utils/logger.cjs");
const { SecurityManager } = require("../security/security-manager.cjs");

// Gestor centralizado para la creación y manejo de ventanas de la aplicación
// Implementa el patrón Singleton para garantizar una única instancia
function WindowManager() {
  if (!(this instanceof WindowManager)) return new WindowManager();
  this.windows = new Map();
  this.store = new ElectronStore({ name: "window-state" });
  this.securityManager = SecurityManager.getInstance();
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
  if (this.windows.has(windowId)) {
    const existingWindow = this.windows.get(windowId);
    if (existingWindow.isMinimized()) existingWindow.restore();
    existingWindow.focus();
    return existingWindow;
  }
  try {
    const windowState = this.getWindowState();
    const window = new BrowserWindow({
      ...MAIN_WINDOW_CONFIG,
      ...windowState,
      icon: join(app.getAppPath(), "renderer", "public", "images", "icon.ico"),
      backgroundColor: "#F5F5F5",
      webPreferences: {
        ...MAIN_WINDOW_CONFIG.webPreferences,
        preload:
          process.env.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY ||
          resolve(__dirname, "../../dist/preload/preload.js"),
        devTools: isDevelopment,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });
    if (process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      await window.loadURL(process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL);
      window.webContents.openDevTools();
    } else {
      await window.loadFile(
        join(
          app.getAppPath(),
          "renderer",
          process.env.MAIN_WINDOW_VITE_NAME || "index.html",
          "index.html"
        )
      );
    }
    this.setupWindowEvents(window);
    window.once("ready-to-show", () => {
      window.show();
      if (windowState.isMaximized) {
        window.maximize();
      }
    });
    window.webContents.setWindowOpenHandler(function (data) {
      const url = data.url;
      if (url.startsWith("http:") || url.startsWith("https:")) {
        shell.openExternal(url);
      }
      return { action: "deny" };
    });
    this.windows.set(windowId, window);
    logger.info(`Ventana principal creada (${window.id})`);
    return window;
  } catch (error) {
    logger.error(
      "Error creating main window:",
      error && error.message ? error.message : String(error)
    );
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
    icon: options.icon || join(app.getAppPath(), "build", "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: resolve(__dirname, "../../dist/preload/preload.js"),
      spellcheck: true,
      sandbox: true,
    },
  });
  const modalId = `modal-${modalWindow.id}`;
  this.windows.set(modalId, modalWindow);
  modalWindow.on("closed", () => {
    this.windows.delete(modalId);
  });
  logger.info(`Ventana modal creada (${modalWindow.id})`);
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
      logger.error("Window failed to load:", { errorCode, errorDescription });
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
    logger.error(
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
      logger.error("Intento de guardar un estado de ventana inválido", state);
      return;
    }
    this.store.set("mainWindow", state);
  } catch (error) {
    logger.error(
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
  return BrowserWindow.getAllWindows().length;
};

WindowManager.prototype.closeAllWindows = function () {
  BrowserWindow.getAllWindows().forEach(function (window) {
    window.close();
  });
};

exports.WindowManager = WindowManager;
