const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { contractSchema } = require('../utils/validation');
const upload = require('../middleware/upload.middleware');
const { deleteFile } = require('../utils/uploads');

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
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contracts', error });
  }
});

// Create new contract
router.post('/', authenticateJWT, upload.single('file'), async (req, res) => {
  const { error, value } = contractSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, description, startDate, endDate, status, userId, companyId, departmentId } = value;
  let fileUrl = null;

  if (req.file) {
    fileUrl = req.file.path;
  }

  try {
    const contract = await prisma.contract.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        fileUrl,
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

    res.status(201).json({ message: 'Contract created', contract });
  } catch (error) {
    if (fileUrl) {
      await deleteFile(fileUrl);
    }
    res.status(500).json({ message: 'Error creating contract', error });
  }
});

module.exports = router;