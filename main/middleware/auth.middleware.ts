import { prisma } from "../lib/prisma";
import { AppError } from "./error.middleware";

export async function checkPermissions(
  userId: string,
  resource: string,
  action: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw AppError.notFound("Usuario no encontrado", "USER_NOT_FOUND");
  }

  try {
    const permissions = JSON.parse(user.role.permissions);
    const resourcePermissions = permissions[resource] || [];

    if (!resourcePermissions.includes(action)) {
      throw AppError.forbidden(
        "No tiene permisos para realizar esta acción",
        "PERMISSION_DENIED"
      );
    }
  } catch (error) {
    throw AppError.internal(
      "Error al verificar permisos",
      "PERMISSION_CHECK_ERROR"
    );
  }
}
