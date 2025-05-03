import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import { SupplementSchema } from '../validations/schemas/supplement.schema';
import { prisma } from '../utils/prisma';
import fs from 'fs';
import path from 'path';

const EXPORTS_DIR = path.resolve(__dirname, '../../data/documents/exports');
const SUPPLEMENTS_ATTACHMENTS_DIR = path.resolve(__dirname, '../../data/documents/supplements');
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

function supplementZodToPrisma(data: any) {
  // Eliminar campos que no existen en Prisma
  const { documents, metadata, ...rest } = data;
  return rest;
}

export function registerSupplementHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.SUPPLEMENTS.LIST]: async (event, contractId) => {
      logger.info('Listado de suplementos solicitado', { contractId });
      try {
        const supplements = await prisma.supplement.findMany({
          where: { contractId },
        });
        return supplements;
      } catch (error) {
        logger.error('Error al listar suplementos:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.CREATE]: async (event, contractId, supplementData) => {
      logger.info('Creación de suplemento solicitada', { contractId, supplementData });
      try {
        const parsed = SupplementSchema.parse({ ...supplementData, contractId });
        const prismaData = supplementZodToPrisma(parsed);
        const supplement = await prisma.supplement.create({ data: prismaData });
        return supplement;
      } catch (error) {
        logger.error('Error al crear suplemento:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.UPDATE]: async (event, id, supplementData) => {
      logger.info('Actualización de suplemento solicitada', { id, supplementData });
      try {
        const parsed = SupplementSchema.partial().parse(supplementData);
        const prismaData = supplementZodToPrisma(parsed);
        // No permitir modificar contractId en update
        delete prismaData.contractId;
        const supplement = await prisma.supplement.update({
          where: { id },
          data: prismaData,
        });
        return supplement;
      } catch (error) {
        logger.error('Error al actualizar suplemento:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.DELETE]: async (event, id) => {
      logger.info('Eliminación de suplemento solicitada', { id });
      try {
        await prisma.supplement.delete({ where: { id } });
        return true;
      } catch (error) {
        logger.error('Error al eliminar suplemento:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.UPLOAD]: async (event, id, attachment) => {
      logger.info('Subida de archivo de suplemento solicitada', { id, attachment });
      try {
        if (!attachment || !attachment.name || !attachment.data || !attachment.type) {
          throw new Error('Archivo adjunto inválido');
        }
        const ext = path.extname(attachment.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(attachment.type)) {
          throw new Error('Tipo de archivo no permitido. Solo PDF o Word.');
        }
        fs.mkdirSync(SUPPLEMENTS_ATTACHMENTS_DIR, { recursive: true });
        const filePath = path.join(SUPPLEMENTS_ATTACHMENTS_DIR, `${id}_${Date.now()}_${attachment.name}`);
        fs.writeFileSync(filePath, Buffer.from(attachment.data));
        logger.info('Archivo de suplemento guardado en:', filePath);
        return { path: filePath };
      } catch (error) {
        logger.error('Error al subir archivo de suplemento:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.EXPORT]: async (event, id, { format = 'pdf' } = {}) => {
      logger.info('Exportación de suplemento solicitada', { id, format });
      try {
        fs.mkdirSync(EXPORTS_DIR, { recursive: true });
        let exportPath: string;
        if (format === 'docx') {
          exportPath = path.join(EXPORTS_DIR, `suplemento_${id}_${Date.now()}.docx`);
          fs.writeFileSync(exportPath, Buffer.from('DOCX simulado del suplemento'));
        } else {
          exportPath = path.join(EXPORTS_DIR, `suplemento_${id}_${Date.now()}.pdf`);
          fs.writeFileSync(exportPath, Buffer.from('PDF simulado del suplemento'));
        }
        logger.info('Suplemento exportado en:', exportPath);
        return { path: exportPath };
      } catch (error) {
        logger.error('Error al exportar suplemento:', error);
        throw error;
      }
    },
  };

  eventManager.registerHandlers(handlers);
} 