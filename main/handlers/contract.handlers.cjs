const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const fs = require("fs").promises;
const path = require("path");
const { AppError } = require("../utils/error-handler.cjs");

// Directorios y configuración
const EXPORTS_DIR = path.resolve(__dirname, "../../data/documents/exports");
const CONTRACTS_ATTACHMENTS_DIR = path.resolve(
  __dirname,
  "../../data/documents/contracts"
);

// Función auxiliar para convertir datos del esquema Zod a formato Prisma
function contractZodToPrisma(data) {
  const {
    bankDetails = {},
    legalRepresentative = {},
    providerObligations = [],
    clientObligations = [],
    contactPhones = [],
    notificationMethods = [],
    attachments,
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

function registerContractHandlers() {
  const eventManager = EventManager.getInstance();

  // Asegurar que existen los directorios necesarios
  fs.mkdir(EXPORTS_DIR, { recursive: true }).catch(console.error);
  fs.mkdir(CONTRACTS_ATTACHMENTS_DIR, { recursive: true }).catch(console.error);

  // Handlers principales
  // Obtener contratos archivados
const getArchivedContracts = async (filters = {}) => {
  const { search = '', page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;
  
  const where = {
    status: 'Archivado',
    OR: search ? [
      { contractNumber: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ] : undefined
  };

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: { select: { name: true, email: true } },
        createdBy: { select: { name: true, email: true } }
      }
    }),
    prisma.contract.count({ where })
  ]);

  return {
    contracts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// Archivar un contrato
const archiveContract = async (contractId) => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId }
  });

  if (!contract) {
    throw new Error('Contrato no encontrado');
  }

  return prisma.contract.update({
    where: { id: contractId },
    data: {
      status: 'Archivado',
      updatedAt: new Date()
    }
  });
};

// Restaurar un contrato archivado
const restoreContract = async (contractId) => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId }
  });

  if (!contract) {
    throw new Error('Contrato no encontrado');
  }

  // Verificar si el contrato está vencido
  const now = new Date();
  const isExpired = new Date(contract.endDate) < now;
  
  return prisma.contract.update({
    where: { id: contractId },
    data: {
      status: isExpired ? 'Vencido' : 'Vigente',
      updatedAt: new Date()
    }
  });
};

