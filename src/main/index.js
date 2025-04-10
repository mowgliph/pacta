const { app, BrowserWindow, ipcMain } = require('electron');
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