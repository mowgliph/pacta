import express from "express"
import { authenticateJWT, checkPermission } from "../middleware/auth.middleware"
import { ContractService } from "../services/contract.service"
import { SupplementService } from "../services/supplement.service"
import { DocumentService } from "../services/document.service"
import multer from "multer"
import { z } from "zod"
import { validateRequest } from "../middleware/validation.middleware"
import { sensitiveRateLimiter, queryRateLimiter } from "../middleware/rate-limit.middleware"

const router = express.Router()

// Configuración de multer para subida de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

// Esquemas de validación
const createContractSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  parties: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        contact: z.string().optional(),
      }),
    )
    .min(1, "Debe incluir al menos una parte"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  value: z
    .object({
      amount: z.number().positive(),
      currency: z.string().length(3),
    })
    .optional(),
  status: z.enum(["draft", "active", "expired", "terminated", "archived"]).default("draft"),
  ownerId: z.string().uuid().optional(),
  tags: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

const createSupplementSchema = z.object({
  contractId: z.string().uuid(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  changeType: z.enum(["modification", "extension", "termination", "other"]),
  changes: z.record(z.any()),
  effectiveDate: z.string().transform((str) => new Date(str)),
  status: z.enum(["draft", "pending_approval", "approved", "rejected"]).default("draft"),
  metadata: z.record(z.any()).optional(),
})

// Rutas de contratos
router.post(
  "/",
  authenticateJWT,
  checkPermission("contracts", "create"),
  sensitiveRateLimiter,
  validateRequest(createContractSchema),
  async (req, res, next) => {
    try {
      const contract = await ContractService.createContract(req.body, req.user!.id)
      res.status(201).json({ contract })
    } catch (error) {
      next(error)
    }
  },
)

router.get("/", authenticateJWT, checkPermission("contracts", "read"), queryRateLimiter, async (req, res, next) => {
  try {
    const contracts = await ContractService.getContracts(req.query)
    res.json({ contracts })
  } catch (error) {
    next(error)
  }
})

router.get("/search", authenticateJWT, checkPermission("contracts", "read"), queryRateLimiter, async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q || typeof q !== "string") {
      return res.status(400).json({ message: "Query parameter 'q' is required" })
    }

    const results = await ContractService.searchContracts(q)
    res.json({ results })
  } catch (error) {
    next(error)
  }
})

router.get("/:id", authenticateJWT, checkPermission("contracts", "read"), queryRateLimiter, async (req, res, next) => {
  try {
    const contract = await ContractService.getContractById(req.params.id)

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" })
    }

    res.json({ contract })
  } catch (error) {
    next(error)
  }
})

// Rutas de suplementos
router.post(
  "/:contractId/supplements",
  authenticateJWT,
  checkPermission("contracts", "update"),
  sensitiveRateLimiter,
  validateRequest(createSupplementSchema),
  async (req, res, next) => {
    try {
      const supplement = await SupplementService.createSupplement(
        { ...req.body, contractId: req.params.contractId },
        req.user!.id,
      )
      res.status(201).json({ supplement })
    } catch (error) {
      next(error)
    }
  },
)

router.get(
  "/:contractId/supplements",
  authenticateJWT,
  checkPermission("contracts", "read"),
  queryRateLimiter,
  async (req, res, next) => {
    try {
      const supplements = await SupplementService.getContractSupplements(req.params.contractId)
      res.json({ supplements })
    } catch (error) {
      next(error)
    }
  },
)

router.post(
  "/supplements/:id/approve",
  authenticateJWT,
  checkPermission("contracts", "approve"),
  sensitiveRateLimiter,
  async (req, res, next) => {
    try {
      const supplement = await SupplementService.approveSupplement(req.params.id, req.user!.id)
      res.json({ supplement })
    } catch (error) {
      next(error)
    }
  },
)

router.post(
  "/supplements/:id/reject",
  authenticateJWT,
  checkPermission("contracts", "approve"),
  sensitiveRateLimiter,
  async (req, res, next) => {
    try {
      const { reason } = req.body
      if (!reason) {
        return res.status(400).json({ message: "Reason is required" })
      }

      const supplement = await SupplementService.rejectSupplement(req.params.id, req.user!.id, reason)
      res.json({ supplement })
    } catch (error) {
      next(error)
    }
  },
)

// Rutas de documentos
router.post(
  "/:contractId/documents",
  authenticateJWT,
  checkPermission("contracts", "update"),
  sensitiveRateLimiter,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
      }

      const metadata = {
        contractId: req.params.contractId,
        description: req.body.description,
        tags: req.body.tags,
        isPublic: req.body.isPublic === "true",
      }

      const document = await DocumentService.saveDocument(req.file, metadata, req.user!.id)
      res.status(201).json({ document })
    } catch (error) {
      next(error)
    }
  },
)

router.post(
  "/supplements/:supplementId/documents",
  authenticateJWT,
  checkPermission("contracts", "update"),
  sensitiveRateLimiter,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
      }

      const metadata = {
        supplementId: req.params.supplementId,
        description: req.body.description,
        tags: req.body.tags,
        isPublic: req.body.isPublic === "true",
      }

      const document = await DocumentService.saveDocument(req.file, metadata, req.user!.id)
      res.status(201).json({ document })
    } catch (error) {
      next(error)
    }
  },
)

router.get("/:contractId/documents", authenticateJWT, checkPermission("contracts", "read"), queryRateLimiter, async (req, res, next) => {
  try {
    const documents = await DocumentService.getContractDocuments(req.params.contractId)
    res.json({ documents })
  } catch (error) {
    next(error)
  }
})

router.delete("/documents/:id", authenticateJWT, checkPermission("contracts", "delete"), sensitiveRateLimiter, async (req, res, next) => {
  try {
    await DocumentService.deleteDocument(req.params.id, req.user!.id)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

export default router
