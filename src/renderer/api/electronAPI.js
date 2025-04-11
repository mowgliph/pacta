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

export const actualizarContrato = async (contratoId, datosContrato) => {
  try {
    const datosValidados = ContractSchema.parse(datosContrato);
    const contratoActualizado = await window.electron.ipcRenderer.invoke('contracts:update', {
      contratoId,
      datosContrato: datosValidados
    });
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