// Este archivo contendrá funciones para interactuar con el proceso principal de Electron
// utilizando el mecanismo IPC (Inter-Process Communication).

// Asume que tienes un preload script (preload.js) que expone ipcRenderer de forma segura:
// contextBridge.exposeInMainWorld('electron', {
//   ipcRenderer: {
//     invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
//     // O send/on si prefieres ese modelo
//   }
// });

/**
 * Envía credenciales de inicio de sesión al proceso principal para verificación.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object|null>} Información del usuario si el login es exitoso, null si falla.
 */
export const loginUser = async (username, password) => {
  try {
    // 'auth:login' es un canal de ejemplo, asegúrate de que coincida en tu proceso principal
    const user = await window.electron.ipcRenderer.invoke('auth:login', { username, password });
    return user; // Devuelve la información del usuario si el login es exitoso
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    // Podrías querer manejar diferentes tipos de errores aquí
    return null; // Devuelve null si hay un error o las credenciales son inválidas
  }
};

/**
 * Ejemplo: Obtiene la lista de contratos desde el proceso principal.
 * @returns {Promise<Array>} Lista de contratos.
 */
export const fetchContracts = async () => {
  try {
    // Cambia el canal a 'contracts:getAll' para que coincida con el main process
    const contracts = await window.electron.ipcRenderer.invoke('contracts:getAll');
    return contracts;
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    return []; // Devuelve un array vacío en caso de error
  }
};

/**
 * Obtiene los datos del perfil del usuario actualmente autenticado.
 * @returns {Promise<object|null>} Datos del perfil del usuario o null en caso de error.
 */
export const fetchUserProfile = async () => {
  try {
    // 'profile:fetch' es el canal para obtener el perfil
    const profile = await window.electron.ipcRenderer.invoke('profile:fetch');
    return profile;
  } catch (error) {
    console.error('Error al obtener el perfil de usuario:', error);
    return null;
  }
};

/**
 * Actualiza los datos del perfil del usuario.
 * @param {object} profileData - Los nuevos datos del perfil.
 * @returns {Promise<object|null>} El perfil actualizado o null en caso de error.
 */
export const updateUserProfile = async (profileData) => {
  try {
    // 'profile:update' es el canal para actualizar el perfil
    const updatedProfile = await window.electron.ipcRenderer.invoke('profile:update', profileData);
    return updatedProfile;
  } catch (error) {
    console.error('Error al actualizar el perfil de usuario:', error);
    return null;
  }
};

/**
 * Obtiene los detalles de un contrato específico.
 * @param {string} contractId - El ID del contrato.
 * @returns {Promise<object|null>} Detalles del contrato o null en caso de error.
 */
export const fetchContractDetails = async (contractId) => {
  try {
    const details = await window.electron.ipcRenderer.invoke('contracts:getDetails', contractId);
    return details;
  } catch (error) {
    console.error(`Error al obtener detalles del contrato ${contractId}:`, error);
    return null;
  }
};

/**
 * Crea un nuevo contrato.
 * @param {object} contractData - Los datos del nuevo contrato.
 * @returns {Promise<object|null>} El contrato creado o null en caso de error.
 */
export const createContract = async (contractData) => {
  try {
    const newContract = await window.electron.ipcRenderer.invoke('contracts:create', contractData);
    return newContract;
  } catch (error) {
    console.error('Error al crear el contrato:', error);
    return null;
  }
};

/**
 * Actualiza un contrato existente.
 * @param {string} contractId - El ID del contrato a actualizar.
 * @param {object} contractData - Los datos actualizados del contrato.
 * @returns {Promise<object|null>} El contrato actualizado o null en caso de error.
 */
export const updateContract = async (contractId, contractData) => {
  try {
    const updatedContract = await window.electron.ipcRenderer.invoke('contracts:update', { contractId, contractData });
    return updatedContract;
  } catch (error) {
    console.error(`Error al actualizar el contrato ${contractId}:`, error);
    return null;
  }
};

/**
 * Elimina un contrato.
 * @param {string} contractId - El ID del contrato a eliminar.
 * @returns {Promise<boolean>} True si se eliminó con éxito, false en caso contrario.
 */
export const deleteContract = async (contractId) => {
  try {
    await window.electron.ipcRenderer.invoke('contracts:delete', contractId);
    return true;
  } catch (error) {
    console.error(`Error al eliminar el contrato ${contractId}:`, error);
    return false;
  }
};

/**
 * Sube un documento para un contrato específico.
 * @param {string} contractId - El ID del contrato.
 * @param {string} filePath - La ruta del archivo a subir.
 * @returns {Promise<object|null>} Respuesta del backend o null en caso de error.
 */
export const uploadContractDocument = async (contractId, filePath) => {
  try {
    // Usa el canal 'contracts:uploadDocument' que ya existe en el main process
    const result = await window.electron.ipcRenderer.invoke('contracts:uploadDocument', { contractId, filePath });
    return result;
  } catch (error) {
    console.error(`Error al subir documento para el contrato ${contractId}:`, error);
    return null;
  }
};

/**
 * Abre un diálogo para seleccionar un archivo.
 * @returns {Promise<string|null>} La ruta del archivo seleccionado o null si se cancela.
 */
export const selectFile = async () => {
  try {
    // Usa el canal 'files:select' que ya existe en el main process
    const filePath = await window.electron.ipcRenderer.invoke('files:select');
    return filePath; // Puede ser undefined si el usuario cancela
  } catch (error) {
    console.error('Error al seleccionar archivo:', error);
    return null;
  }
};

/**
 * Añade un suplemento a un contrato.
 * @param {string} contractId
 * @param {object} supplementData
 * @returns {Promise<object|null>}
 */
export const addSupplement = async (contractId, supplementData) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('contracts:addSupplement', { contractId, supplementData });
    return result;
  } catch (error) {
    console.error(`Error añadiendo suplemento al contrato ${contractId}:`, error);
    return null;
  }
};

/**
 * Edita un suplemento existente.
 * @param {string} contractId
 * @param {string} supplementId
 * @param {object} supplementData
 * @returns {Promise<object|null>}
 */
export const editSupplement = async (contractId, supplementId, supplementData) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('contracts:editSupplement', { contractId, supplementId, supplementData });
    return result;
  } catch (error) {
    console.error(`Error editando suplemento ${supplementId} del contrato ${contractId}:`, error);
    return null;
  }
};

/**
 * Solicita al proceso principal abrir un archivo o ruta en el explorador/finder.
 * @param {string} filePath 
 * @returns {Promise<void>} Resuelve si se intentó abrir, puede lanzar error si falla.
 */
export const openFile = async (filePath) => {
  try {
    await window.electron.ipcRenderer.invoke('files:open', filePath);
  } catch (error) {
    console.error(`Error al intentar abrir el archivo ${filePath}:`, error);
    // Podrías lanzar el error para que el componente lo maneje si es necesario
    throw error;
  }
};

// --- Fin de funciones API de contratos ---

// --- Agrega aquí otras funciones API según necesites ---
// ej. createContract, updateContract, fetchUserProfile, etc. 