/**
 * Controlador para gestionar operaciones relacionadas con contratos
 */
import fs from 'fs';
import path from 'path';
import { prisma } from '../utils/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

/**
 * Obtener un contrato por su ID
 */
export const getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contract = await prisma.contract.findUnique({
      where: { id }
    });
    
    if (!contract) {
      throw new NotFoundError('Contrato no encontrado');
    }
    
    return res.status(200).json(contract);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

/**
 * Descargar documento asociado a un contrato
 */
export const downloadContractDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el contrato
    const contract = await prisma.contract.findUnique({
      where: { id }
    });
    
    if (!contract) {
      throw new NotFoundError('Contrato no encontrado');
    }
    
    // Verificar si el contrato tiene un documento adjunto
    if (!contract.documentUrl) {
      throw new BadRequestError('El contrato no tiene un documento adjunto');
    }
    
    // Construir la ruta completa al archivo
    const filePath = path.resolve(contract.documentUrl);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('El archivo no existe en el servidor');
    }
    
    // Obtener el nombre original del archivo desde la URL
    const fileName = path.basename(contract.documentUrl);
    
    // Determinar el tipo MIME basado en la extensión del archivo
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream'; // Tipo por defecto
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
      case '.docx':
        contentType = 'application/msword';
        break;
      case '.xls':
      case '.xlsx':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }
    
    // Configurar los encabezados para la descarga
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar el archivo como respuesta
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

/**
 * Descargar documento asociado a un suplemento
 */
export const downloadSupplementDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el suplemento
    const supplement = await prisma.supplement.findUnique({
      where: { id }
    });
    
    if (!supplement) {
      throw new NotFoundError('Suplemento no encontrado');
    }
    
    // Verificar si el suplemento tiene un documento adjunto
    if (!supplement.documentUrl) {
      throw new BadRequestError('El suplemento no tiene un documento adjunto');
    }
    
    // Construir la ruta completa al archivo
    const filePath = path.resolve(supplement.documentUrl);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('El archivo no existe en el servidor');
    }
    
    // Obtener el nombre original del archivo desde la URL
    const fileName = path.basename(supplement.documentUrl);
    
    // Determinar el tipo MIME basado en la extensión del archivo
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream'; // Tipo por defecto
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
      case '.docx':
        contentType = 'application/msword';
        break;
      case '.xls':
      case '.xlsx':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }
    
    // Configurar los encabezados para la descarga
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar el archivo como respuesta
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export default {
  getContractById,
  downloadContractDocument,
  downloadSupplementDocument
}; 