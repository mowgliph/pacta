import { ipcMain } from "electron";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { z } from "zod";
import { hashSync, compareSync } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { config } from "../lib/config";
import * as fs from "fs";
import * as path from "path";

// Definir el esquema de validación para las peticiones
const RequestSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  endpoint: z.string(),
  data: z.any().optional(),
  params: z.record(z.string(), z.any()).optional(),
});

type RequestType = z.infer<typeof RequestSchema>;

// Mapa de rutas y controladores
const routeHandlers: Record<string, (req: RequestType) => Promise<any>> = {
  // Rutas de contratos
  "/api/contracts": handleContractsRoute,
  "/api/contracts/stats": handleContractStatsRoute,

  // Rutas de dashboard
  "/api/dashboard/summary": handleDashboardSummaryRoute,
  "/api/dashboard/by-status": handleDashboardByStatusRoute,
  "/api/dashboard/by-type": handleDashboardByTypeRoute,
  "/api/dashboard/activity": handleDashboardActivityRoute,

  // Rutas de backups
  "/api/backups": handleBackupsRoute,

  // Rutas de usuarios
  "/api/users": handleUsersRoute,

  // Rutas de autenticación
  "/api/auth/login": handleAuthLoginRoute,
  "/api/auth/verify": handleAuthVerifyRoute,
  "/api/auth/refresh": handleAuthRefreshRoute,
  "/api/auth/change-password": handleChangePasswordRoute,

  // Rutas de suplementos
  "/api/supplements": handleSupplementsRoute,

  // Rutas de documentos
  "/api/documents": handleDocumentsRoute,
};

/**
 * Registra el manejador de peticiones de API
 */
export function registerApiRequestHandler() {
  ipcMain.handle("api:request", async (_, request) => {
    try {
      // Validar la petición
      const validatedRequest = RequestSchema.parse(request);

      // Extraer información de la ruta
      const { endpoint, method } = validatedRequest;

      // Buscar el endpoint base (sin parámetros de ruta)
      const baseEndpoint = getBaseEndpoint(endpoint);
      const routeHandler = routeHandlers[baseEndpoint];

      if (!routeHandler) {
        logger.error(`Ruta no encontrada: ${endpoint}`);
        return {
          success: false,
          message: `Ruta no encontrada: ${endpoint}`,
          data: null,
        };
      }

      // Procesar la petición
      const result = await routeHandler(validatedRequest);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error("Error procesando petición API:", error);

      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        data: null,
      };
    }
  });
}

/**
 * Extrae el endpoint base sin parámetros de ruta
 * Ejemplo: /api/contracts/123 -> /api/contracts
 */
function getBaseEndpoint(endpoint: string): string {
  // Dividir la ruta por "/"
  const parts = endpoint.split("/");

  // Si la ruta tiene formato /api/resource/:id
  if (parts.length > 3 && !isNaN(Number(parts[3]))) {
    return `/${parts[1]}/${parts[2]}`;
  }

  // Si la ruta tiene formato /api/resource/:id/action
  if (parts.length > 4 && !isNaN(Number(parts[3]))) {
    return `/${parts[1]}/${parts[2]}`;
  }

  return endpoint;
}

