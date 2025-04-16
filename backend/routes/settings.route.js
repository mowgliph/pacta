const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT, authorizeRole } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();
const PUBLIC_DASHBOARD_KEY = 'publicDashboardEnabled';

// GET /api/settings/public-dashboard - Obtener estado actual
router.get('/public-dashboard', authenticateJWT, async (req, res) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: PUBLIC_DASHBOARD_KEY },
    });
    // Devuelve true si el valor es 'true', de lo contrario false
    res.json({ enabled: setting?.value === 'true' || false });
  } catch (error) {
    console.error("Error fetching public dashboard setting:", error);
    res.status(500).json({ message: 'Error al obtener el ajuste del dashboard público.' });
  }
});

// POST /api/settings/public-dashboard - Establecer estado
router.post('/public-dashboard', authenticateJWT, authorizeRole(['Admin', 'RA']), async (req, res) => {
  const { enabled } = req.body; // Espera { enabled: true } o { enabled: false }

  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ message: 'El valor \'enabled\' debe ser booleano.' });
  }

  try {
    const updatedSetting = await prisma.setting.upsert({
      where: { key: PUBLIC_DASHBOARD_KEY },
      update: { value: String(enabled) }, // Guardar como string 'true' o 'false'
      create: { key: PUBLIC_DASHBOARD_KEY, value: String(enabled), category: 'general' },
    });

    // Registrar la acción (opcional)
    // await prisma.accessLog.create({...});

    res.json({ enabled: updatedSetting.value === 'true' });
  } catch (error) {
    console.error("Error updating public dashboard setting:", error);
    res.status(500).json({ message: 'Error al actualizar el ajuste del dashboard público.' });
  }
});

module.exports = router;
