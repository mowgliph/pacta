const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

// Variable global para almacenar el token JWT
let currentAuthToken = null;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const backendProcess = spawn('node', [path.join(__dirname, '../../backend/server.js')], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../../backend'),
  });

  mainWindow.loadURL('http://localhost:3000').catch((err) => {
    console.error('Error cargando frontend:', err);
    mainWindow.loadFile(path.join(__dirname, '../../public/error.html'));
  });

  mainWindow.on('closed', () => backendProcess.kill());

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// Manejar peticiones al backend
ipcMain.handle('backend-request', async (event, { method, endpoint, data }) => {
  const url = `http://localhost:5000${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method !== 'GET' ? JSON.stringify(data) : undefined,
  };
  const response = await fetch(url, options);
  return response.json();
});

// Manejar subida de archivos (ejemplo básico)
ipcMain.handle('upload-file', async (event, filePath) => {
  // Aquí podrías mover el archivo a data/uploads/ o procesarlo
  return { success: true, path: filePath };
});

// Enviar notificaciones (ejemplo)
setInterval(() => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    windows[0].webContents.send('notification', '¡Un contrato está por vencer!');
  }
}, 60000); // Cada minuto, como ejemplo

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Menú (sin cambios, solo lo omito por brevedad)
app.on('ready', () => {
  const template = [/* Tu menú aquí */];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'assets/icon.png'));
  }
});

// Helper para añadir header de autorización
const getAuthHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (currentAuthToken) {
        headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }
    return headers;
};

// Helper para añadir header de autorización a FormData (un poco diferente)
const getAuthHeadersForFormData = () => {
    const headers = {}; // No poner Content-Type, fetch lo hace solo para FormData
    if (currentAuthToken) {
        headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }
    return headers;
}

// Manejadores de autenticación
ipcMain.handle('auth:login', async (_, credentials) => {
  // Llamar al endpoint /api/auth/login
  const response = await fetch('http://localhost:3001/api/auth/login', { // Corregir endpoint a /api/auth/login
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const result = await response.json();
  if (response.ok && result.token) {
    // Guardar el token globalmente en éxito
    currentAuthToken = result.token;
    console.log('[Main Process] Token almacenado.');
  } else {
    currentAuthToken = null; // Limpiar si el login falla
  }
  // Devolver todo el resultado (que puede incluir mensaje de error o { token })
  return result; 
});

// Nuevo manejador para logout
ipcMain.handle('auth:logout', async () => {
    console.log('[Main Process] Limpiando token almacenado.');
    currentAuthToken = null;
    // Podrías añadir una llamada al backend aquí si necesitas invalidar el token en el servidor
    return { success: true };
});

// Manejadores de contratos
ipcMain.handle('contracts:getAll', async () => {
  const response = await fetch('http://localhost:3001/api/contracts', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`Error ${response.status} al obtener contratos`);
  return response.json();
});

ipcMain.handle('contracts:uploadDocument', async (_, { contractId, filePath }) => {
  // FormData necesita manejo especial de headers
  const formData = new FormData();
  try {
      // Asegurarse que el archivo existe antes de crear el stream
      if (!fs.existsSync(filePath)) {
          throw new Error(`El archivo no existe: ${filePath}`);
      }
      formData.append('document', fs.createReadStream(filePath)); // 'document' debe coincidir con upload.single()
  } catch (err) {
      console.error("Error creando read stream:", err);
      throw new Error('Error al leer el archivo para subir.');
  }
  
  const response = await fetch(`http://localhost:3001/api/contracts/${contractId}/upload`, {
    method: 'POST',
    body: formData,
    headers: getAuthHeadersForFormData() // Usar headers para FormData
  });
  if (!response.ok) throw new Error(`Error ${response.status} al subir documento`);
  return response.json();
});

