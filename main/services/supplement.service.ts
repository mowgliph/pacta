import { Supplement, PrismaClient } from "@prisma/client";
import { supplementSchema } from "../lib/schemas";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

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
    return prisma.supplement.create({
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
    return prisma.supplement.findUnique({
      where: { id },
      include: {
        createdBy: true,
        approvedBy: true,
        documents: true,
        contract: true,
      },
    });
  }

  async getAllSupplements(contractId?: string): Promise<Supplement[]> {
    return prisma.supplement.findMany({
      where: contractId ? { contractId } : undefined,
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

    return prisma.supplement.update({
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
    return prisma.supplement.delete({
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
    return prisma.supplement.update({
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
    return prisma.supplement.findMany({
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
    return prisma.supplement.findMany({
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
    return prisma.supplement.findMany({
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
    return prisma.supplement.findMany({
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
}
