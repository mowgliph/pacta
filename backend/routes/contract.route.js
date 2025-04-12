const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT, authorizeRole } = require('../middleware/auth.middleware');
const { checkContractOwnershipOrAdmin } = require('../middleware/contract.permission.middleware');
// Importar schemas Zod
const { 
    createContractSchema, 
    updateContractSchema, 
    createSupplementSchema, 
    updateSupplementSchema 
} = require('../utils/schemas.zod'); 
const upload = require('../middleware/upload.middleware');
// const { deleteFile } = require('../utils/uploads');

const prisma = new PrismaClient();

// Get all contracts
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        user: true,
        company: true,
        department: true,
        obligations: true,
        deliveries: true,
        payments: true,
        guarantees: true,
        supplements: true,
        activities: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    res.json(contracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({ message: 'Error al obtener contratos', error: error.message });
  }
});

// Create new contract
router.post('/', authenticateJWT, upload.single('document'), async (req, res) => {
  try {
    // Validar con Zod (datos del cuerpo)
    const validatedData = createContractSchema.parse(req.body);
    const { name, type, description, startDate, endDate, status, companyId, departmentId } = validatedData;
    const userId = req.user.id;
    let documentPath = req.file ? req.file.path : null; // Obtener ruta del archivo si se subió

    const contract = await prisma.contract.create({
      data: {
        name,
        type,
        description,
        startDate, // Zod ya las convirtió a Date
        endDate,   // Zod ya las convirtió a Date
        status,
        documentPath,
        userId,
        companyId,
        departmentId,
      },
    });

    await prisma.accessLog.create({
      data: {
        userId: req.user.id,
        action: 'Create Contract',
        details: `Contract ${name} created`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json(contract);

  } catch (error) {
    if (error instanceof require('zod').ZodError) {
      // Si falla validación Zod, borrar archivo subido si existe
      // if (req.file && deleteFile) { ... }
      return res.status(400).json({ message: 'Datos de entrada inválidos', errors: error.errors });
    }
    console.error("Error creating contract:", error);
    // if (req.file && deleteFile) { ... } // Borrar archivo si falla la DB
    res.status(500).json({ message: 'Error al crear el contrato', error: error.message });
  }
});

// Get contract details
router.get('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: parseInt(id) },
      include: { 
        user: { select: { id: true, username: true } }, 
        supplements: true,
      },
    });
    if (!contract) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }
    res.json(contract);
  } catch (error) {
    console.error("Error fetching contract details:", error);
    res.status(500).json({ message: 'Error al obtener detalles del contrato', error: error.message });
  }
});

// Update contract
router.put('/:id',
  authenticateJWT,
  checkContractOwnershipOrAdmin,
  /* upload.single('document'), */
  async (req, res) => {
  const { id } = req.params;
  try {
    // Validar con Zod (datos opcionales)
    const validatedData = updateContractSchema.parse(req.body);
    
    // Asegurarse que no esté vacío después de validación (Zod podría permitir objeto vacío si todo es opcional)
    if (Object.keys(validatedData).length === 0) {
       return res.status(400).json({ message: 'No se proporcionaron datos válidos para actualizar.' });
    }

    // Si se permite subir archivo aquí, manejar req.file
    // if (req.file) { validatedData.documentPath = req.file.path; }

    const contract = await prisma.contract.update({
      where: { id: parseInt(id) }, 
      data: validatedData, // Usar los datos validados y parseados por Zod
    });
    res.json(contract);

  } catch (error) {
    if (error instanceof require('zod').ZodError) {
      return res.status(400).json({ message: 'Datos de entrada inválidos', errors: error.errors });
    }
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Contrato no encontrado para actualizar.' });
    }
    console.error("Error updating contract:", error);
    res.status(500).json({ message: 'Error al actualizar el contrato', error: error.message });
  }
});

// Delete contract
router.delete('/:id',
  authenticateJWT,
  authorizeRole(['Admin', 'RA']),
  async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.contract.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting contract:", error);
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Contrato no encontrado para eliminar.' });
    }
    res.status(500).json({ message: 'Error al eliminar el contrato', error: error.message });
  }
});