ipcMain.handle('contracts:getDetails', async (event, contractId) => {
  const response = await fetch(`http://localhost:3001/api/contracts/${contractId}`, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error ${response.status} al obtener detalles del contrato`);
  }
  return response.json();
});

ipcMain.handle('contracts:create', async (event, contractData) => {
  // Nota: Si la creación incluye subida directa (como está ahora contract.route.js POST /),
  // esta llamada simple no funcionará, necesitaría enviar FormData.
  // Asumiremos que el frontend envía solo JSON aquí y usa /upload después.
  const response = await fetch('http://localhost:3001/api/contracts', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(contractData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Intenta obtener detalles del error
    throw new Error(errorData.message || `Error ${response.status} al crear contrato`);
  }
  return response.json();
});

ipcMain.handle('contracts:update', async (event, { contractId, contractData }) => {
  const response = await fetch(`http://localhost:3001/api/contracts/${contractId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(contractData)
  });
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status} al actualizar contrato`);
  }
  return response.json();
});

ipcMain.handle('contracts:delete', async (event, contractId) => {
  const response = await fetch(`http://localhost:3001/api/contracts/${contractId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status} al eliminar contrato`);
  }
  // DELETE exitoso no devuelve cuerpo, status 204
  return { success: true }; 
});

ipcMain.handle('contracts:addSupplement', async (event, { contractId, supplementData }) => {
  const url = `http://localhost:3001/api/contracts/${contractId}/supplements`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(supplementData)
  });
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status} al añadir suplemento`);
  }
  return response.json();
});

ipcMain.handle('contracts:editSupplement', async (event, { contractId, supplementId, supplementData }) => {
  const url = `http://localhost:3001/api/contracts/${contractId}/supplements/${supplementId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(supplementData)
  });
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status} al actualizar suplemento`);
  }
  return response.json();
});

// Manejadores de archivos (no requieren auth generalmente)
ipcMain.handle('files:select', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Documentos', extensions: ['pdf', 'doc', 'docx'] }
    ]
  });
  // Retorna undefined si se cancela, lo cual es manejado por el renderer
  return result.filePaths[0]; 
});

// Añadir manejador para abrir archivos
ipcMain.handle('files:open', async (event, filePath) => {
  try {
    // shell.openPath es la forma segura de abrir archivos/urls/directorios
    const error = await shell.openPath(filePath);
    if (error) {
      console.error(`Error al abrir archivo con shell.openPath: ${error}`);
      throw new Error(error); // Lanza error si shell.openPath devuelve un mensaje de error
    }
    // No devuelve nada si tiene éxito
  } catch (err) {
    console.error('Error en el manejador IPC files:open:', err);
    throw err; // Re-lanza el error para que el renderer lo reciba
  }
});

// Sistema de notificaciones
function enviarNotificacionVencimiento(contrato) {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    windows[0].webContents.send('notification:new', {
      type: 'contract_expiring',
      message: `El contrato ${contrato.name} vencerá pronto`,
      data: contrato
    });
  }
}

// Manejadores de perfil de usuario
ipcMain.handle('profile:fetch', async (event) => {
  const response = await fetch('http://localhost:3001/api/users/profile', { // Usar la ruta correcta /api/users/profile
      method: 'GET',
      headers: getAuthHeaders()
  });
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status} al obtener perfil`);
  }
  return response.json();
});

ipcMain.handle('profile:update', async (event, profileData) => {
  const response = await fetch('http://localhost:3001/api/users/profile', { // Usar la ruta correcta /api/users/profile
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status} al actualizar perfil`);
  }
  return response.json();
});

// Manejador IPC para Estadísticas
ipcMain.handle('statistics:fetch', async (event, filters) => {
  const url = 'http://localhost:3001/api/statistics';
  try {
    const response = await fetch(url, { 
        method: 'GET', 
        headers: getAuthHeaders() // Usar helper para añadir token
    });
    if (!response.ok) {
      let errorBody = {};
      try { errorBody = await response.json(); } catch(e) {}
      console.error(`Error ${response.status} fetching statistics:`, errorBody);
      throw new Error(errorBody.message || `Error ${response.status} al obtener estadísticas`);
    }
    return response.json();
  } catch (error) {
      console.error("Error en manejador IPC statistics:fetch:", error);
      throw error;
  }
});