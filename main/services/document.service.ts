import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import fs from "fs/promises";
import path from "path";
import { app } from "electron";
import crypto from "crypto";
import mime from "mime-types";
import { DocumentFilters } from "../shared/types";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "../middleware/error.middleware";

/**
 * Servicio para la gestión de documentos
 */
export class DocumentService {
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

      if (filters?.fileType) {
        where.fileType = filters.fileType;
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
              ContractAccess: {
                some: {
                  userId,
                  canRead: true,
                },
              },
            },
            {
              ContractAccessRole: {
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
              title: true,
            },
          },
          createdBy: {
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
          contract: {
            include: {
              ContractAccess: true,
              ContractAccessRole: {
                include: {
                  role: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!document) {
        throw new NotFoundError(`Documento con ID ${id} no encontrado`);
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin") {
        const hasAccess =
          document.contract.createdById === userId ||
          document.contract.ContractAccess?.some(
            (access) => access.userId === userId && access.canRead
          );

        if (!hasAccess) {
          throw new AuthorizationError(
            "No tiene permiso para acceder a este documento"
          );
        }
      }

      return this.mapDocumentToDTO(document);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
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
          ContractAccess: true,
        },
      });

      if (!contract) {
        throw new NotFoundError(`Contrato con ID ${contractId} no encontrado`);
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin") {
        const hasUpdateAccess =
          contract.createdById === userId ||
          contract.ContractAccess?.some(
            (access) => access.userId === userId && access.canUpdate
          );

        if (!hasUpdateAccess) {
          throw new AuthorizationError(
            "No tiene permiso para añadir documentos a este contrato"
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
          name: documentData.name || fileData.originalname,
          description: documentData.description,
          fileType: fileData.mimetype,
          fileName: fileData.originalname,
          filePath: safeFileName, // Solo guardamos el nombre, no la ruta completa
          fileSize: fileStats.size,
          contract: {
            connect: { id: contractId },
          },
          createdBy: {
            connect: { id: userId },
          },
        },
        include: {
          contract: {
            select: {
              id: true,
              title: true,
            },
          },
          createdBy: {
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
          description: `Documento añadido: ${
            documentData.name || fileData.originalname
          }`,
          userId,
        },
      });

      logger.info(
        `Documento creado: ${document.id} para contrato ${contractId} por usuario ${userId}`
      );
      return this.mapDocumentToDTO(document);
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
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
              ContractAccess: true,
              ContractAccessRole: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!document) {
        throw new NotFoundError(`Documento con ID ${id} no encontrado`);
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin") {
        const hasAccess =
          document.contract.createdById === userId ||
          document.contract.ContractAccess?.some(
            (access) => access.userId === userId && access.canRead
          );

        if (!hasAccess) {
          throw new AuthorizationError(
            "No tiene permiso para acceder a este documento"
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
        throw new NotFoundError(
          `Archivo del documento no encontrado en el sistema`
        );
      }

      // Leer archivo
      const fileBuffer = await fs.readFile(filePath);

      // Registrar descarga en actividad (opcional)
      await this.logDocumentActivity(id, userId, "DOWNLOAD");

      return {
        buffer: fileBuffer,
        name: document.fileName,
        type: document.fileType,
      };
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
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
              ContractAccess: true,
            },
          },
        },
      });

      if (!document) {
        throw new NotFoundError(`Documento con ID ${id} no encontrado`);
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin") {
        const hasDeleteAccess =
          document.contract.createdById === userId ||
          document.contract.ContractAccess?.some(
            (access) => access.userId === userId && access.canDelete
          );

        if (!hasDeleteAccess) {
          throw new AuthorizationError(
            "No tiene permiso para eliminar este documento"
          );
        }
      }

      // Construir ruta al archivo
      const userDataPath = app.getPath("userData");
      const filePath = path.join(userDataPath, "documents", document.filePath);

      // Eliminar archivo físico
      try {
        await fs.unlink(filePath);
      } catch (err) {
        logger.warn(
          `Archivo no encontrado al eliminar documento ${id}: ${filePath}`
        );
        // Continuamos con la eliminación del registro aunque el archivo no exista
      }

      // Guardar referencia al contrato para historial
      const contractId = document.contract.id;
      const documentName = document.name;

      // Eliminar registro de la base de datos
      await prisma.document.delete({
        where: { id },
      });

      // Registrar en historial del contrato
      await prisma.historyRecord.create({
        data: {
          contractId,
          action: "DOCUMENT_DELETED",
          description: `Documento eliminado: ${documentName}`,
          userId,
        },
      });

      logger.info(`Documento ${id} eliminado por usuario ${userId}`);
      return { success: true };
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
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
      throw new ValidationError("Error de validación", errors);
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
      await prisma.documentActivity.create({
        data: {
          documentId,
          userId: userId || "anonymous",
          action,
          ipAddress: "0.0.0.0", // En una implementación real, pasaríamos la IP como parámetro
        },
      });
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
      fileName: document.fileName,
      fileSize: document.fileSize,
      contractId: document.contractId,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      contract: document.contract
        ? {
            id: document.contract.id,
            title: document.contract.title,
          }
        : undefined,
      createdBy: document.createdBy
        ? {
            id: document.createdBy.id,
            name: document.createdBy.name,
            email: document.createdBy.email,
          }
        : undefined,
      downloadUrl: `/api/documents/${document.id}/download`,
    };
  }
}
