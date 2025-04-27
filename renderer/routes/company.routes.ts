import express from "express"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { authenticateJWT, checkPermission } from "../middleware/auth.middleware"

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const companySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string(),
})

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string(),
})

// Get all companies
router.get("/", authenticateJWT, checkPermission("companies", "read"), async (req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        departments: true,
      },
    })

    return res.json({ companies })
  } catch (error) {
    next(error)
  }
})

// Get company by ID
router.get("/:id", authenticateJWT, checkPermission("companies", "read"), async (req, res, next) => {
  try {
    const { id } = req.params

    const company = await prisma.company.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        departments: true,
        contracts: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    })

    if (!company) {
      return res.status(404).json({ message: "Company not found" })
    }

    return res.json({ company })
  } catch (error) {
    next(error)
  }
})

// Create company
router.post("/", authenticateJWT, checkPermission("companies", "create"), async (req, res, next) => {
  try {
    const companyData = companySchema.parse(req.body)

    const company = await prisma.company.create({
      data: companyData,
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "CREATE_COMPANY",
        details: `Created company: ${company.name}`,
      },
    })

    return res.status(201).json({ company })
  } catch (error) {
    next(error)
  }
})

// Update company
router.put("/:id", authenticateJWT, checkPermission("companies", "update"), async (req, res, next) => {
  try {
    const { id } = req.params
    const companyData = companySchema.parse(req.body)

    const existingCompany = await prisma.company.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" })
    }

    const company = await prisma.company.update({
      where: { id: Number.parseInt(id) },
      data: companyData,
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "UPDATE_COMPANY",
        details: `Updated company: ${company.name}`,
      },
    })

    return res.json({ company })
  } catch (error) {
    next(error)
  }
})

// Delete company
router.delete("/:id", authenticateJWT, checkPermission("companies", "delete"), async (req, res, next) => {
  try {
    const { id } = req.params

    const existingCompany = await prisma.company.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        contracts: true,
        departments: true,
      },
    })

    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" })
    }

    // Check if company has contracts
    if (existingCompany.contracts.length > 0) {
      return res.status(400).json({
        message: "Cannot delete company with associated contracts. Please remove contracts first.",
      })
    }

    // Delete departments first
    await prisma.department.deleteMany({
      where: { companyId: Number.parseInt(id) },
    })

    // Delete company
    await prisma.company.delete({
      where: { id: Number.parseInt(id) },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "DELETE_COMPANY",
        details: `Deleted company: ${existingCompany.name}`,
      },
    })

    return res.json({ message: "Company deleted successfully" })
  } catch (error) {
    next(error)
  }
})

// Create department
router.post("/:id/departments", authenticateJWT, checkPermission("companies", "update"), async (req, res, next) => {
  try {
    const { id } = req.params
    const departmentData = departmentSchema.parse(req.body)

    const existingCompany = await prisma.company.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" })
    }

    const department = await prisma.department.create({
      data: {
        ...departmentData,
        companyId: Number.parseInt(id),
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "CREATE_DEPARTMENT",
        details: `Created department: ${department.name} for company: ${existingCompany.name}`,
      },
    })

    return res.status(201).json({ department })
  } catch (error) {
    next(error)
  }
})

// Update department
router.put("/departments/:id", authenticateJWT, checkPermission("companies", "update"), async (req, res, next) => {
  try {
    const { id } = req.params
    const departmentData = departmentSchema.parse(req.body)

    const existingDepartment = await prisma.department.findUnique({
      where: { id: Number.parseInt(id) },
      include: { company: true },
    })

    if (!existingDepartment) {
      return res.status(404).json({ message: "Department not found" })
    }

    const department = await prisma.department.update({
      where: { id: Number.parseInt(id) },
      data: departmentData,
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "UPDATE_DEPARTMENT",
        details: `Updated department: ${department.name} for company: ${existingDepartment.company.name}`,
      },
    })

    return res.json({ department })
  } catch (error) {
    next(error)
  }
})

// Delete department
router.delete("/departments/:id", authenticateJWT, checkPermission("companies", "update"), async (req, res, next) => {
  try {
    const { id } = req.params

    const existingDepartment = await prisma.department.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        company: true,
        contracts: true,
      },
    })

    if (!existingDepartment) {
      return res.status(404).json({ message: "Department not found" })
    }

    // Check if department has contracts
    if (existingDepartment.contracts.length > 0) {
      return res.status(400).json({
        message: "Cannot delete department with associated contracts. Please remove contracts first.",
      })
    }

    // Delete department
    await prisma.department.delete({
      where: { id: Number.parseInt(id) },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "DELETE_DEPARTMENT",
        details: `Deleted department: ${existingDepartment.name} from company: ${existingDepartment.company.name}`,
      },
    })

    return res.json({ message: "Department deleted successfully" })
  } catch (error) {
    next(error)
  }
})

export default router