const handlers = {
    [IPC_CHANNELS.DATA.CONTRACTS.LIST]: async (event, { page = 1, limit = 10, search = "" }) => {
      try {
        const skip = (page - 1) * limit;
        const where = search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { number: { contains: search, mode: "insensitive" } }
          ]
        } : {};

        const [contracts, total] = await Promise.all([
          prisma.contract.findMany({
            skip,
            take: limit,
            where,
            orderBy: { createdAt: "desc" },
            include: {
              client: true,
              provider: true,
              attachments: true
            }
          }),
          prisma.contract.count({ where })
        ]);

        console.info("Contratos listados exitosamente", { count: contracts.length, page, total });
        return {
          success: true,
          data: {
            contracts,
            total,
            page,
            limit
          }
        };
      } catch (error) {
        console.error("Error al listar contratos:", error);
        return {
          success: false,
          data: {
            contracts: [],
            total: 0,
            page: 1,
            limit: 10
          },
          error: {
            message: error.message || "Error al listar contratos",
            code: "CONTRACT_LIST_ERROR",
            context: {
              operation: "list",
              timestamp: new Date().toISOString(),
              errorDetails: error.message
            }
          }
        };
      }
    },
    // Listar contratos archivados
    [IPC_CHANNELS.DATA.CONTRACTS.LIST_ARCHIVED]: async (event, filters = {}) => {
      try {
        const result = await getArchivedContracts(filters);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error al listar contratos archivados:', error);
        return {
          success: false,
          error: {
            message: error.message || 'Error al listar contratos archivados',
            code: 'ARCHIVED_CONTRACTS_LIST_ERROR'
          }
        };
      }
    },

    // Archivar un contrato
    [IPC_CHANNELS.DATA.CONTRACTS.ARCHIVE]: async (event, contractId) => {
      try {
        if (!contractId) {
          throw new Error('ID de contrato no proporcionado');
        }
        
        const contract = await archiveContract(contractId);
        
        // Emitir evento de contrato archivado
        eventManager.emit('contract:archived', contract);
        
        return { success: true, data: contract };
      } catch (error) {
        console.error('Error al archivar contrato:', error);
        return {
          success: false,
          error: {
            message: error.message || 'Error al archivar el contrato',
            code: 'ARCHIVE_CONTRACT_ERROR'
          }
        };
      }
    },

    // Restaurar un contrato archivado
    [IPC_CHANNELS.DATA.CONTRACTS.RESTORE]: async (event, contractId) => {
      try {
        if (!contractId) {
          throw new Error('ID de contrato no proporcionado');
        }
        
        const contract = await restoreContract(contractId);
        
        // Emitir evento de contrato restaurado
        eventManager.emit('contract:restored', contract);
        
        return { success: true, data: contract };
      } catch (error) {
        console.error('Error al restaurar contrato:', error);
        return {
          success: false,
          error: {
            message: error.message || 'Error al restaurar el contrato',
            code: 'RESTORE_CONTRACT_ERROR'
          }
        };
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.LIST]: async (event, filters = {}) => {
      try {
        console.log('=== INICIO listar contratos ===');
        console.log('Filtros recibidos:', JSON.stringify(filters, null, 2));
        
        // Validar que Prisma esté disponible
        if (!prisma || !prisma.contract) {
          console.error('ERROR: Prisma o el modelo Contract no están disponibles');
          throw new Error('Error de configuración del servidor');
        }

        // Validar filtros
        if (filters && typeof filters !== 'object') {
          console.error('ERROR: Filtros inválidos:', filters);
          throw AppError.validation(
            "Filtros inválidos",
            "INVALID_FILTERS"
          );
        }

        // Construir el objeto where de manera segura
        const where = {};
        
        // Solo agregar los filtros válidos
        const validFilters = ['type', 'status', 'id', 'number', 'company'];
        Object.entries(filters).forEach(([key, value]) => {
          if (validFilters.includes(key) && value !== undefined) {
            // Manejar el caso especial de "Proximo a Vencer"
            if (key === 'status' && value === 'Proximo a Vencer') {
              where[key] = 'Proximo a Vencer';
            } else {
              where[key] = value;
            }
          }
        });
        
        // Si no hay filtros, devolver un array vacío
        if (Object.keys(where).length === 0) {
          console.log('No se proporcionaron filtros válidos, devolviendo array vacío');
          return [];
        }
        
        console.log('Consulta a la base de datos con where:', JSON.stringify(where, null, 2));
        
        // Ejecutar consulta con manejo de errores específico
        let contracts = [];
        try {
          contracts = await prisma.contract.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
              owner: {
                select: { name: true, email: true },
              },
              createdBy: {
                select: { name: true, email: true },
              }
            },
          });
          
          // Mapear los resultados para mantener la compatibilidad
          contracts = contracts.map(contract => ({
            ...contract,
            user: contract.owner // Mantener compatibilidad con el frontend
          }));
          
          console.log(`Consulta exitosa. Se encontraron ${contracts.length} contratos`);
        } catch (dbError) {
          console.error('ERROR en consulta a la base de datos:', dbError);
          console.error('Stack trace:', dbError.stack);
          throw new Error(`Error al consultar la base de datos: ${dbError.message}`);
        }
        
        console.log('=== FIN listar contratos ===');
        return contracts;
      } catch (error) {
        console.error("Error al listar contratos:", error);
        throw AppError.internal(
          "Error al listar contratos",
          "CONTRACT_LIST_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.CREATE]: async (event, data) => {
      try {
        if (!data) {
          throw AppError.validation(
            "Datos de contrato requeridos",
            "CONTRACT_DATA_REQUIRED"
          );
        }

        const prismaData = contractZodToPrisma(data);
        const contract = await prisma.contract.create({
          data: prismaData,
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        });

        console.info("Contrato creado exitosamente", { contractId: contract.id });
        return contract;
      } catch (error) {
        console.error("Error al crear contrato:", error);
        throw AppError.internal(
          "Error al crear contrato",
          "CONTRACT_CREATE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.UPDATE]: async (event, { id, data }) => {
      try {
        if (!id) {
          throw AppError.validation(
            "ID de contrato requerido",
            "CONTRACT_ID_REQUIRED"
          );
        }
        if (!data) {
          throw AppError.validation(
            "Datos de contrato requeridos",
            "CONTRACT_DATA_REQUIRED"
          );
        }

        const prismaData = contractZodToPrisma(data);
        const contract = await prisma.contract.update({
          where: { id },
          data: prismaData,
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        });

        console.info("Contrato actualizado exitosamente", { contractId: id });
        return contract;
      } catch (error) {
        console.error("Error al actualizar contrato:", error);
        throw AppError.internal(
          "Error al actualizar contrato",
          "CONTRACT_UPDATE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.DELETE]: async (event, id) => {
      try {
        if (!id) {
          throw AppError.validation(
            "ID de contrato requerido",
            "CONTRACT_ID_REQUIRED"
          );
        }

        await prisma.contract.delete({
          where: { id },
        });
        console.info("Contrato eliminado exitosamente", { contractId: id });
        return true;
      } catch (error) {
        console.error("Error al eliminar contrato:", error);
        throw AppError.internal(
          "Error al eliminar contrato",
          "CONTRACT_DELETE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.GET_BY_ID]: async (event, id) => {
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          user: {
            select: { name: true, email: true },
          },
          supplements: true,
          documents: true,
        },
      });

      if (!contract) {
        throw new Error("Contrato no encontrado");
      }

      return contract;
    },

    [IPC_CHANNELS.DATA.CONTRACTS.ARCHIVE]: async (event, id) => {
      const contract = await prisma.contract.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      return contract;
    },
  };

  // Registrar los manejadores con el eventManager
  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerContractHandlers,
};
