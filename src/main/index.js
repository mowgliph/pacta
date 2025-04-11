const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fetch = require('node-fetch');

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

// Manejadores de autenticación
ipcMain.handle('auth:login', async (_, credentials) => {
  const response = await fetch('http://localhost:3001/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
});

// Manejadores de contratos
ipcMain.handle('contracts:getAll', async () => {
  const response = await fetch('http://localhost:3001/contracts');
  return response.json();
});

ipcMain.handle('contracts:uploadDocument', async (_, { contractId, filePath }) => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  
  const response = await fetch(`http://localhost:3001/contracts/${contractId}/upload`, {
    method: 'POST',
    body: formData
  });
  return response.json();
});

ipcMain.handle('contracts:getDetails', async (event, contractId) => {
  const response = await fetch(`http://localhost:3001/contracts/${contractId}`);
  if (!response.ok) {
    throw new Error(`Error fetching contract details: ${response.statusText}`);
  }
  return response.json();
});

ipcMain.handle('contracts:create', async (event, contractData) => {
  const response = await fetch('http://localhost:3001/contracts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contractData)
  });
  if (!response.ok) {
    throw new Error(`Error creating contract: ${response.statusText}`);
  }
  return response.json();
});

ipcMain.handle('contracts:update', async (event, { contractId, contractData }) => {
  const response = await fetch(`http://localhost:3001/contracts/${contractId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contractData)
  });
  if (!response.ok) {
    throw new Error(`Error updating contract: ${response.statusText}`);
  }
  return response.json();
});

ipcMain.handle('contracts:delete', async (event, contractId) => {
  const response = await fetch(`http://localhost:3001/contracts/${contractId}`, {
    method: 'DELETE',
  });
  // DELETE podría no devolver cuerpo, así que solo verificamos el status
  if (!response.ok) {
    throw new Error(`Error deleting contract: ${response.statusText}`);
  }
  // Puedes devolver algo si es necesario, ej. { success: true }
  return { success: true }; // O simplemente no devolver nada si invoke no lo necesita
});

ipcMain.handle('contracts:addSupplement', async (event, { contractId, supplementData }) => {
  const url = `http://localhost:3001/contracts/${contractId}/supplements`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' /* + Auth Headers si es necesario */ },
    body: JSON.stringify(supplementData)
  });
  if (!response.ok) {
    throw new Error(`Error añadiendo suplemento: ${response.statusText}`);
  }
  return response.json(); // Devuelve el suplemento creado (o lo que devuelva el backend)
});

ipcMain.handle('contracts:editSupplement', async (event, { contractId, supplementId, supplementData }) => {
  const url = `http://localhost:3001/contracts/${contractId}/supplements/${supplementId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' /* + Auth Headers */ },
    body: JSON.stringify(supplementData)
  });
  if (!response.ok) {
    throw new Error(`Error actualizando suplemento: ${response.statusText}`);
  }
  return response.json(); // Devuelve el suplemento actualizado
});

// Manejadores de archivos
ipcMain.handle('files:select', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Documentos', extensions: ['pdf', 'doc', 'docx'] }
    ]
  });
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
  // Aquí necesitarás una forma de identificar al usuario actual.
  // Podría ser a través de un token almacenado o pasando el ID de usuario desde el renderer si lo tienes.
  // Asumiremos que el backend puede identificar al usuario por la sesión/token enviado.
  // ¡IMPORTANTE! Asegúrate de que el backend requiere autenticación para esta ruta.
  const response = await fetch('http://localhost:3001/profile', {
    method: 'GET',
    // Headers adicionales si son necesarios para la autenticación (ej. Authorization: Bearer token)
    // headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!response.ok) {
    // Lanza un error si la respuesta no fue exitosa
    throw new Error(`Error fetching profile: ${response.statusText}`);
  }
  return response.json();
});

ipcMain.handle('profile:update', async (event, profileData) => {
  // De nuevo, asegúrate de que el backend requiere autenticación.
  const response = await fetch('http://localhost:3001/profile', {
    method: 'PUT', // o PATCH
    headers: {
      'Content-Type': 'application/json',
      // Headers de autenticación si son necesarios
      // 'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(profileData)
  });
  if (!response.ok) {
    throw new Error(`Error updating profile: ${response.statusText}`);
  }
  // Devuelve los datos actualizados del perfil
  return response.json();
});