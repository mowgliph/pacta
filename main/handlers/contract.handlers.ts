import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import { ContractSchema } from '../validations/schemas/contract.schema';
import { prisma } from '../utils/prisma';
import fs from 'fs';
import path from 'path';

const EXPORTS_DIR = path.resolve(__dirname, '../../data/documents/exports');
const CONTRACTS_ATTACHMENTS_DIR = path.resolve(__dirname, '../../data/documents/contracts');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

function contractZodToPrisma(data: any) {
  const {
    bankDetails = {},
    legalRepresentative = {},
    providerObligations = [],
    clientObligations = [],
    contactPhones = [],
    notificationMethods = [],
    attachments, // ignorado
    ...rest
  } = data;
  return {
    ...rest,
    bankAccount: bankDetails.account,
    bankBranch: bankDetails.branch,
    bankAgency: bankDetails.agency,
    bankHolder: bankDetails.holder,
    bankCurrency: bankDetails.currency,
    repName: legalRepresentative.name,
    repPosition: legalRepresentative.position,
    repDocumentType: legalRepresentative.documentType,
    repDocumentNumber: legalRepresentative.documentNumber,
    repDocumentDate: legalRepresentative.documentDate,
    providerObligations: JSON.stringify(providerObligations),
    clientObligations: JSON.stringify(clientObligations),
    contactPhones: JSON.stringify(contactPhones),
    notificationMethods: JSON.stringify(notificationMethods),
  };
}

export function registerContractHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.CONTRACTS.LIST]: async (event, filters) => {
      logger.info('Listado de contratos solicitado', { filters });
      try {
        const contracts = await prisma.contract.findMany({
          where: filters || {},
        });
        return contracts;
      } catch (error) {
        logger.error('Error al listar contratos:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.CREATE]: async (event, contractData) => {
      logger.info('Creación de contrato solicitada', { contractData });
      try {
        const parsed = ContractSchema.parse(contractData);
        const prismaData = contractZodToPrisma(parsed);
        const contract = await prisma.contract.create({ data: prismaData });
        return contract;
      } catch (error) {
        logger.error('Error al crear contrato:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.UPDATE]: async (event, id, contractData) => {
      logger.info('Actualización de contrato solicitada', { id, contractData });
      try {
        const parsed = ContractSchema.partial().parse(contractData);
        const prismaData = contractZodToPrisma(parsed);
        delete prismaData.createdById;
        delete prismaData.ownerId;
        const contract = await prisma.contract.update({
          where: { id },
          data: prismaData,
        });
        return contract;
      } catch (error) {
        logger.error('Error al actualizar contrato:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.DELETE]: async (event, id) => {
      logger.info('Eliminación de contrato solicitada', { id });
      try {
        await prisma.contract.delete({ where: { id } });
        return true;
      } catch (error) {
        logger.error('Error al eliminar contrato:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.UPLOAD]: async (event, id, attachment) => {
      logger.info('Subida de archivo de contrato solicitada', { id, attachment });
      try {
        if (!attachment || !attachment.name || !attachment.data || !attachment.type) {
          throw new Error('Archivo adjunto inválido');
        }
        const ext = path.extname(attachment.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(attachment.type)) {
          throw new Error('Tipo de archivo no permitido. Solo PDF o Word.');
        }
        fs.mkdirSync(CONTRACTS_ATTACHMENTS_DIR, { recursive: true });
        const filePath = path.join(CONTRACTS_ATTACHMENTS_DIR, `${id}_${Date.now()}_${attachment.name}`);
        fs.writeFileSync(filePath, Buffer.from(attachment.data));
        logger.info('Archivo de contrato guardado en:', filePath);
        return { path: filePath };
      } catch (error) {
        logger.error('Error al subir archivo de contrato:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.EXPORT]: async (event, id, { format = 'pdf' } = {}) => {
      logger.info('Exportación de contrato solicitada', { id, format });
      try {
        fs.mkdirSync(EXPORTS_DIR, { recursive: true });
        let exportPath: string;
        if (format === 'docx') {
          exportPath = path.join(EXPORTS_DIR, `contrato_${id}_${Date.now()}.docx`);
          fs.writeFileSync(exportPath, Buffer.from('DOCX simulado del contrato'));
        } else {
          exportPath = path.join(EXPORTS_DIR, `contrato_${id}_${Date.now()}.pdf`);
          fs.writeFileSync(exportPath, Buffer.from('PDF simulado del contrato'));
        }
        logger.info('Contrato exportado en:', exportPath);
        return { path: exportPath };
      } catch (error) {
        logger.error('Error al exportar contrato:', error);
        throw error;
      }
    }
  };

  eventManager.registerHandlers(handlers);
} 