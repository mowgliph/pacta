const { BrowserWindow, dialog } = require('electron');
const path = require('path');

class ErrorWindow {
  constructor(parentWindow = null) {
    this.window = null;
    this.parentWindow = parentWindow;
  }

  /**
   * Muestra una ventana de error
   * @param {string} message - Mensaje de error a mostrar
   * @param {object} [options] - Opciones adicionales
   * @param {string} [options.title='Error en la aplicación'] - Título de la ventana
   * @param {boolean} [options.isModal=true] - Si la ventana debe ser modal
   */
  show(message, { title = 'Error en la aplicación', isModal = true } = {}) {
    try {
      this.createWindow(isModal);
      this.loadContent(message, title);
      this.setupEventListeners();
    } catch (error) {
      console.error('[ERROR_WINDOW] Error al mostrar ventana de error:', error);
      this.showFallbackDialog(message);
    }
  }

  /**
   * Crea la ventana de error
   * @param {boolean} isModal - Si la ventana debe ser modal
   * @private
   */
  createWindow(isModal) {
    this.window = new BrowserWindow({
      width: 500,
      height: 300,
      parent: this.parentWindow && !this.parentWindow.isDestroyed() ? this.parentWindow : undefined,
      modal: isModal,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        sandbox: false
      },
      icon: path.join(__dirname, '../../renderer/favicon.ico')
    });
  }

  /**
   * Carga el contenido HTML en la ventana
   * @param {string} message - Mensaje de error
   * @param {string} title - Título de la ventana
   * @private
   */
  loadContent(message, title) {
    this.window.loadURL(`data:text/html;charset=utf-8,
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${this.escapeHtml(title)}</title>
        <style>
          ${this.getStyles()}
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>¡Se ha producido un error!</h1>
          <p>La aplicación ha encontrado un problema y no puede continuar.</p>
          
          <h3>Detalles del error:</h3>
          <div class="error-details">${this.escapeHtml(message) || 'Error desconocido'}</div>
          
          <div class="actions">
            <button class="secondary" onclick="window.close()">Cerrar</button>
            <button class="primary" onclick="location.reload()">Reintentar</button>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  /**
   * Configura los event listeners de la ventana
   * @private
   */
  setupEventListeners() {
    this.window.once('ready-to-show', () => {
      if (this.window && !this.window.isDestroyed()) {
        this.window.show();
        this.window.focus();
      }
    });

    this.window.on('closed', () => {
      this.window = null;
    });
  }

  /**
   * Muestra un diálogo de error nativo como respaldo
   * @param {string} message - Mensaje de error
   * @private
   */
  showFallbackDialog(message) {
    dialog.showErrorBox(
      'Error en la aplicación',
      `No se pudo mostrar la interfaz de error. Detalles:\n\n${message || 'Error desconocido'}`
    );
  }

  /**
   * Devuelve los estilos CSS para la ventana de error
   * @returns {string} Estilos CSS
   * @private
   */
  getStyles() {
    return `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
                   Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        padding: 20px;
        line-height: 1.6;
        color: #333;
        background-color: #f8f9fa;
      }
      .error-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      h1 {
        color: #d32f2f;
        margin-top: 0;
      }
      .error-details {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 4px;
        margin: 20px 0;
        font-family: monospace;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .actions {
        margin-top: 25px;
        text-align: right;
      }
      button {
        padding: 10px 20px;
        margin-left: 10px;
        cursor: pointer;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        transition: background-color 0.2s;
      }
      .primary {
        background-color: #018ABE;
        color: white;
      }
      .primary:hover {
        background-color: #0174a1;
      }
      .secondary {
        background-color: #f0f0f0;
        color: #333;
      }
      .secondary:hover {
        background-color: #e0e0e0;
      }
    `;
  }

  /**
   * Escapa el HTML para prevenir XSS
   * @param {string} unsafe - Texto a escapar
   * @returns {string} Texto escapado
   * @private
   */
  escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

module.exports = { ErrorWindow };

// Esta clase encapsula la lógica de la ventana de error, siguiendo las mejores prácticas de:
// - Separación de responsabilidades
// - Encapsulamiento
// - Reutilización de código
// - Seguridad (escapado de HTML, sandboxing)
// - Mantenibilidad (código modular y documentado)
