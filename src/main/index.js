const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Get the API URL from .env, with fallback
const API_URL = process.env.API_URL || 'http://localhost:3001';

let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Error inicializando PrismaClient:', error);
  prisma = null;
}

// Variable global para almacenar el token JWT
let currentAuthToken = null;

// Update the createWindow function
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

  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    // En desarrollo, carga desde el servidor de Vite
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // En producción, carga el archivo HTML construido
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
}

// Manejar peticiones al backend
ipcMain.handle('backend-request', async (event, { method, endpoint, data }) => {
  const url = `${API_URL}${endpoint}`;
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
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const result = await response.json();

    if (response.ok && result.token) {
      currentAuthToken = result.token;
      console.log('[Main Process] Token almacenado correctamente');
      return {
        token: result.token,
        user: result.user,
        message: result.message || 'Login exitoso'
      };
    } else {
      currentAuthToken = null;
      console.error('[Main Process] Error en login:', result.message);
      return {
        token: null,
        user: null,
        message: result.message || 'Error de autenticación'
      };
    }
  } catch (error) {
    console.error('[Main Process] Error en proceso de login:', error);
    return {
      token: null,
      user: null,
      message: 'Error de conexión con el servidor'
    };
  }
});

ipcMain.handle('auth:verify', async () => {
  try {
    if (!currentAuthToken) {
      return { valid: false, message: 'No hay token almacenado' };
    }

    const response = await fetch(`${API_URL}/api/auth/verify`, {
      headers: getAuthHeaders()
    });

    const result = await response.json();
    return {
      valid: response.ok,
      message: result.message,
      user: result.user
    };
  } catch (error) {
    console.error('[Main Process] Error verificando token:', error);
    return { valid: false, message: 'Error de conexión' };
  }
});

ipcMain.handle('auth:logout', async () => {
  try {
    if (currentAuthToken) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    }
  } catch (error) {
    console.error('[Main Process] Error en logout:', error);
  } finally {
    currentAuthToken = null;
    return { success: true };
  }
});

// Manejadores de contratos
ipcMain.handle('contracts:getAll', async (event, filters) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/api/contracts${queryParams ? `?${queryParams}` : ''}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status} al obtener contratos`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en contracts:getAll:', error);
    throw error;
  }
});

ipcMain.handle('contracts:getDetails', async (event, contractId) => {
  try {
    const response = await fetch(`${API_URL}/api/contracts/${contractId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status} al obtener detalles del contrato`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en contracts:getDetails:', error);
    throw error;
  }
});

ipcMain.handle('contracts:create', async (event, contractData) => {
  try {
    const formData = new FormData();
    
    // Agregar datos del contrato
    Object.keys(contractData).forEach(key => {
      if (key !== 'documentFile') {
        formData.append(key, contractData[key]);
      }
    });

    const response = await fetch(`${API_URL}/api/contracts`, {
      method: 'POST',
      headers: getAuthHeadersForFormData(),
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status} al crear contrato`);
    }

    const result = await response.json();
    
    // Enviar notificación de creación
    enviarNotificacionContrato({
      ...result,
      name: result.name || `Contrato ${result.id}`
    }, 'creacion');

    return result;
  } catch (error) {
    console.error('Error en contracts:create:', error);
    throw error;
  }
});

ipcMain.handle('contracts:update', async (event, { contractId, data }) => {
  try {
    const formData = new FormData();
    
    // Agregar datos actualizados
    Object.keys(data).forEach(key => {
      if (key !== 'documentFile') {
        formData.append(key, data[key]);
      }
    });

    const response = await fetch(`${API_URL}/api/contracts/${contractId}`, {
      method: 'PUT',
      headers: getAuthHeadersForFormData(),
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status} al actualizar contrato`);
    }

    const result = await response.json();
    
    // Enviar notificación de actualización
    enviarNotificacionContrato({
      ...result,
      name: result.name || `Contrato ${contractId}`
    }, 'modificacion');

    return result;
  } catch (error) {
    console.error('Error en contracts:update:', error);
    throw error;
  }
});

ipcMain.handle('contracts:delete', async (event, contractId) => {
  try {
    const response = await fetch(`${API_URL}/api/contracts/${contractId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status} al eliminar contrato`);
    }

    // Enviar notificación de eliminación
    enviarNotificacionContrato({
      id: contractId,
      name: `Contrato ${contractId}`
    }, 'eliminacion');

    return true;
  } catch (error) {
    console.error('Error en contracts:delete:', error);
    throw error;
  }
});

ipcMain.handle('contracts:uploadDocument', async (event, { filePath, fileName }) => {
  try {
    const formData = new FormData();
    formData.append('document', createReadStream(filePath));
    formData.append('fileName', fileName);

    const response = await fetch(`${API_URL}/api/contracts/upload`, {
      method: 'POST',
      headers: getAuthHeadersForFormData(),
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status} al subir documento`);
    }

    return response.json();
  } catch (error) {
    console.error('Error en contracts:uploadDocument:', error);
    throw error;
  }
});

