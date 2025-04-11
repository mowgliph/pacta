const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware para verificar si el usuario autenticado es el propietario del contrato
 * o si tiene rol 'Admin' o 'RA'.
 * Debe usarse DESPUÉS de authenticateJWT.
 */
const checkContractOwnershipOrAdmin = async (req, res, next) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  // Intentar obtener ID del contrato de los parámetros de la ruta
  const contractId = req.params.id || req.params.contractId; 

  if (!userId || !userRole) {
    console.warn('checkContractOwnershipOrAdmin llamado sin req.user');
    return res.sendStatus(401); // No autenticado
  }

  if (!contractId) {
    console.warn('checkContractOwnershipOrAdmin llamado sin ID de contrato en params');
    return res.status(400).json({ message: 'Falta el ID del contrato.' });
  }

  // Si es Admin o RA, permitir acceso
  if (userRole === 'Admin' || userRole === 'RA') {
    return next();
  }

  // Si no es Admin/RA, verificar si es el propietario
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: parseInt(contractId) },
      select: { userId: true }, // Solo necesitamos el userId del contrato
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contrato no encontrado.' });
    }

    if (contract.userId === userId) {
      // El usuario es el propietario
      return next();
    }

    // Si no es Admin/RA y no es el propietario
    return res.sendStatus(403); // Forbidden

  } catch (error) {
    console.error("Error verificando propiedad del contrato:", error);
    // Manejar error si parseInt falla
    if (error instanceof SyntaxError || error instanceof TypeError) {
        return res.status(400).json({ message: 'ID de contrato inválido.'});
    }
    return res.status(500).json({ message: 'Error interno al verificar permisos.' });
  }
};

module.exports = { checkContractOwnershipOrAdmin }; 