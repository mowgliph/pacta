/**
 * Crear un nuevo suplemento para un contrato
 */
export const createSupplement = async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    
    // Validar que el contrato existe
    const existingContract = await prisma.contract.findUnique({
      where: { id: contractId }
    });
    
    if (!existingContract) {
      return res.status(404).json({ error: 'El contrato no existe' });
    }

    // Obtener datos del formulario
    const supplementDataString = req.body.data;
    
    if (!supplementDataString) {
      return res.status(400).json({ error: 'No se proporcionaron datos del suplemento' });
    }
    
    let supplementData;
    try {
      supplementData = JSON.parse(supplementDataString);
    } catch (error) {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }
    
    const { name, description, effectiveDate, validity, newAgreements } = supplementData;
    
    if (!name || !effectiveDate) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Manejar archivo si existe
    let documentUrl = null;
    if (req.file) {
      // Aquí se procesaría la subida del archivo a S3 o similar
      // Por ahora, simulamos una URL
      documentUrl = `/uploads/supplements/${req.file.filename}`;
    }
    
    // Crear el suplemento
    const supplement = await prisma.supplement.create({
      data: {
        name,
        description,
        effectiveDate: new Date(effectiveDate),
        documentUrl,
        validity,
        newAgreements,
        createdBy: req.user?.id || 'system',
        contractId
      }
    });
    
    // Actualizar el contrato para indicar que tiene suplementos
    await prisma.contract.update({
      where: { id: contractId },
      data: { hasSupplements: true }
    });
    
    return res.status(201).json(supplement);
  } catch (error) {
    console.error('Error al crear suplemento:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Actualizar un suplemento existente
 */
export const updateSupplement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar que el suplemento existe
    const existingSupplement = await prisma.supplement.findUnique({
      where: { id }
    });
    
    if (!existingSupplement) {
      return res.status(404).json({ error: 'El suplemento no existe' });
    }
    
    // Obtener datos del formulario
    const supplementDataString = req.body.data;
    
    if (!supplementDataString) {
      return res.status(400).json({ error: 'No se proporcionaron datos del suplemento' });
    }
    
    let supplementData;
    try {
      supplementData = JSON.parse(supplementDataString);
    } catch (error) {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }
    
    const { name, description, effectiveDate, validity, newAgreements } = supplementData;
    
    if (!name || !effectiveDate) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Manejar archivo si existe
    let documentUrl = existingSupplement.documentUrl;
    if (req.file) {
      // Aquí se procesaría la subida del archivo a S3 o similar
      // También se eliminaría el archivo anterior si existe
      // Por ahora, simulamos una URL
      documentUrl = `/uploads/supplements/${req.file.filename}`;
    }
    
    // Actualizar el suplemento
    const supplement = await prisma.supplement.update({
      where: { id },
      data: {
        name,
        description,
        effectiveDate: new Date(effectiveDate),
        documentUrl,
        validity,
        newAgreements
      }
    });
    
    return res.status(200).json(supplement);
  } catch (error) {
    console.error('Error al actualizar suplemento:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}; 