// Manejador para selección de archivos
ipcMain.handle('dialog:selectFile', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: options.filters || [
        { name: 'Documentos', extensions: ['pdf', 'doc', 'docx'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  } catch (error) {
    console.error('Error al seleccionar archivo:', error);
    throw new Error('Error al seleccionar el archivo');
  }
});

// Manejador para subir archivos
ipcMain.handle('files:upload', async (event, { filePath, contractId }) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('contractId', contractId);

    const response = await fetch(`${API_URL}/api/files/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status} al subir archivo`);
    }

    const result = await response.json();
    return result.fileUrl;
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
});

// Manejador para añadir suplemento
ipcMain.handle('contracts:addSupplement', async (event, { contractId, supplementData }) => {
  try {
    let fileUrl = null;
    
    // Si hay un archivo, subirlo primero
    if (supplementData.rutaArchivo) {
      fileUrl = await event.sender.invoke('files:upload', {
        filePath: supplementData.rutaArchivo,
        contractId
      });
    }

    const url = `${API_URL}/api/contracts/${contractId}/supplements`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...supplementData,
        fileUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status} al añadir suplemento`);
    }

    const result = await response.json();
    
    // Enviar notificación
    enviarNotificacionSuplemento({
      ...result,
      contractName: result.contract?.name || `Contrato ${contractId}`
    }, 'creacion');

    return result;
  } catch (error) {
    console.error('Error al añadir suplemento:', error);
    throw error;
  }
});

// Manejador para editar suplemento
ipcMain.handle('contracts:editSupplement', async (event, { contractId, supplementId, supplementData }) => {
  try {
    let fileUrl = supplementData.fileUrl;
    
    // Si hay un nuevo archivo, subirlo
    if (supplementData.rutaArchivo && supplementData.rutaArchivo !== fileUrl) {
      fileUrl = await event.sender.invoke('files:upload', {
        filePath: supplementData.rutaArchivo,
        contractId
      });
    }

    const url = `${API_URL}/api/contracts/${contractId}/supplements/${supplementId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...supplementData,
        fileUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status} al actualizar suplemento`);
    }

    const result = await response.json();
    
    // Enviar notificación
    enviarNotificacionSuplemento({
      ...result,
      contractName: result.contract?.name || `Contrato ${contractId}`
    }, 'modificacion');

    return result;
  } catch (error) {
    console.error('Error al editar suplemento:', error);
    throw error;
  }
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

// Sistema de notificaciones mejorado
function enviarNotificacion(tipo, mensaje, datos = {}) {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    windows[0].webContents.send('notification:new', {
      type,
      message: mensaje,
      data: datos,
      timestamp: new Date().toISOString()
    });
  }
}

// Manejador para notificaciones de contratos
function enviarNotificacionContrato(contrato, tipo) {
  let mensaje = '';
  switch (tipo) {
    case 'vencimiento':
      mensaje = `El contrato ${contrato.name} vencerá pronto`;
      break;
    case 'creacion':
      mensaje = `Se ha creado el contrato ${contrato.name}`;
      break;
    case 'modificacion':
      mensaje = `Se ha modificado el contrato ${contrato.name}`;
      break;
    case 'eliminacion':
      mensaje = `Se ha eliminado el contrato ${contrato.name}`;
      break;
    default:
      mensaje = `Actualización en el contrato ${contrato.name}`;
  }
  
  enviarNotificacion(`contract_${tipo}`, mensaje, contrato);
}

// Manejador para notificaciones de suplementos
function enviarNotificacionSuplemento(suplemento, tipo) {
  let mensaje = '';
  switch (tipo) {
    case 'creacion':
      mensaje = `Se ha añadido un suplemento al contrato ${suplemento.contractName}`;
      break;
    case 'modificacion':
      mensaje = `Se ha modificado un suplemento del contrato ${suplemento.contractName}`;
      break;
    default:
      mensaje = `Actualización en suplementos del contrato ${suplemento.contractName}`;
  }
  
  enviarNotificacion(`supplement_${tipo}`, mensaje, suplemento);
}

// Manejador para notificaciones del sistema
function enviarNotificacionSistema(tipo, mensaje, datos = {}) {
  enviarNotificacion(`system_${tipo}`, mensaje, datos);
}

// Manejadores de perfil de usuario
ipcMain.handle('profile:fetch', async (event) => {
  const response = await fetch(`${API_URL}/api/users/profile`, { // Usar la ruta correcta /api/users/profile
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
  const response = await fetch(`${API_URL}/api/users/profile`, { // Usar la ruta correcta /api/users/profile
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
  const url = `${API_URL}/api/statistics`;
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

// --- Manejadores IPC Adicionales para Dashboard ---

ipcMain.handle('expiring-contracts:fetch', async (event, days = 30) => {
  // Construir la URL del backend para obtener contratos que vencen pronto
  const url = `${API_URL}/api/contracts/expiring?days=${parseInt(days, 10)}`;
  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Error ${response.status} al obtener contratos por vencer`);
    }
    return response.json();
  } catch (error) {
    console.error("Error en IPC expiring-contracts:fetch:", error);
    throw error;
  }
});

