import { prisma } from "../../lib/prisma";
import { withErrorHandling } from "../setup";
import { logger } from "../../utils/logger";
import { ContractService } from "../services/contract.service";
import { ContractsChannels } from "../channels/contracts.channels";
import { z } from "zod";
import { ErrorHandler } from "../error-handler";

// Esquemas de validación
const contractFilterSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Esquema de validación para BankDetails
const bankDetailsSchema = z.object({
  account: z.string().min(1),
  branch: z.string().min(1),
  agency: z.string().min(1),
  holder: z.string().min(1),
  currency: z.enum(["CUP", "MLC"]),
});

// Esquema de validación para LegalRepresentative
const legalRepresentativeSchema = z.object({
  name: z.string().min(1),
  position: z.string().min(1),
  documentType: z.string().min(1),
  documentNumber: z.string().min(1),
  documentDate: z.string().or(z.date()).transform((val) => new Date(val)),
});

// Esquema de validación para Attachment
const attachmentSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  documentUrl: z.string().optional(),
});

// Esquema de validación para contrato completo
const createContractSchema = z.object({
  contractNumber: z.string().min(1),
  title: z.string().min(1),
  parties: z.string().min(1),
  signDate: z.string().or(z.date()).transform((val) => new Date(val)),
  signPlace: z.string().min(1),
  type: z.string().min(1),
  companyName: z.string().min(1),
  companyAddress: z.string().min(1),
  nationality: z.string().min(1),
  commercialAuth: z.string().min(1),
  bankDetails: bankDetailsSchema,
  reeupCode: z.string().min(1),
  nit: z.string().min(1),
  contactPhones: z.array(z.string().min(1)),
  legalRepresentative: legalRepresentativeSchema,
  description: z.string().min(1),
  providerObligations: z.array(z.string().min(1)),
  clientObligations: z.array(z.string().min(1)),
  deliveryPlace: z.string().min(1),
  deliveryTerm: z.string().min(1),
  acceptanceProcedure: z.string().min(1),
  value: z.number().min(0),
  currency: z.enum(["MN", "MLC"]),
  paymentMethod: z.string().min(1),
  paymentTerm: z.string().min(1),
  warrantyTerm: z.string().min(1),
  warrantyScope: z.string().min(1),
  technicalStandards: z.string().optional(),
  claimProcedure: z.string().min(1),
  disputeResolution: z.string().min(1),
  latePaymentInterest: z.string().min(1),
  breachPenalties: z.string().min(1),
  notificationMethods: z.array(z.string().min(1)),
  minimumNoticeTime: z.string().min(1),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)),
  extensionTerms: z.string().min(1),
  earlyTerminationNotice: z.string().min(1),
  forceMajeure: z.string().min(1),
  attachments: z.array(attachmentSchema),
  status: z.enum(["Vigente", "Próximo a Vencer", "Vencido", "Archivado"]),
  isRestricted: z.boolean().default(false),
  createdById: z.string().uuid(),
  ownerId: z.string().uuid(),
});

const updateContractSchema = z.object({
  id: z.string().uuid(),
  data: createContractSchema.partial().extend({ updatedById: z.string().uuid() }),
});

