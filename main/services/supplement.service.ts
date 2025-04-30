import { Supplement, PrismaClient } from "@prisma/client";
import { supplementSchema } from "../lib/schemas";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { ErrorHandler } from "../utils/error-handler";

const prismaClient = new PrismaClient();

export class SupplementService {
  async createSupplement(
    data: Omit<Supplement, "id" | "createdAt" | "updatedAt" | "approvedAt"> & {
      createdBy: { connect: { id: string } };
      contract: { connect: { id: string } };
      documents?: {
        create: {
          name: string;
          fileName: string;
          fileType: string;
          fileSize: number;
          filePath: string;
          description?: string;
          tags?: string;
          isPublic?: boolean;
          uploadedById: string;
        }[];
      };
    }
  ): Promise<Supplement> {
    // Validar datos con Zod
    const validatedData = supplementSchema.parse(data);

    // Generar ID único
    const id = uuidv4();

    const { approvedById, ...validatedDataWithoutApproved } = validatedData;
    // Crear suplemento
    return prismaClient.supplement.create({
      data: {
        ...validatedDataWithoutApproved,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isApproved: false,
        approvedAt: null,
        createdBy: data.createdBy,
        contract: data.contract,
        documents: data.documents,
      },
      include: {
        createdBy: true,
        approvedBy: true,
        documents: true,
        contract: true,
      },
    });
  }

  async getSupplementById(id: string): Promise<Supplement | null> {
    return prismaClient.supplement.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        changes: true,
        effectiveDate: true,
        isApproved: true,
        approvedById: true,
        approvedAt: true,
        documentUrl: true,
        contractId: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        contract: {
          select: {
            id: true,
            contractNumber: true,
            description: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getAllSupplements(contractId?: string): Promise<Supplement[]> {
    const supplements = await prismaClient.supplement.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        changes: true,
        effectiveDate: true,
        isApproved: true,
        approvedById: true,
        approvedAt: true,
        documentUrl: true,
        contractId: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        contract: {
          select: {
            id: true,
            contractNumber: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: contractId ? { contractId } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
    return supplements;
  }

  async updateSupplement(
    id: string,
    data: Partial<Supplement> & {
      documents?: {
        create?: {
          name: string;
          fileName: string;
          fileType: string;
          fileSize: number;
          filePath: string;
          description?: string;
          tags?: string;
          isPublic?: boolean;
          uploadedById: string;
        }[];
        delete?: { id: string }[];
      };
    }
  ): Promise<Supplement> {
    // Validar datos con Zod
    const validatedData = supplementSchema.partial().parse(data);

    return prismaClient.supplement.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
        documents: data.documents,
      },
      include: {
        createdBy: true,
        approvedBy: true,
        documents: true,
        contract: true,
      },
    });
  }

  async deleteSupplement(id: string): Promise<Supplement> {
    return prismaClient.supplement.delete({
      where: { id },
      include: {
        createdBy: true,
        approvedBy: true,
        documents: true,
        contract: true,
      },
    });
  }

  async approveSupplement(
    id: string,
    approvedById: string
  ): Promise<Supplement> {
    return prismaClient.supplement.update({
      where: { id },
      data: {
        isApproved: true,
        approvedById,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        createdBy: true,
        approvedBy: true,
        documents: true,
        contract: true,
      },
    });
  }

  async getSupplementsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Supplement[]> {
    return prismaClient.supplement.findMany({
      where: {
        effectiveDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        effectiveDate: "asc",
      },
      include: {
        createdBy: true,
        approvedBy: true,
        documents: true,
        contract: true,
      },
    });
  }

  async searchSupplements(query: string): Promise<Supplement[]> {
    return prismaClient.supplement.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: true,
        approvedBy: true,
        documents: true,
        contract: true,
      },
    });
  }

  // Nuevo método para obtener suplementos pendientes de aprobación
  async getPendingSupplements(): Promise<Supplement[]> {
    return prismaClient.supplement.findMany({
      where: {
        isApproved: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: true,
        approvedBy: true,
        documents: true,
        contract: true,
      },
    });
  }

  // Nuevo método para obtener suplementos por estado
  async getSupplementsByStatus(status: boolean): Promise<Supplement[]> {
    return prismaClient.supplement.findMany({
      where: {
        isApproved: status,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: true,
        approvedBy: true,
        documents: true,
        contract: true,
      },
    });
  }

  async findMany(): Promise<Supplement[]> {
    try {
      return await prisma.supplement.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contract: {
            select: {
              id: true,
              contractNumber: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      logger.error("Error al obtener suplementos:", error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al obtener suplementos"
      );
    }
  }

  async findById(id: string): Promise<Supplement | null> {
    try {
      return await prisma.supplement.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contract: {
            select: {
              id: true,
              contractNumber: true,
              description: true,
            },
          },
          documents: {
            select: {
              id: true,
              name: true,
              fileName: true,
              fileType: true,
              filePath: true,
              fileSize: true,
              uploadedAt: true,
            },
          },
          history: {
            select: {
              id: true,
              action: true,
              details: true,
              timestamp: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              timestamp: "desc",
            },
          },
        },
      });
    } catch (error) {
      logger.error(`Error al obtener suplemento con ID ${id}:`, error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al obtener suplementos"
      );
    }
  }

  async findByContractId(contractId: string): Promise<Supplement[]> {
    try {
      return await prisma.supplement.findMany({
        where: { contractId },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contract: {
            select: {
              id: true,
              contractNumber: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      logger.error(
        `Error al obtener suplementos del contrato ${contractId}:`,
        error
      );
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al obtener suplementos"
      );
    }
  }

  async create(data: {
    contractId: string;
    title: string;
    description?: string;
    documentUrl?: string;
    changes: string;
    effectiveDate: Date;
    createdById: string;
  }): Promise<Supplement> {
    try {
      return await prisma.supplement.create({
        data,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contract: {
            select: {
              id: true,
              contractNumber: true,
              description: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error("Error al crear suplemento:", error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al crear suplemento"
      );
    }
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      documentUrl?: string;
      changes?: string;
      effectiveDate?: Date;
    }
  ): Promise<Supplement> {
    try {
      return await prisma.supplement.update({
        where: { id },
        data,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contract: {
            select: {
              id: true,
              contractNumber: true,
              description: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error(`Error al actualizar suplemento con ID ${id}:`, error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al actualizar suplemento"
      );
    }
  }

  async approve(id: string, approvedById: string): Promise<Supplement> {
    try {
      return await prisma.supplement.update({
        where: { id },
        data: {
          isApproved: true,
          approvedById,
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          createdBy: true,
          approvedBy: true,
          documents: true,
          contract: true,
        },
      });
    } catch (error) {
      logger.error(`Error al aprobar suplemento con ID ${id}:`, error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al aprobar suplemento"
      );
    }
  }

  async reject(id: string): Promise<Supplement> {
    try {
      return await prisma.supplement.update({
        where: { id },
        data: {
          isApproved: false,
          approvedById: null,
          approvedAt: null,
        },
        include: {
          createdBy: true,
          contract: true,
        },
      });
    } catch (error) {
      logger.error(`Error al rechazar suplemento con ID ${id}:`, error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al rechazar suplemento"
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.supplement.delete({
        where: { id },
      });
    } catch (error) {
      logger.error(`Error al eliminar suplemento con ID ${id}:`, error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al eliminar suplemento"
      );
    }
  }
}
