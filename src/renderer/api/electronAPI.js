// Este archivo contendrá funciones para interactuar con el proceso principal de Electron
// utilizando el mecanismo IPC (Inter-Process Communication).

import { 
  ContractSchema, 
  SupplementSchema, 
  PerfilUsuarioSchema,
  ArchivoSchema,
  EstadisticasSchema,
  ReporteSchema,
  EsquemaRelacionesContrato
} from '../utils/validation/schemas';
import { z } from 'zod';
import { ipcRenderer } from 'electron';

export const iniciarSesion = async (username, password) => {
  try {
    const user = await window.electron.ipcRenderer.invoke('auth:login', { username, password });
    return user;
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    return null;
  }
};

export const obtenerContratos = async () => {
  try {
    const contratos = await window.electron.ipcRenderer.invoke('contracts:getAll');
    return contratos;
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    return [];
  }
};

export const obtenerPerfilUsuario = async () => {
  try {
    const perfil = await window.electron.ipcRenderer.invoke('profile:fetch');
    return perfil;
  } catch (error) {
    console.error('Error al obtener el perfil de usuario:', error);
    return null;
  }
};

export const actualizarPerfilUsuario = async (datosPerfil) => {
  try {
    const datosValidados = PerfilUsuarioSchema.parse(datosPerfil);
    const perfilActualizado = await window.electron.ipcRenderer.invoke('profile:update', datosValidados);
    return perfilActualizado;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación:', error.errors);
      throw error;
    }
    console.error('Error al actualizar el perfil de usuario:', error);
    return null;
  }
};

export const obtenerDetallesContrato = async (contratoId) => {
  try {
    const detalles = await window.electron.ipcRenderer.invoke('contracts:getDetails', contratoId);
    return detalles;
  } catch (error) {
    console.error(`Error al obtener detalles del contrato ${contratoId}:`, error);
    return null;
  }
};

export const crearContrato = async (datosContrato) => {
  try {
    const datosValidados = ContractSchema.parse(datosContrato);
    const nuevoContrato = await window.electron.ipcRenderer.invoke('contracts:create', datosValidados);
    return nuevoContrato;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación:', error.errors);
      throw error;
    }
    console.error('Error al crear el contrato:', error);
    return null;
  }
};

// Enhance existing validation
export const actualizarContrato = async (contratoId, datosContrato) => {
  try {
    const datosValidados = ContractSchema.parse(datosContrato);
    
    // Add pre-validation checks
    if (datosValidados.status === 'Inactive' && datosValidados.hasActiveSupplements) {
      throw new Error('No se puede inactivar un contrato con suplementos activos');
    }

    const contratoActualizado = await window.electron.ipcRenderer.invoke('contracts:update', {
      contratoId,
      datosContrato: datosValidados
    });

    // Add response validation
    if (!contratoActualizado?.id) {
      throw new Error('Respuesta inválida del servidor');
    }

    return contratoActualizado;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación:', error.errors);
      throw error;
    }
    console.error(`Error al actualizar el contrato ${contratoId}:`, error);
    return null;
  }
};

export const subirDocumentoContrato = async (contratoId, rutaArchivo) => {
  try {
    const datosValidados = ArchivoSchema.parse({
      archivo: rutaArchivo,
      tipo: 'contrato',
    });
    const resultado = await window.electron.ipcRenderer.invoke('contracts:uploadDocument', {
      contratoId,
      rutaArchivo: datosValidados.archivo
    });
    return resultado;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación:', error.errors);
      throw error;
    }
    console.error(`Error al subir documento para el contrato ${contratoId}:`, error);
    return null;
  }
};

export const agregarSuplemento = async (contratoId, datosSuplemento) => {
  try {
    const datosValidados = SupplementSchema.parse(datosSuplemento);
    const resultado = await window.electron.ipcRenderer.invoke('contracts:addSupplement', {
      contratoId,
      datosSuplemento: datosValidados
    });
    return resultado;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación:', error.errors);
      throw error;
    }
    console.error(`Error añadiendo suplemento al contrato ${contratoId}:`, error);
    return null;
  }
};

export const obtenerEstadisticas = async (filtros = {}) => {
  try {
    const filtrosValidados = EstadisticasSchema.parse(filtros);
    const datosEstadisticos = await window.electron.ipcRenderer.invoke('statistics:fetch', filtrosValidados);
    return datosEstadisticos;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación de estadísticas:', error.errors);
      throw error;
    }
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
};

export const generarReporte = async (configuracionReporte) => {
  try {
    const configValidada = ReporteSchema.parse(configuracionReporte);
    const reporte = await window.electron.ipcRenderer.invoke('reports:generate', configValidada);
    return reporte;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación en configuración del reporte:', error.errors);
      throw error;
    }
    console.error('Error al generar reporte:', error);
    return null;
  }
};

export const cerrarSesion = async () => {
  try {
    await window.electron.ipcRenderer.invoke('auth:logout');
  } catch (error) {
    console.error('Error durante el cierre de sesión:', error);
  }
};

/**
 * Obtiene contratos activos próximos a vencer.
 * @param {number} days - Número de días hacia adelante para buscar vencimientos.
 * @returns {Promise<Array|null>} Lista de contratos o null en caso de error.
 */
export const fetchExpiringContracts = async (days = 30) => {
  try {
    // El canal podría incluir los días: 'expiring-contracts:fetch?days=30'
    const contracts = await window.electron.ipcRenderer.invoke('expiring-contracts:fetch', days);
    return contracts;
  } catch (error) {
    console.error(`Error al obtener contratos que vencen en ${days} días:`, error);
    return null;
  }
};

/**
 * Obtiene la actividad reciente de suplementos (creación/modificación).
 * @param {number} limit - Número máximo de registros a obtener.
 * @returns {Promise<Array|null>} Lista de actividades/suplementos o null en caso de error.
 */
export const fetchRecentSupplementActivity = async (limit = 5) => {
  try {
    const activity = await window.electron.ipcRenderer.invoke('supplement-activity:fetch', limit);
    return activity;
  } catch (error) {
    console.error(`Error al obtener actividad reciente de suplementos:`, error);
    return null;
  }
};

// Funciones para contratos
export const fetchContracts = async () => {
  return ipcRenderer.invoke('get-contracts');
};

export const fetchContractDetails = async (contractId) => {
  return ipcRenderer.invoke('get-contract-details', contractId);
};

export const createContract = async (contractData) => {
  return ipcRenderer.invoke('create-contract', contractData);
};

export const updateContract = async (contractId, contractData) => {
  return ipcRenderer.invoke('update-contract', contractId, contractData);
};

// Funciones para suplementos
export const addSupplement = async (contractId, supplementData) => {
  return ipcRenderer.invoke('add-supplement', contractId, supplementData);
};

export const editSupplement = async (contractId, supplementId, supplementData) => {
  return ipcRenderer.invoke('edit-supplement', contractId, supplementId, supplementData);
};

// Funciones para estadísticas
export const fetchStatistics = async () => {
  return ipcRenderer.invoke('get-statistics');
};