ipcMain.handle('supplement-activity:fetch', async (event, limit = 5) => {
  // Construir la URL del backend para obtener actividad reciente de suplementos
  const url = `${API_URL}/api/supplements/activity?limit=${parseInt(limit, 10)}`; // Endpoint hipotético
  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
     if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Error ${response.status} al obtener actividad de suplementos`);
    }
    return response.json();
  } catch (error) {
    console.error("Error en IPC supplement-activity:fetch:", error);
    throw error;
  }
});

// Manejadores IPC para contratos
ipcMain.handle('get-contracts', async () => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        supplements: true
      }
    });
    return contracts;
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    throw error;
  }
});

ipcMain.handle('get-contract-details', async (event, contractId) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        supplements: true
      }
    });
    if (!contract) {
      throw new Error('Contrato no encontrado');
    }
    return contract;
  } catch (error) {
    console.error('Error al obtener detalles del contrato:', error);
    throw error;
  }
});

ipcMain.handle('create-contract', async (event, contractData) => {
  try {
    const contract = await prisma.contract.create({
      data: {
        ...contractData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return contract.id;
  } catch (error) {
    console.error('Error al crear contrato:', error);
    throw error;
  }
});

ipcMain.handle('update-contract', async (event, contractId, contractData) => {
  try {
    const contract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        ...contractData,
        updatedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar contrato:', error);
    throw error;
  }
});

// Manejadores IPC para suplementos
ipcMain.handle('add-supplement', async (event, contractId, supplementData) => {
  try {
    const supplement = await prisma.supplement.create({
      data: {
        ...supplementData,
        contractId: contractId,
        createdAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error al agregar suplemento:', error);
    throw error;
  }
});

ipcMain.handle('edit-supplement', async (event, contractId, supplementId, supplementData) => {
  try {
    const supplement = await prisma.supplement.update({
      where: { id: supplementId },
      data: {
        ...supplementData,
        updatedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error al editar suplemento:', error);
    throw error;
  }
});

// Manejador IPC para estadísticas
ipcMain.handle('statistics:getPublic', async () => {
  try {
    const totalContracts = await prisma.contract.count();
    const activeContracts = await prisma.contract.count({
      where: { status: 'active' }
    });
    const expiringContracts = await prisma.contract.count({
      where: {
        endDate: {
          lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    return {
      totalContracts,
      activeContracts,
      expiringContracts
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
});

ipcMain.handle('statistics:getPrivate', async () => {
  try {
    // Implementación existente...
    return await prisma.$queryRaw`SELECT * FROM private_statistics`;
  } catch (error) {
    console.error('Error al obtener estadísticas privadas:', error);
    throw error;
  }
});

ipcMain.handle('statistics:exportReport', async (event, data) => {
  try {
    const { dialog } = require('electron');
    const fs = require('fs').promises;
    const path = require('path');

    // Solicitar ubicación para guardar el archivo
    const { filePath } = await dialog.showSaveDialog({
      title: 'Guardar Reporte de Estadísticas',
      defaultPath: path.join(app.getPath('downloads'), 'reporte-estadisticas.json'),
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'Todos los archivos', extensions: ['*'] }
      ]
    });

    if (!filePath) {
      throw new Error('Operación cancelada por el usuario');
    }

    // Guardar los datos en el archivo
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    return { success: true, filePath };
  } catch (error) {
    console.error('Error al exportar reporte:', error);
    throw error;
  }
});

// SMTP Config Handlers
ipcMain.handle('smtp:getConfig', async () => {
  const response = await fetch(`${API_URL}/api/users/smtp-config`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status} al obtener configuración SMTP`);
  }
  return response.json();
});

ipcMain.handle('smtp:updateConfig', async (event, config) => {
  const response = await fetch(`${API_URL}/api/users/smtp-config`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(config)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status} al actualizar configuración SMTP`);
  }
  return response.json();
});