// Add supplement
router.post('/:contractId/supplements',
  authenticateJWT,
  checkContractOwnershipOrAdmin,
  /* upload.single('supplementFile'), */
  async (req, res) => {
  const { contractId } = req.params;
  const userId = req.user.id; // Obtener ID del usuario autenticado
  
  try {
    // Validar con Zod
    const { description } = createSupplementSchema.parse(req.body);
    // let filePath = null; // Manejar archivo si se sube
    // if (req.file) { filePath = req.file.path; }

    const contract = await prisma.contract.findUnique({ 
        where: { id: parseInt(contractId) }, 
        select: { name: true } // Necesitamos el nombre para los detalles de la actividad
    });
    if (!contract) {
        return res.status(404).json({ message: 'Contrato asociado no encontrado.' });
    }

    const supplement = await prisma.supplement.create({
      data: {
        description,
        // filePath,
        contractId: parseInt(contractId),
      }
    });

    // --- Registrar Actividad --- 
    await prisma.activity.create({
        data: {
            userId: userId,
            contractId: parseInt(contractId),
            action: 'CREATE_SUPPLEMENT', // Usar un string consistente
            // Incluir descripción del suplemento o un mensaje genérico
            details: `Se añadió suplemento: ${description}`,
            // No necesitamos ip o userAgent aquí, pero podrían añadirse
        }
    });
    // --------------------------

    res.status(201).json(supplement);

  } catch (error) {
    if (error instanceof require('zod').ZodError) {
      return res.status(400).json({ message: 'Datos de entrada inválidos', errors: error.errors });
    }
    console.error("Error adding supplement:", error);
    res.status(500).json({ message: 'Error al añadir el suplemento', error: error.message });
  }
});

// Update supplement
router.put('/:contractId/supplements/:supplementId',
  authenticateJWT,
  checkContractOwnershipOrAdmin,
  /* upload.single('supplementFile'), */
  async (req, res) => {
  const { contractId, supplementId } = req.params; // Obtener ambos IDs
  const userId = req.user.id; // Obtener ID del usuario

  try {
    // Validar con Zod
    const validatedData = updateSupplementSchema.parse(req.body);
    // if (req.file) { validatedData.filePath = req.file.path; }

    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos válidos para actualizar.' });
    }

    // Obtener datos del suplemento y contrato antes de actualizar (para detalles)
    const existingSupplement = await prisma.supplement.findUnique({
        where: { id: parseInt(supplementId) },
        select: { description: true, contract: { select: { name: true } } }
    });
    if (!existingSupplement) {
        // Este caso también lo captura el error P2025 de abajo, pero es más explícito aquí
        return res.status(404).json({ message: 'Suplemento no encontrado para actualizar.' });
    }

    const supplement = await prisma.supplement.update({
      where: { id: parseInt(supplementId) }, 
      data: validatedData,
    });

    // --- Registrar Actividad --- 
    // Crear una descripción de los cambios (simple por ahora)
    let changesDescription = 'Se actualizó el suplemento.';
    if (validatedData.description && validatedData.description !== existingSupplement.description) {
        changesDescription = `Se actualizó descripción del suplemento (antes: \"${existingSupplement.description}\", ahora: \"${validatedData.description}\")`;
    } else if (validatedData.filePath) {
        changesDescription = `Se actualizó el archivo del suplemento.`;
    }
    
    await prisma.activity.create({
        data: {
            userId: userId,
            contractId: parseInt(contractId),
            action: 'UPDATE_SUPPLEMENT', // Usar un string consistente
            details: changesDescription,
            // Podrías incluir el ID del suplemento en details si es útil
        }
    });
    // --------------------------

    res.json(supplement);

  } catch (error) {
    if (error instanceof require('zod').ZodError) {
      return res.status(400).json({ message: 'Datos de entrada inválidos', errors: error.errors });
    }
     if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Suplemento no encontrado para actualizar.' });
    }
    console.error("Error updating supplement:", error);
    res.status(500).json({ message: 'Error al actualizar el suplemento', error: error.message });
  }
});

// Upload document
router.post('/:id/upload',
  authenticateJWT,
  checkContractOwnershipOrAdmin,
  upload.single('document'),
  async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: 'No se proporcionó ningún archivo.' });
    }
    const documentPath = req.file.path;
    try {
        const updatedContract = await prisma.contract.update({
            where: { id: parseInt(id) },
            data: { documentPath: documentPath }
        });
        res.json({ message: 'Archivo subido correctamente.', contract: updatedContract });
    } catch (error) {
        console.error("Error updating contract document path:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Contrato no encontrado para adjuntar archivo.' });
        }
        res.status(500).json({ message: 'Error al actualizar la ruta del documento.', error: error.message });
    }
});

module.exports = router;