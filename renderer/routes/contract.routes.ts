import express from "express"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { authenticateJWT, checkPermission } from "../middleware/auth.middleware"

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const contractSchema = z.object({
  name: z.string().min(3),
  type: z.string().optional(),
  description: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  status: z.enum(["Draft", "Active", "Expired", "Terminated"]).default("Active"),
  documentPath: z.string().optional(),
  companyId: z.number().optional(),
  departmentId: z.number().optional(),
  contractParts: z
    .array(
      z.object({
        partyName: z.string(),
        partyRole: z.string(),
        partyContact: z.string(),
      }),
    )
    .optional(),
})

// Get all contracts
router.get("/", authenticateJWT, checkPermission("contracts", "read"), async (req, res, next) => {
  try {
    const contracts = await prisma.contract.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        company: true,
        department: true,
        contractParts: true,
      },
    })

    return res.json({ contracts })
  } catch (error) {
    next(error)
  }
})

// Get contract by ID
router.get("/:id", authenticateJWT, checkPermission("contracts", "read"), async (req, res, next) => {
  try {
    const { id } = req.params

    const contract = await prisma.contract.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        company: true,
        department: true,
        contractParts: true,
        obligations: true,
        deliveries: true,
        payments: true,
        guarantees: true,
        supplements: true,
      },
    })

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" })
    }

    // Check if user has access to this contract
    if (contract.userId !== req.user!.id && req.user!.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        contractId: contract.id,
        action: "VIEW",
        details: `Viewed contract: ${contract.name}`,
      },
    })

    return res.json({ contract })
  } catch (error) {
    next(error)
  }
})

// Create contract
router.post("/", authenticateJWT, checkPermission("contracts", "create"), async (req, res, next) => {
  try {
    const contractData = contractSchema.parse(req.body)

    // Extract contract parts if provided
    const { contractParts, ...data } = contractData

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        ...data,
        userId: req.user!.id,
        // Create contract parts if provided
        contractParts: contractParts
          ? {
              create: contractParts,
            }
          : undefined,
      },
      include: {
        contractParts: true,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        contractId: contract.id,
        action: "CREATE",
        details: `Created contract: ${contract.name}`,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: "Contract Created",
        message: `Contract "${contract.name}" has been created successfully.`,
        type: "contract",
        subtype: "creation",
        data: { contractId: contract.id },
      },
    })

    return res.status(201).json({ contract })
  } catch (error) {
    next(error)
  }
})

// Update contract
router.put("/:id", authenticateJWT, checkPermission("contracts", "update"), async (req, res, next) => {
  try {
    const { id } = req.params
    const contractData = contractSchema.parse(req.body)

    // Check if contract exists and user has access
    const existingContract = await prisma.contract.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" })
    }

    if (existingContract.userId !== req.user!.id && req.user!.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Extract contract parts if provided
    const { contractParts, ...data } = contractData

    // Update contract
    const contract = await prisma.contract.update({
      where: { id: Number.parseInt(id) },
      data: {
        ...data,
        // Update contract parts if provided
        contractParts: contractParts
          ? {
              deleteMany: {},
              create: contractParts,
            }
          : undefined,
      },
      include: {
        contractParts: true,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        contractId: contract.id,
        action: "UPDATE",
        details: `Updated contract: ${contract.name}`,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: "Contract Updated",
        message: `Contract "${contract.name}" has been updated.`,
        type: "contract",
        subtype: "modification",
        data: { contractId: contract.id },
      },
    })

    return res.json({ contract })
  } catch (error) {
    next(error)
  }
})

// Delete contract
router.delete("/:id", authenticateJWT, checkPermission("contracts", "delete"), async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if contract exists and user has access
    const existingContract = await prisma.contract.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" })
    }

    if (existingContract.userId !== req.user!.id && req.user!.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Delete contract and related data
    await prisma.$transaction([
      prisma.contractPart.deleteMany({ where: { contractId: Number.parseInt(id) } }),
      prisma.obligation.deleteMany({ where: { contractId: Number.parseInt(id) } }),
      prisma.delivery.deleteMany({ where: { contractId: Number.parseInt(id) } }),
      prisma.payment.deleteMany({ where: { contractId: Number.parseInt(id) } }),
      prisma.guarantee.deleteMany({ where: { contractId: Number.parseInt(id) } }),
      prisma.supplement.deleteMany({ where: { contractId: Number.parseInt(id) } }),
      prisma.activity.deleteMany({ where: { contractId: Number.parseInt(id) } }),
      prisma.contract.delete({ where: { id: Number.parseInt(id) } }),
    ])

    // Log activity (not related to contract anymore)
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "DELETE",
        details: `Deleted contract: ${existingContract.name}`,
      },
    })

    return res.json({ message: "Contract deleted successfully" })
  } catch (error) {
    next(error)
  }
})

// Add obligation to contract
router.post("/:id/obligations", authenticateJWT, checkPermission("contracts", "update"), async (req, res, next) => {
  try {
    const { id } = req.params
    const { description } = z
      .object({
        description: z.string(),
      })
      .parse(req.body)

    // Check if contract exists and user has access
    const existingContract = await prisma.contract.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" })
    }

    if (existingContract.userId !== req.user!.id && req.user!.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Create obligation
    const obligation = await prisma.obligation.create({
      data: {
        contractId: Number.parseInt(id),
        description,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        contractId: Number.parseInt(id),
        action: "ADD_OBLIGATION",
        details: `Added obligation to contract: ${existingContract.name}`,
      },
    })

    return res.status(201).json({ obligation })
  } catch (error) {
    next(error)
  }
})

// Similar endpoints for deliveries, payments, guarantees, and supplements...

export default router