// Implementación de manejadores de rutas
async function handleContractsRoute(req: RequestType) {
  const { method, endpoint, data, params } = req;

  // Extraer ID si existe en la ruta
  const id = endpoint.split("/")[3];

  switch (method) {
    case "GET":
      if (id) {
        // Obtener contrato específico
        return await prisma.contract.findUnique({
          where: { id },
          include: {
            supplements: true,
            documents: true,
          },
        });
      } else {
        // Listar contratos con filtros
        const { status, type, search } = params || {};

        const where: any = {};
        if (status) where.status = status;
        if (type) where.type = type;
        if (search) {
          where.OR = [
            { contractNumber: { contains: search, mode: "insensitive" } },
            { companyName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        return await prisma.contract.findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: {
            supplements: { select: { id: true } },
          },
        });
      }

    case "POST":
      // Crear nuevo contrato
      return await prisma.contract.create({
        data,
      });

    case "PATCH":
      // Actualizar contrato
      if (endpoint.includes("status")) {
        // Actualizar estado
        return await prisma.contract.update({
          where: { id },
          data: { status: data.status },
        });
      } else {
        // Actualización general
        return await prisma.contract.update({
          where: { id },
          data,
        });
      }

    case "DELETE":
      // Eliminar contrato
      return await prisma.contract.delete({
        where: { id },
      });

    default:
      throw new Error(`Método no soportado: ${method}`);
  }
}

async function handleContractStatsRoute(req: RequestType) {
  // Obtener estadísticas de contratos
  const activeCount = await prisma.contract.count({
    where: { status: "ACTIVE" },
  });

  const pendingCount = await prisma.contract.count({
    where: { status: "PENDING" },
  });

  const expiredCount = await prisma.contract.count({
    where: { status: "EXPIRED" },
  });

  const archivedCount = await prisma.contract.count({
    where: { status: "ARCHIVED" },
  });

  return {
    active: activeCount,
    pending: pendingCount,
    expired: expiredCount,
    archived: archivedCount,
    total: activeCount + pendingCount + expiredCount + archivedCount,
  };
}

async function handleDashboardSummaryRoute(req: RequestType) {
  // Implementación del resumen del dashboard
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return {
    totalContracts: await prisma.contract.count(),
    activeContracts: await prisma.contract.count({
      where: { status: "ACTIVE" },
    }),
    expiringContracts: await prisma.contract.count({
      where: {
        status: "ACTIVE",
        endDate: {
          lte: thirtyDaysFromNow,
        },
      },
    }),
    recentActivity: await prisma.contract.count({
      where: {
        OR: [
          { createdAt: { gte: sevenDaysAgo } },
          { updatedAt: { gte: sevenDaysAgo } },
        ],
      },
    }),
  };
}

async function handleDashboardByStatusRoute(req: RequestType) {
  // Implementación de datos por estado para el dashboard
  const statusCounts = await prisma.contract.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  return statusCounts.map((item) => ({
    status: item.status,
    count: item._count.id,
  }));
}

async function handleDashboardByTypeRoute(req: RequestType) {
  // Implementación de datos por tipo para el dashboard
  const typeCounts = await prisma.contract.groupBy({
    by: ["type"],
    _count: { id: true },
  });

  return typeCounts.map((item) => ({
    type: item.type,
    count: item._count.id,
  }));
}

async function handleDashboardActivityRoute(req: RequestType) {
  // Implementación de actividad reciente para el dashboard
  const recentContracts = await prisma.contract.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      supplements: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Transformar a formato de actividad
  return recentContracts.map((contract) => {
    // Propiedades seguras con valores por defecto
    const contractId = contract.id;
    const contractTitle = contract.title || "Contrato sin título";
    const contractNumber =
      contract.contractNumber || contractId.substring(0, 8);
    const contractCompany = contract.companyName || "Empresa";

    return {
      id: contractId,
      title: contractCompany,
      type: "contract",
      date: contract.createdAt,
      description: `Contrato ${contractNumber} - ${contractTitle}`,
    };
  });
}

async function handleAuthLoginRoute(req: RequestType) {
  const { method, data } = req;

  if (method !== "POST") {
    throw new Error("Método no soportado");
  }

  const { usuario, password, rememberMe = false } = data;

  // Buscar usuario por email
  const user = await prisma.user.findUnique({
    where: { email: usuario },
    include: { role: true },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Verificar contraseña
  const passwordValid = compareSync(password, user.password);

  if (!passwordValid) {
    throw new Error("Contraseña incorrecta");
  }

  // Generar token
  const expiresIn = rememberMe ? "7d" : "24h";
  const token = sign(
    { userId: user.id, role: user.role.name },
    config.jwtSecret,
    { expiresIn }
  );

  // Calcular fecha de expiración
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (rememberMe ? 168 : 24));

  // Retornar datos de usuario (sin contraseña) y token
  const { password: _, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
    expiresAt: expiresAt.toISOString(),
  };
}

async function handleAuthVerifyRoute(req: RequestType) {
  const { method, data } = req;

  if (method !== "POST") {
    throw new Error("Método no soportado");
  }

  const { token } = data;

  if (!token) {
    return { valid: false };
  }

  try {
    // Verificar token
    const decoded = verify(token, config.jwtSecret);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false };
  }
}

async function handleAuthRefreshRoute(req: RequestType) {
  const { method, data } = req;

  if (method !== "POST") {
    throw new Error("Método no soportado");
  }

  const { token } = data;

  if (!token) {
    return { valid: false, renewed: false };
  }

  try {
    // Verificar token actual
    const decoded = verify(token, config.jwtSecret) as {
      userId: string;
      role: string;
    };

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user) {
      return { valid: false, renewed: false };
    }

    // Generar nuevo token
    const newToken = sign(
      { userId: user.id, role: user.role.name },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Retornar datos de usuario y nuevo token
    const { password: _, ...userWithoutPassword } = user;

    return {
      valid: true,
      renewed: true,
      token: newToken,
      user: userWithoutPassword,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    return { valid: false, renewed: false };
  }
}

async function handleChangePasswordRoute(req: RequestType) {
  const { method, data } = req;

  if (method !== "POST") {
    throw new Error("Método no soportado");
  }

  const { userId, currentPassword, newPassword } = data;

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Verificar contraseña actual
  const passwordValid = compareSync(currentPassword, user.password);

  if (!passwordValid) {
    throw new Error("Contraseña actual incorrecta");
  }

  // Actualizar contraseña
  const hashedPassword = hashSync(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
}

async function handleBackupsRoute(req: RequestType) {
  const { method, endpoint, data } = req;

  // Extraer ID si existe en la ruta
  const id = endpoint.split("/")[3];

  // Configurar rutas de respaldo
  const backupDir = path.join(process.cwd(), "data", "backups");

  // Asegurar que existe el directorio
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  switch (method) {
    case "GET":
      // Listar backups disponibles
      try {
        const backupFiles = fs
          .readdirSync(backupDir)
          .filter((file) => file.endsWith(".db") || file.endsWith(".sqlite"))
          .map((file) => {
            const filePath = path.join(backupDir, file);
            const stats = fs.statSync(filePath);

            return {
              id: file,
              fileName: file,
              size: stats.size,
              createdAt: stats.birthtime.toISOString(),
              description: "",
            };
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        return backupFiles;
      } catch (error) {
        logger.error("Error listing backups:", error);
        return [];
      }

    case "POST":
      if (id && endpoint.includes("restore")) {
        // Restaurar backup
        try {
          const backupFile = path.join(backupDir, id);

          if (!fs.existsSync(backupFile)) {
            throw new Error(`Archivo de respaldo no encontrado: ${id}`);
          }

          // Implementar lógica de restauración (dependiendo de la base de datos)
          // Esto es un ejemplo simplificado:

          // 1. Cerrar todas las conexiones de la base de datos
          await prisma.$disconnect();

          // 2. Copiar el archivo de respaldo a la ubicación de la base de datos
          const dbPath =
            process.env.DATABASE_URL?.replace("file:", "") || "data/pacta.db";
          fs.copyFileSync(backupFile, dbPath);

          // 3. Reconectar la base de datos
          // (Prisma se reconecta automáticamente en la siguiente consulta)

          return { success: true };
        } catch (error) {
          logger.error("Error restoring backup:", error);
          throw error;
        }
      } else {
        // Crear backup
        try {
          // Nombre del archivo con timestamp
          const timestamp = new Date().toISOString().replace(/:/g, "-");
          const backupFileName = `backup_${timestamp}.db`;
          const backupFile = path.join(backupDir, backupFileName);

          // Obtener ruta de la base de datos
          const dbPath =
            process.env.DATABASE_URL?.replace("file:", "") || "data/pacta.db";

          // Copiar archivo
          fs.copyFileSync(dbPath, backupFile);

          // Obtener información del archivo
          const stats = fs.statSync(backupFile);

          return {
            id: backupFileName,
            fileName: backupFileName,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
            description:
              data?.description ||
              `Respaldo manual - ${new Date().toLocaleString()}`,
          };
        } catch (error) {
          logger.error("Error creating backup:", error);
          throw error;
        }
      }

    case "DELETE":
      // Eliminar backup
      try {
        const backupFile = path.join(backupDir, id);

        if (!fs.existsSync(backupFile)) {
          throw new Error(`Archivo de respaldo no encontrado: ${id}`);
        }

        fs.unlinkSync(backupFile);

        return { success: true };
      } catch (error) {
        logger.error("Error deleting backup:", error);
        throw error;
      }

    default:
      throw new Error(`Método no soportado: ${method}`);
  }
}

async function handleUsersRoute(req: RequestType) {
  const { method, endpoint, data } = req;

  // Extraer ID si existe en la ruta
  const id = endpoint.split("/")[3];

  switch (method) {
    case "GET":
      if (id) {
        // Obtener usuario específico
        const user = await prisma.user.findUnique({
          where: { id },
          include: { role: true },
        });

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        // Omitir contraseña
        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
      } else {
        // Listar usuarios
        const users = await prisma.user.findMany({
          include: { role: true },
          orderBy: { name: "asc" },
        });

        // Omitir contraseñas
        return users.map((user) => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
      }

    case "POST":
      // Crear usuario
      const hashedPassword = hashSync(data.password, 10);

      const newUser = await prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        include: { role: true },
      });

      // Omitir contraseña
      const { password, ...newUserWithoutPassword } = newUser;

      return newUserWithoutPassword;

    case "PUT":
    case "PATCH":
      // Actualizar usuario
      if (!id) {
        throw new Error("ID de usuario no especificado");
      }

      // Verificar si incluye cambio de contraseña
      const updateData = { ...data };
      if (updateData.password) {
        updateData.password = hashSync(updateData.password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        include: { role: true },
      });

      // Omitir contraseña
      const { password: _, ...updatedUserWithoutPassword } = updatedUser;

      return updatedUserWithoutPassword;

    case "DELETE":
      // Eliminar usuario
      if (!id) {
        throw new Error("ID de usuario no especificado");
      }

      await prisma.user.delete({
        where: { id },
      });

      return { success: true };

    default:
      throw new Error(`Método no soportado: ${method}`);
  }
}

async function handleSupplementsRoute(req: RequestType) {
  const { method, endpoint, data, params } = req;

  // Extraer ID si existe en la ruta
  const id = endpoint.split("/")[3];

  switch (method) {
    case "GET":
      if (id) {
        // Obtener un suplemento específico
        return await prisma.supplement.findUnique({
          where: { id },
          include: {
            contract: true,
            documents: true,
          },
        });
      } else {
        // Listar suplementos de un contrato
        const { contractId } = params || {};

        if (!contractId) {
          throw new Error("ID de contrato no especificado");
        }

        return await prisma.supplement.findMany({
          where: { contractId },
          orderBy: { createdAt: "desc" },
          include: {
            documents: true,
          },
        });
      }

    case "POST":
      // Crear suplemento
      return await prisma.supplement.create({
        data,
        include: {
          contract: true,
        },
      });

    case "PUT":
    case "PATCH":
      // Actualizar suplemento
      if (!id) {
        throw new Error("ID de suplemento no especificado");
      }

      return await prisma.supplement.update({
        where: { id },
        data,
        include: {
          contract: true,
        },
      });

    case "DELETE":
      // Eliminar suplemento
      if (!id) {
        throw new Error("ID de suplemento no especificado");
      }

      await prisma.supplement.delete({
        where: { id },
      });

      return { success: true };

    default:
      throw new Error(`Método no soportado: ${method}`);
  }
}

async function handleDocumentsRoute(req: RequestType) {
  const { method, endpoint, data, params } = req;

  // Extraer ID si existe en la ruta
  const id = endpoint.split("/")[3];

  // Configurar directorio de documentos
  const docsDir = path.join(process.cwd(), "data", "documents");

  // Asegurar que existe el directorio
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  switch (method) {
    case "GET":
      if (id) {
        // Obtener documento específico
        const document = await prisma.document.findUnique({
          where: { id },
        });

        if (!document) {
          throw new Error("Documento no encontrado");
        }

        return document;
      } else {
        // Listar documentos
        const { contractId, supplementId } = params || {};

        const where: any = {};
        if (contractId) where.contractId = contractId;
        if (supplementId) where.supplementId = supplementId;

        return await prisma.document.findMany({
          where,
          orderBy: { uploadedAt: "desc" },
        });
      }

    case "POST":
      // Crear documento - implementación básica
      if (data) {
        return await prisma.document.create({
          data: {
            filename: data.filename,
            originalName: data.originalName,
            mimeType: data.mimeType,
            size: data.size,
            path: data.path,
            contractId: data.contractId,
            supplementId: data.supplementId,
            uploadedById: data.uploadedById,
            description: data.description,
            tags: data.tags,
            isPublic: data.isPublic || false,
          },
        });
      }
      throw new Error("Datos insuficientes para crear documento");

    case "DELETE":
      // Eliminar documento
      if (id) {
        return await prisma.document.delete({
          where: { id },
        });
      }
      throw new Error("ID de documento requerido para eliminar");

    default:
      throw new Error(`Método no soportado: ${method}`);
  }
}
