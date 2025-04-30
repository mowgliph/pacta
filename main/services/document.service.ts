import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import fs from "fs/promises";
import path from "path";
import { app } from "electron";
import crypto from "crypto";
import { DocumentFilters } from "../shared/types";
import { AppError } from "../middleware/error.middleware";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const documentSchema = z.object({
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  description: z.string().optional(),
  tags: z.string().optional(),
  isPublic: z.boolean().optional(),
  contractId: z.string().optional(),
  supplementId: z.string().optional(),
});

/**
 * Servicio para la gestión de documentos
 */
export class DocumentService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(app.getPath("userData"), "uploads");
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private generateSafeFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const safeName = baseName.replace(/[^a-zA-Z0-9]/g, "_");
    return `${safeName}_${uuidv4()}${ext}`;
  }

  /**
   * Obtiene todos los documentos con filtros opcionales
   * @param filters - Filtros opcionales
   * @param userId - ID del usuario
   * @param userRole - Rol del usuario
   */
  static async getDocuments(
    filters?: DocumentFilters,
    userId?: string,
    userRole?: string
  ) {
    try {
      // Construir condiciones de filtrado
      const where: any = {};

      if (filters?.contractId) {
        where.contractId = filters.contractId;
      }

      if (filters?.mimeType) {
        where.mimeType = filters.mimeType;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      // Si no es admin, verificar acceso a los contratos asociados
      if (userRole !== "Admin") {
        where.contract = {
          OR: [
            { createdById: userId },
            {
              accessUsers: {
                some: {
                  userId,
                  permissions: {
                    contains: "read",
                  },
                },
              },
            },
            {
              accessRoles: {
                some: {
                  role: {
                    users: {
                      some: {
                        id: userId,
                      },
                    },
                  },
                },
              },
            },
          ],
        };
      }

      // Obtener documentos
      const documents = await prisma.document.findMany({
        where,
        include: {
          contract: {
            select: {
              id: true,
              contractNumber: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return documents.map((doc) => this.mapDocumentToDTO(doc));
    } catch (error) {
      logger.error("Error al obtener documentos:", error);
      throw error;
    }
  }

  /**
   * Obtiene un documento por su ID
   * @param id - ID del documento
   * @param userId - ID del usuario
   * @param userRole - Rol del usuario
   */
  static async getDocumentById(id: string, userId?: string, userRole?: string) {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          contract: true,
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!document) {
        throw AppError.notFound(
          `Documento con ID ${id} no encontrado`,
          "DOCUMENT_NOT_FOUND"
        );
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin") {
        const hasAccess =
          document.uploadedById === userId ||
          (document.contractId &&
            (await this.checkDocumentContractAccess(
              document.contractId,
              userId
            )));

        if (!hasAccess) {
          throw AppError.forbidden(
            "No tiene permiso para acceder a este documento",
            "DOCUMENT_ACCESS_DENIED"
          );
        }
      }

      return this.mapDocumentToDTO(document);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Error al obtener documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo documento
   * @param contractId - ID del contrato asociado
   * @param fileData - Datos del archivo (buffer, nombre, etc)
   * @param documentData - Metadatos del documento
   * @param userId - ID del usuario
   * @param userRole - Rol del usuario
   */
  static async createDocument(
    contractId: string,
    fileData: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    },
    documentData: {
      name: string;
      description?: string;
    },
    userId: string,
    userRole?: string
  ) {
    try {
      // Verificar que el contrato existe
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
          accessUsers: true,
        },
      });

      if (!contract) {
        throw AppError.notFound(
          `Contrato con ID ${contractId} no encontrado`,
          "CONTRACT_NOT_FOUND"
        );
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin") {
        const hasUpdateAccess =
          contract.createdById === userId ||
          contract.accessUsers?.some((access) => {
            try {
              const permissions = JSON.parse(access.permissions);
              return access.userId === userId && permissions.update === true;
            } catch (e) {
              return false;
            }
          });

        if (!hasUpdateAccess) {
          throw AppError.forbidden(
            "No tiene permiso para añadir documentos a este contrato",
            "CONTRACT_UPDATE_DENIED"
          );
        }
      }

      // Validar datos del documento
      this.validateDocumentData(documentData, fileData);

      // Crear directorio para documentos si no existe
      const userDataPath = app.getPath("userData");
      const documentsDir = path.join(userDataPath, "documents");
      await fs.mkdir(documentsDir, { recursive: true });

      // Crear nombre de archivo seguro usando hash y extensión original
      const fileExt = path.extname(fileData.originalname);
      const hash = crypto
        .createHash("md5")
        .update(`${fileData.originalname}-${Date.now()}`)
        .digest("hex");
      const safeFileName = `${hash}${fileExt}`;
      const filePath = path.join(documentsDir, safeFileName);

      // Guardar archivo
      await fs.writeFile(filePath, fileData.buffer);

      // Obtener tamaño del archivo
      const fileStats = await fs.stat(filePath);

      // Crear registro en base de datos
      const document = await prisma.document.create({
        data: {
          fileName: safeFileName,
          name: documentData.name || fileData.originalname,
          fileType: fileData.mimetype,
          fileSize: fileStats.size,
          filePath: safeFileName,
          description: documentData.description,
          contract: {
            connect: { id: contractId },
          },
          uploadedBy: {
            connect: { id: userId },
          },
        },
        include: {
          contract: {
            select: {
              id: true,
              contractNumber: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Registrar en historial del contrato
      await prisma.historyRecord.create({
        data: {
          contractId,
          action: "DOCUMENT_ADDED",
          entityType: "Contract",
          entityId: contractId,
          userId,
          details: `Documento añadido al contrato ${contractId}`,
        },
      });

      logger.info(
        `Documento creado: ${document.id} para contrato ${contractId} por usuario ${userId}`
      );
      return this.mapDocumentToDTO(document);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error("Error al crear documento:", error);
      throw error;
    }
  }

  /**
   * Obtiene un archivo de documento para descarga
   * @param id - ID del documento
   * @param userId - ID del usuario
   * @param userRole - Rol del usuario
   */
  static async getDocumentFile(id: string, userId?: string, userRole?: string) {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          contract: {
            include: {
              accessUsers: true,
            },
          },
        },
      });

      if (!document) {
        throw AppError.notFound(
          `Documento con ID ${id} no encontrado`,
          "DOCUMENT_NOT_FOUND"
        );
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin" && document.contract) {
        const hasAccess =
          document.contract.createdById === userId ||
          document.contract.accessUsers?.some((access) => {
            try {
              const permissions = JSON.parse(access.permissions);
              return access.userId === userId && permissions.read === true;
            } catch (e) {
              return false;
            }
          });

        if (!hasAccess) {
          throw AppError.forbidden(
            "No tiene permiso para acceder a este documento",
            "DOCUMENT_ACCESS_DENIED"
          );
        }
      }

      // Construir ruta completa al archivo
      const userDataPath = app.getPath("userData");
      const filePath = path.join(userDataPath, "documents", document.filePath);

      // Verificar que el archivo existe
      try {
        await fs.access(filePath);
      } catch {
        throw AppError.notFound(
          `Archivo del documento no encontrado en el sistema`,
          "FILE_NOT_FOUND"
        );
      }

      // Leer archivo
      const fileBuffer = await fs.readFile(filePath);

      // Registrar descarga en actividad (opcional)
      await this.logDocumentActivity(id, userId, "DOWNLOAD");

      return {
        buffer: fileBuffer,
        name: document.name,
        type: document.fileType,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(`Error al obtener archivo de documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un documento
   * @param id - ID del documento
   * @param userId - ID del usuario
   * @param userRole - Rol del usuario
   */
  static async deleteDocument(id: string, userId: string, userRole?: string) {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          contract: {
            include: {
              accessUsers: true,
            },
          },
        },
      });

      if (!document) {
        throw AppError.notFound(
          `Documento con ID ${id} no encontrado`,
          "DOCUMENT_NOT_FOUND"
        );
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin" && document.contract) {
        const hasDeleteAccess =
          document.contract.createdById === userId ||
          document.contract.accessUsers?.some((access) => {
            try {
              const permissions = JSON.parse(access.permissions);
              return access.userId === userId && permissions.delete === true;
            } catch (e) {
              return false;
            }
          });

        if (!hasDeleteAccess) {
          throw AppError.forbidden(
            "No tiene permiso para eliminar este documento",
            "DOCUMENT_DELETE_DENIED"
          );
        }
      }

      // Construir ruta al archivo
      const userDataPath = app.getPath("userData");
      const filePath = path.join(userDataPath, "documents", document.filePath);

      // Eliminar archivo físico
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
      } catch (err) {
        logger.warn(
          `Archivo no encontrado al eliminar documento ${id}: ${document.filePath}`
        );
      }

      // Guardar referencia al contrato para historial
      const contractId = document.contract?.id;

      // Eliminar registro de la base de datos
      await prisma.document.delete({
        where: { id },
      });

      // Registrar en historial del contrato si existe contractId
      if (contractId) {
        await prisma.historyRecord.create({
          data: {
            contractId,
            action: "DOCUMENT_DELETED",
            entityType: "Contract",
            entityId: contractId,
            userId,
            details: `Documento eliminado del contrato ${contractId}`,
          },
        });
      }

      logger.info(`Documento ${id} eliminado por usuario ${userId}`);
      return { success: true };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(`Error al eliminar documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Valida los datos del documento
   * @param data - Datos a validar
   * @param fileData - Datos del archivo
   */
  private static validateDocumentData(
    data: { name: string; description?: string },
    fileData: { buffer: Buffer; originalname: string; mimetype: string }
  ) {
    const errors: Record<string, string> = {};

    // Validar nombre del documento
    if (!data.name) {
      errors.name = "El nombre del documento es obligatorio";
    } else if (data.name.length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
    } else if (data.name.length > 200) {
      errors.name = "El nombre no puede exceder los 200 caracteres";
    }

    // Validar descripción (si se proporciona)
    if (data.description && data.description.length > 1000) {
      errors.description =
        "La descripción no puede exceder los 1000 caracteres";
    }

    // Validar archivo
    if (!fileData || !fileData.buffer) {
      errors.file = "Se requiere un archivo";
    } else {
      // Validar tamaño de archivo (por ejemplo, máximo 20 MB)
      const maxSize = 20 * 1024 * 1024; // 20 MB
      if (fileData.buffer.length > maxSize) {
        errors.file = "El archivo no puede exceder los 20 MB";
      }

      // Validar tipo MIME (opcional)
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "image/jpeg",
        "image/png",
      ];

      if (!allowedTypes.includes(fileData.mimetype)) {
        errors.file =
          "Tipo de archivo no permitido. Los formatos aceptados son: PDF, Word, Excel, JPG y PNG";
      }
    }

    if (Object.keys(errors).length > 0) {
      throw AppError.validation(
        "Error de validación",
        "VALIDATION_ERROR",
        errors
      );
    }
  }

  /**
   * Registra actividad relacionada con documentos
   * @param documentId - ID del documento
   * @param userId - ID del usuario
   * @param action - Tipo de acción
   */
  private static async logDocumentActivity(
    documentId: string,
    userId?: string,
    action: "VIEW" | "DOWNLOAD" | "EDIT" = "VIEW"
  ) {
    try {
      // Omitimos esta funcionalidad ya que DocumentActivity no está definido en el schema
      // Podríamos implementarlo cuando exista el modelo en Prisma
      logger.info(
        `Actividad de documento: ${action} - ${documentId} - Usuario: ${
          userId || "anónimo"
        }`
      );
    } catch (error) {
      logger.error(
        `Error registrando actividad de documento: ${error.message}`
      );
      // No interrumpimos el flujo por un error de registro
    }
  }

  /**
   * Convierte un objeto de documento de la base de datos al formato DTO
   */
  private static mapDocumentToDTO(document: any) {
    return {
      id: document.id,
      name: document.name,
      description: document.description,
      fileType: document.fileType,
      fileName: document.originalName,
      fileSize: document.size,
      contractId: document.contractId,
      createdAt: document.createdAt || document.uploadedAt,
      updatedAt: document.updatedAt,
      contract: document.contract
        ? {
            id: document.contract.id,
            contractNumber: document.contract.contractNumber,
          }
        : undefined,
      createdBy: document.uploadedBy
        ? {
            id: document.uploadedBy.id,
            name: document.uploadedBy.name,
            email: document.uploadedBy.email,
          }
        : undefined,
      downloadUrl: `/api/documents/${document.id}/download`,
    };
  }

  // Implementar un método para verificar acceso a los contratos
  private static async checkDocumentContractAccess(
    contractId: string,
    userId?: string
  ): Promise<boolean> {
    if (!userId) return false;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: {
        createdById: true,
        accessUsers: true,
      },
    });

    if (!contract) return false;

    // Es el creador o tiene acceso explícito
    return (
      contract.createdById === userId ||
      contract.accessUsers.some((access) => {
        try {
          const permissions = JSON.parse(access.permissions);
          return access.userId === userId && permissions.read === true;
        } catch (e) {
          return false;
        }
      })
    );
  }

  async saveDocument(
    file: Buffer,
    metadata: z.infer<typeof documentSchema>,
    userId: string
  ): Promise<any> {
    // Validar metadata
    const validatedMetadata = documentSchema.parse(metadata);

    // Generar nombre seguro y ruta
    const safeFilename = this.generateSafeFilename(
      validatedMetadata.originalName
    );
    const filePath = path.join(this.uploadDir, safeFilename);

    // Guardar archivo
    await fs.writeFile(filePath, file);

    // Crear registro en la base de datos
    const document = await prisma.document.create({
      data: {
        fileName: safeFilename,
        name: validatedMetadata.originalName,
        fileType: validatedMetadata.mimeType,
        fileSize: validatedMetadata.size,
        filePath: filePath,
        description: validatedMetadata.description,
        tags: validatedMetadata.tags,
        isPublic: validatedMetadata.isPublic ?? false,
        contractId: validatedMetadata.contractId,
        supplementId: validatedMetadata.supplementId,
        uploadedById: userId,
      },
    });

    return document;
  }

  async getDocument(id: string): Promise<{ document: any; file: Buffer }> {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error("Documento no encontrado");
    }

    const file = await fs.readFile(document.filePath);
    return { document, file };
  }

  async updateDocument(
    id: string,
    metadata: Partial<z.infer<typeof documentSchema>>
  ): Promise<any> {
    const validatedMetadata = documentSchema.partial().parse(metadata);

    return prisma.document.update({
      where: { id },
      data: validatedMetadata,
    });
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error("Documento no encontrado");
    }

    // Eliminar archivo físico
    try {
      await fs.access(document.filePath);
      await fs.unlink(document.filePath);
    } catch (err) {
      logger.warn(
        `Archivo no encontrado al eliminar documento ${id}: ${document.filePath}`
      );
    }

    // Eliminar registro de la base de datos
    await prisma.document.delete({
      where: { id },
    });
  }

  async recordActivity(
    documentId: string,
    userId: string,
    action: "DOWNLOAD" | "VIEW" | "UPDATE" | "DELETE",
    ipAddress?: string
  ): Promise<void> {
    await prisma.documentActivity.create({
      data: {
        documentId,
        userId,
        action,
        ipAddress,
      },
    });

    // Actualizar contadores
    if (action === "DOWNLOAD") {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          downloads: { increment: 1 },
        },
      });
    } else if (action === "VIEW") {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          views: { increment: 1 },
        },
      });
    }
  }

  async listDocuments(filters: {
    contractId?: string;
    supplementId?: string;
    userId?: string;
    isPublic?: boolean;
  }): Promise<any[]> {
    return prisma.document.findMany({
      where: {
        ...filters,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });
  }
}
