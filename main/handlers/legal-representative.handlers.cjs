const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { AppError } = require("../utils/error-handler.cjs");

function registerLegalRepresentativeHandlers() {
  const handlers = {
    // Crear un nuevo representante legal
    [IPC_CHANNELS.DATA.LEGAL_REPRESENTATIVES.CREATE]: async (event, data) => {
      try {
        if (!data) {
          throw AppError.validation(
            "Datos del representante legal requeridos",
            "LEGAL_REPRESENTATIVE_DATA_REQUIRED"
          );
        }

        // Verificar si ya existe un representante con el mismo documento
        if (data.documentNumber) {
          const existingRep = await prisma.legalRepresentative.findFirst({
            where: {
              documentNumber: data.documentNumber,
              companyName: data.companyName,
            },
          });

          if (existingRep) {
            // Si ya existe, devolver el existente en lugar de crear uno nuevo
            return { success: true, data: existingRep };
          }
        }

        // Crear el representante legal
        const legalRepresentative = await prisma.legalRepresentative.create({
          data: {
            name: data.name,
            position: data.position,
            documentType: data.documentType,
            documentNumber: data.documentNumber,
            documentDate: data.documentDate ? new Date(data.documentDate) : null,
            email: data.email,
            phone: data.phone,
            companyName: data.companyName,
            companyAddress: data.companyAddress,
            companyPhone: data.companyPhone,
            companyEmail: data.companyEmail,
            createdById: data.createdById,
          },
        });

        return { success: true, data: legalRepresentative };
      } catch (error) {
        console.error("Error al crear representante legal:", error);
        throw AppError.internal(
          "Error al crear representante legal",
          "LEGAL_REPRESENTATIVE_CREATE_ERROR",
          { error: error.message }
        );
      }
    },

    // Actualizar un representante legal existente
    [IPC_CHANNELS.DATA.LEGAL_REPRESENTATIVES.UPDATE]: async (event, { id, data }) => {
      try {
        if (!id) {
          throw AppError.validation(
            "ID de representante legal requerido",
            "LEGAL_REPRESENTATIVE_ID_REQUIRED"
          );
        }

        if (!data) {
          throw AppError.validation(
            "Datos de actualización requeridos",
            "LEGAL_REPRESENTATIVE_UPDATE_DATA_REQUIRED"
          );
        }

        const updated = await prisma.legalRepresentative.update({
          where: { id },
          data: {
            name: data.name,
            position: data.position,
            documentType: data.documentType,
            documentNumber: data.documentNumber,
            documentDate: data.documentDate ? new Date(data.documentDate) : null,
            email: data.email,
            phone: data.phone,
            companyName: data.companyName,
            companyAddress: data.companyAddress,
            companyPhone: data.companyPhone,
            companyEmail: data.companyEmail,
          },
        });

        return { success: true, data: updated };
      } catch (error) {
        console.error("Error al actualizar representante legal:", error);
        throw AppError.internal(
          "Error al actualizar representante legal",
          "LEGAL_REPRESENTATIVE_UPDATE_ERROR",
          { error: error.message }
        );
      }
    },

    // Obtener un representante legal por ID
    [IPC_CHANNELS.DATA.LEGAL_REPRESENTATIVES.GET]: async (event, id) => {
      try {
        if (!id) {
          throw AppError.validation(
            "ID de representante legal requerido",
            "LEGAL_REPRESENTATIVE_ID_REQUIRED"
          );
        }

        const legalRepresentative = await prisma.legalRepresentative.findUnique({
          where: { id },
          include: {
            contracts: true,
            supplements: true,
          },
        });

        if (!legalRepresentative) {
          throw AppError.notFound(
            "Representante legal no encontrado",
            "LEGAL_REPRESENTATIVE_NOT_FOUND"
          );
        }

        return { success: true, data: legalRepresentative };
      } catch (error) {
        console.error("Error al obtener representante legal:", error);
        throw AppError.internal(
          "Error al obtener representante legal",
          "LEGAL_REPRESENTATIVE_GET_ERROR",
          { error: error.message }
        );
      }
    },

    // Listar representantes legales
    [IPC_CHANNELS.DATA.LEGAL_REPRESENTATIVES.LIST]: async (event, { search = "", page = 1, limit = 10 } = {}) => {
      try {
        const skip = (page - 1) * limit;
        
        const where = {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { documentNumber: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        };

        const [items, total] = await Promise.all([
          prisma.legalRepresentative.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' },
            include: {
              contracts: {
                select: { id: true, contractNumber: true, companyName: true },
                take: 3,
              },
              _count: {
                select: { contracts: true, supplements: true },
              },
            },
          }),
          prisma.legalRepresentative.count({ where }),
        ]);

        return {
          success: true,
          data: {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error("Error al listar representantes legales:", error);
        throw AppError.internal(
          "Error al listar representantes legales",
          "LEGAL_REPRESENTATIVE_LIST_ERROR",
          { error: error.message }
        );
      }
    },
  };

  return handlers;
}

module.exports = {
  registerLegalRepresentativeHandlers,
};