export function setupContractHandlers(): void {
  // Obtener todos los contratos
  withErrorHandling(ContractsChannels.GET_ALL, async (_, filters) => {
    try {
      // Validar filtros
      const validatedFilters = contractFilterSchema.parse(filters);

      const { type, status, search, page, limit, sortBy, sortOrder } =
        validatedFilters;

      // Construir condiciones de consulta
      const where = {
        ...(type && { type }),
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      // Construir ordenación
      const orderBy = sortBy
        ? { [sortBy]: sortOrder }
        : { createdAt: sortOrder };

      // Ejecutar consulta principal con paginación
      const [contracts, total] = await Promise.all([
        prisma.contract.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.contract.count({ where }),
      ]);

      logger.info(`Contratos recuperados: ${contracts.length} de ${total}`);

      // Formato de respuesta con metadatos de paginación
      return {
        data: contracts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn(
          "Error de validación en filtros de contratos:",
          error.errors
        );
        throw ErrorHandler.createError(
          "ValidationError",
          "Filtros de búsqueda inválidos"
        );
      }
      throw error;
    }
  });

  // Obtener un contrato por ID
  withErrorHandling(
    ContractsChannels.GET_BY_ID,
    async (_, { id, includeDocuments = false }) => {
      try {
        // Validar ID
        if (!id || typeof id !== "string") {
          throw ErrorHandler.createError(
            "ValidationError",
            "ID de contrato no válido"
          );
        }

        // Definir relaciones a incluir
        const include: any = {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          supplements: true,
          history: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              timestamp: "desc" as const,
            },
          },
        };

        // Incluir documentos si se solicita
        if (includeDocuments) {
          include.documents = true;
        }

        // Buscar contrato con relaciones
        const contract = await prisma.contract.findUnique({
          where: { id },
          include,
        });

        if (!contract) {
          throw ErrorHandler.createError(
            "NotFoundError",
            "Contrato no encontrado"
          );
        }

        logger.info(`Contrato recuperado: ${id}`);
        return { contract };
      } catch (error) {
        if (
          error.type === "NotFoundError" ||
          error.type === "ValidationError"
        ) {
          throw error;
        }
        logger.error(`Error al obtener contrato ${id}:`, error);
        throw ErrorHandler.createError(
          "UnknownError",
          "Error al recuperar el contrato"
        );
      }
    }
  );

  // Crear un nuevo contrato
  withErrorHandling(ContractsChannels.CREATE, async (_, contractData) => {
    try {
      // Validar datos
      const validatedData = createContractSchema.parse(contractData);
      const {
        createdById,
        ownerId,
        bankDetails,
        legalRepresentative,
        contactPhones,
        providerObligations,
        clientObligations,
        notificationMethods,
        attachments,
        ...rest
      } = validatedData;

      // Serializar arrays y objetos
      const dataToSave = {
        contractNumber: validatedData.contractNumber,
        title: validatedData.title,
        parties: validatedData.parties,
        signDate: validatedData.signDate,
        signPlace: validatedData.signPlace,
        type: validatedData.type,
        companyName: validatedData.companyName,
        companyAddress: validatedData.companyAddress,
        nationality: validatedData.nationality,
        commercialAuth: validatedData.commercialAuth,
        bankAccount: bankDetails.account,
        bankBranch: bankDetails.branch,
        bankAgency: bankDetails.agency,
        bankHolder: bankDetails.holder,
        bankCurrency: bankDetails.currency,
        reeupCode: validatedData.reeupCode,
        nit: validatedData.nit,
        contactPhones: JSON.stringify(contactPhones),
        repName: legalRepresentative.name,
        repPosition: legalRepresentative.position,
        repDocumentType: legalRepresentative.documentType,
        repDocumentNumber: legalRepresentative.documentNumber,
        repDocumentDate: legalRepresentative.documentDate,
        description: validatedData.description,
        providerObligations: JSON.stringify(providerObligations),
        clientObligations: JSON.stringify(clientObligations),
        deliveryPlace: validatedData.deliveryPlace,
        deliveryTerm: validatedData.deliveryTerm,
        acceptanceProcedure: validatedData.acceptanceProcedure,
        value: String(validatedData.value),
        currency: validatedData.currency,
        paymentMethod: validatedData.paymentMethod,
        paymentTerm: validatedData.paymentTerm,
        warrantyTerm: validatedData.warrantyTerm,
        warrantyScope: validatedData.warrantyScope,
        technicalStandards: validatedData.technicalStandards,
        claimProcedure: validatedData.claimProcedure,
        disputeResolution: validatedData.disputeResolution,
        latePaymentInterest: validatedData.latePaymentInterest,
        breachPenalties: validatedData.breachPenalties,
        notificationMethods: JSON.stringify(notificationMethods),
        minimumNoticeTime: validatedData.minimumNoticeTime,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        extensionTerms: validatedData.extensionTerms,
        earlyTerminationNotice: validatedData.earlyTerminationNotice,
        forceMajeure: validatedData.forceMajeure,
        attachments: JSON.stringify(attachments),
        status: validatedData.status,
        isRestricted: validatedData.isRestricted,
        createdBy: { connect: { id: createdById } },
        owner: { connect: { id: ownerId } },
      };

      const contract = await prisma.contract.create({
        data: dataToSave,
      });

      // Crear registro de historial
      await prisma.historyRecord.create({
        data: {
          action: "CREATE",
          userId: createdById,
          entityType: "Contract",
          entityId: contract.id,
          details: "Contrato creado",
        },
      });

      logger.info(`Contrato creado: ${contract.id}`);
      return {
        success: true,
        contract,
        message: "Contrato creado exitosamente",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Error de validación al crear contrato:", error.errors);
        throw ErrorHandler.createError(
          "ValidationError",
          "Datos de contrato inválidos",
          error.format()
        );
      }
      logger.error("Error al crear contrato:", error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al crear el contrato"
      );
    }
  });

  // Actualizar un contrato
  withErrorHandling(ContractsChannels.UPDATE, async (_, payload) => {
    try {
      const { id, data } = updateContractSchema.parse(payload);
      const {
        bankDetails,
        legalRepresentative,
        contactPhones,
        providerObligations,
        clientObligations,
        notificationMethods,
        attachments,
        updatedById,
        ...rest
      } = data;

      // Serializar arrays y objetos si existen
      const dataToUpdate: any = {
        ...rest,
      };
      if (bankDetails) {
        dataToUpdate.bankAccount = bankDetails.account;
        dataToUpdate.bankBranch = bankDetails.branch;
        dataToUpdate.bankAgency = bankDetails.agency;
        dataToUpdate.bankHolder = bankDetails.holder;
        dataToUpdate.bankCurrency = bankDetails.currency;
      }
      if (legalRepresentative) {
        dataToUpdate.repName = legalRepresentative.name;
        dataToUpdate.repPosition = legalRepresentative.position;
        dataToUpdate.repDocumentType = legalRepresentative.documentType;
        dataToUpdate.repDocumentNumber = legalRepresentative.documentNumber;
        dataToUpdate.repDocumentDate = legalRepresentative.documentDate;
      }
      if (contactPhones) dataToUpdate.contactPhones = JSON.stringify(contactPhones);
      if (providerObligations) dataToUpdate.providerObligations = JSON.stringify(providerObligations);
      if (clientObligations) dataToUpdate.clientObligations = JSON.stringify(clientObligations);
      if (notificationMethods) dataToUpdate.notificationMethods = JSON.stringify(notificationMethods);
      if (attachments) dataToUpdate.attachments = JSON.stringify(attachments);

      // Actualizar contrato
      const contract = await prisma.contract.update({
        where: { id },
        data: dataToUpdate,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Crear registro de historial
      await prisma.historyRecord.create({
        data: {
          action: "UPDATE",
          userId: updatedById,
          entityType: "Contract",
          entityId: id,
          changes: JSON.stringify(data),
          details: "Contrato actualizado",
        },
      });

      logger.info(`Contrato actualizado: ${id}`);
      return {
        success: true,
        contract,
        message: "Contrato actualizado exitosamente",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn(
          "Error de validación al actualizar contrato:",
          error.errors
        );
        throw ErrorHandler.createError(
          "ValidationError",
          "Datos de actualización inválidos",
          error.format()
        );
      }
      if (error.type === "NotFoundError") {
        throw error;
      }
      logger.error(`Error al actualizar contrato:`, error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al actualizar el contrato"
      );
    }
  });

  // Eliminar un contrato
  withErrorHandling(ContractsChannels.DELETE, async (_, { id, userId }) => {
    try {
      // Validar ID
      if (!id || typeof id !== "string" || !userId) {
        throw ErrorHandler.createError(
          "ValidationError",
          "ID de contrato y usuario son requeridos"
        );
      }

      // Iniciar transacción para operación atómica
      await prisma.$transaction(async (tx) => {
        // Eliminar partes relacionadas
        await tx.contractAccess.deleteMany({
          where: { contractId: id },
        });

        // Eliminar historial
        await tx.historyRecord.deleteMany({
          where: {
            entityId: id,
            entityType: "Contract",
          },
        });

        // Eliminar contrato
        await tx.contract.delete({
          where: { id },
        });
      });

      // Crear registro de historial independiente
      await prisma.historyRecord.create({
        data: {
          action: "DELETE",
          userId,
          entityType: "Contract",
          entityId: id,
          details: "Contrato eliminado",
        },
      });

      logger.info(`Contrato eliminado: ${id}`);
      return {
        success: true,
        message: "Contrato eliminado exitosamente",
      };
    } catch (error) {
      if (error.type === "ValidationError") {
        throw error;
      }
      if (error.code === "P2025") {
        throw ErrorHandler.createError(
          "NotFoundError",
          "Contrato no encontrado"
        );
      }
      logger.error(`Error al eliminar contrato ${id}:`, error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al eliminar el contrato"
      );
    }
  });

  // Actualizar control de acceso de un contrato
  withErrorHandling(
    ContractsChannels.UPDATE_ACCESS,
    async (_, { id, accessControl, userId, userRole }) => {
      try {
        if (!id || !userId) {
          throw ErrorHandler.createError(
            "ValidationError",
            "ID de contrato y usuario son requeridos"
          );
        }

        const result = await ContractService.updateContractAccessControl(
          id,
          accessControl,
          userId,
          userRole
        );

        logger.info(`Control de acceso actualizado para contrato: ${id}`);
        return {
          success: true,
          ...Object.fromEntries(Object.entries(result).filter(([k]) => k !== 'success')),
          message: "Control de acceso actualizado",
        };
      } catch (error) {
        logger.error(
          `Error al actualizar control de acceso para contrato ${id}:`,
          error
        );
        throw error;
      }
    }
  );

  // Asignar usuarios a un contrato
  withErrorHandling(
    ContractsChannels.ASSIGN_USERS,
    async (_, { id, userAssignments, userId, userRole }) => {
      try {
        if (!id || !userId || !userAssignments) {
          throw ErrorHandler.createError(
            "ValidationError",
            "Datos incompletos para asignación de usuarios"
          );
        }

        const result = await ContractService.assignUsersToContract(
          id,
          userAssignments,
          userId,
          userRole
        );

        logger.info(`Usuarios asignados a contrato: ${id}`);
        return {
          success: true,
          ...Object.fromEntries(Object.entries(result).filter(([k]) => k !== 'success')),
          message: "Usuarios asignados correctamente",
        };
      } catch (error) {
        logger.error(`Error al asignar usuarios a contrato ${id}:`, error);
        throw error;
      }
    }
  );
}
