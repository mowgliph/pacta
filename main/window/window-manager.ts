import { BrowserWindow, app, screen, shell } from "electron";
import { join, resolve } from "path";
import Store from "electron-store";
import { MAIN_WINDOW_CONFIG, isDevelopment } from "../utils/constants";
import { logger } from "../utils/logger";
import { SecurityManager } from "../security/security-manager";

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

interface WindowOptions {
  title?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  show?: boolean;
  center?: boolean;
  modal?: boolean;
  parent?: BrowserWindow;
  backgroundColor?: string;
  icon?: string;
}

/**
 * Gestor centralizado para la creación y manejo de ventanas de la aplicación
 * Implementa el patrón Singleton para garantizar una única instancia
 */
export class WindowManager {
  private static instance: WindowManager;
  private windows: Map<string, BrowserWindow> = new Map();
  private store: Store;
  private securityManager: SecurityManager;
  private isQuitting: boolean = false;

  private constructor() {
    this.store = new Store({ name: "window-state" });
    this.securityManager = SecurityManager.getInstance();

    // Controlar el evento before-quit para no cerrar aplicación al cerrar ventanas
    app.on("before-quit", () => {
      this.isQuitting = true;
    });
  }

  /**
   * Obtiene la instancia única del WindowManager (Singleton)
   */
  public static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  /**
   * Crea la ventana principal de la aplicación
   */
  public async createMainWindow(): Promise<BrowserWindow> {
    const windowId = "main";

    // Si ya existe la ventana, mostrarla y devolverla
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId)!;
      if (existingWindow.isMinimized()) existingWindow.restore();
      existingWindow.focus();
      return existingWindow;
    }

    try {
      // Cargar estado guardado o usar valores por defecto
      const windowState = this.getWindowState();

      // Crear la nueva ventana
      const window = new BrowserWindow({
        ...MAIN_WINDOW_CONFIG,
        ...windowState,
        icon: join(
          app.getAppPath(),
          "renderer",
          "public",
          "images",
          "icon.ico"
        ),
        backgroundColor: "#F5F5F5",
        webPreferences: {
          ...MAIN_WINDOW_CONFIG.webPreferences,
          preload: resolve(__dirname, "../../app/preload.js"),
          devTools: isDevelopment,
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
      });

      // Cargar la aplicación
      if (isDevelopment) {
        await window.loadURL("http://localhost:8888");
        window.webContents.openDevTools();
      } else {
        await window.loadFile(join(app.getAppPath(), "app", "index.html"));
      }

      // Configurar eventos de ventana
      this.setupWindowEvents(window);

      // Mostrar la ventana cuando esté lista
      window.once("ready-to-show", () => {
        window.show();
        if (windowState.isMaximized) {
          window.maximize();
        }
      });

      // Abrir enlaces externos en el navegador predeterminado
      window.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("http:") || url.startsWith("https:")) {
          shell.openExternal(url);
        }
        return { action: "deny" };
      });

      // Almacenar la referencia a la ventana
      this.windows.set(windowId, window);

      logger.info(`Ventana principal creada (${window.id})`);
      return window;
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error creating main window:", error.message);
      } else {
        logger.error("Error creating main window:", String(error));
      }
      throw error;
    }
  }

  /**
   * Crea una ventana modal
   */
  public createModalWindow(options: WindowOptions = {}): BrowserWindow {
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
      show: options.show ?? false,
      center: options.center ?? true,
      title: options.title || "PACTA",
      backgroundColor: options.backgroundColor || "#151A24",
      icon: options.icon || join(app.getAppPath(), "build", "icon.png"),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: resolve(__dirname, "../../app/preload.js"),
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
  }

  private setupWindowEvents(window: BrowserWindow): void {
    // Guardar estado de la ventana
    (["resize", "move"] as Array<"resize" | "move">).forEach((event) => {
      (window.on as any)(event, () => {
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

    // Evento de cierre con verificación de salida
    window.on("close", (e) => {
      if (!this.isQuitting) {
        e.preventDefault();
        window.hide();
        return;
      }

      // Guardar estado de la ventana antes de cerrar
      const bounds = window.getBounds();
      this.saveWindowState({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized: window.isMaximized(),
      });
    });

    // Manejar errores de carga
    window.webContents.on("did-fail-load", (_, errorCode, errorDescription) => {
      logger.error("Window failed to load:", { errorCode, errorDescription });
    });
  }

  private getWindowState(): WindowState {
    const defaultState: WindowState = {
      width: MAIN_WINDOW_CONFIG.width,
      height: MAIN_WINDOW_CONFIG.height,
      isMaximized: false,
    };

    try {
      const savedState = this.store.get("mainWindow") as
        | WindowState
        | undefined;
      if (!savedState) return defaultState;

      return this.ensureVisibleOnScreen(savedState);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error getting window state:", error.message);
      } else {
        logger.error("Error getting window state:", String(error));
      }
      return defaultState;
    }
  }

  private saveWindowState(state: WindowState): void {
    try {
      this.store.set("mainWindow", state);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error saving window state:", error.message);
      } else {
        logger.error("Error saving window state:", String(error));
      }
    }
  }

  private ensureVisibleOnScreen(state: WindowState): WindowState {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const result = { ...state };

    if (state.x !== undefined && state.y !== undefined) {
      // Verificar que la ventana está visible en alguna pantalla
      const displays = screen.getAllDisplays();
      const isVisibleOnDisplay = displays.some((display) => {
        const displayBounds = display.bounds;
        return (
          state.x! + state.width > displayBounds.x &&
          state.x! < displayBounds.x + displayBounds.width &&
          state.y! + state.height > displayBounds.y &&
          state.y! < displayBounds.y + displayBounds.height
        );
      });

      // Si no es visible, eliminar coordenadas para centrar
      if (!isVisibleOnDisplay) {
        delete result.x;
        delete result.y;
      }
    }

    // Asegurar que el tamaño no exceda los límites
    if (result.width > width) result.width = MAIN_WINDOW_CONFIG.width;
    if (result.height > height) result.height = MAIN_WINDOW_CONFIG.height;

    return result;
  }

  /**
   * Obtiene la ventana principal
   */
  public getMainWindow(): BrowserWindow | null {
    return this.windows.get("main") || null;
  }

  /**
   * Obtiene el número de ventanas abiertas
   */
  public getWindowCount(): number {
    return BrowserWindow.getAllWindows().length;
  }

  /**
   * Cierra todas las ventanas
   */
  public closeAllWindows(): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.close();
    });
  }
}
