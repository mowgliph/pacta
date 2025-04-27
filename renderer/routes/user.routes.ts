import express from "express"
import { z } from "zod"
import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client"
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware"

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const userSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.string(),
  notifyEnabled: z.boolean().default(true),
})

// Get all users (admin only)
router.get("/", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        notifyEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return res.json({ users })
  } catch (error) {
    next(error)
  }
})

// Get current user profile
router.get("/profile", authenticateJWT, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        notifyEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.json({ user })
  } catch (error) {
    next(error)
  }
})

// Update current user profile
router.put("/profile", authenticateJWT, async (req, res, next) => {
  try {
    const profileSchema = z.object({
      username: z.string().min(3).optional(),
      email: z.string().email().optional(),
      notifyEnabled: z.boolean().optional(),
    })

    const profileData = profileSchema.parse(req.body)

    // Check if email is already taken
    if (profileData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: profileData.email,
          id: { not: req.user!.id },
        },
      })

      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" })
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: profileData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        notifyEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return res.json({ user })
  } catch (error) {
    next(error)
  }
})

// Get user by ID (admin only)
router.get("/:id", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id: Number.parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        notifyEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.json({ user })
  } catch (error) {
    next(error)
  }
})

// Create user (admin only)
router.post("/", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const userData = userSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
      },
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password || "password123", 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        notifyEnabled: userData.notifyEnabled,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        notifyEnabled: true,
        createdAt: true,
      },
    })

    // Create default notification preferences
    await prisma.notificationPreference.create({
      data: {
        userId: user.id,
        type: "contract_expiration",
        email: true,
        inApp: true,
        system: true,
      },
    })

    // Create default public view settings
    await prisma.publicViewSettings.create({
      data: {
        userId: user.id,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "CREATE_USER",
        details: `Created user: ${user.username} (${user.email})`,
      },
    })

    return res.status(201).json({ user })
  } catch (error) {
    next(error)
  }
})

// Update user (admin only)
router.put("/:id", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params
    const userData = userSchema.parse(req.body)

    const existingUser = await prisma.user.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if email or username is already taken
    const duplicateUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
        id: { not: Number.parseInt(id) },
      },
    })

    if (duplicateUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      })
    }

    // Prepare update data
    const updateData: any = {
      username: userData.username,
      email: userData.email,
      role: userData.role,
      notifyEnabled: userData.notifyEnabled,
    }

    // Hash password if provided
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10)
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: Number.parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        notifyEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "UPDATE_USER",
        details: `Updated user: ${user.username} (${user.email})`,
      },
    })

    return res.json({ user })
  } catch (error) {
    next(error)
  }
})

// Delete user (admin only)
router.delete("/:id", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params

    const existingUser = await prisma.user.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if user has contracts
    const userContracts = await prisma.contract.count({
      where: { userId: Number.parseInt(id) },
    })

    if (userContracts > 0) {
      return res.status(400).json({
        message: "Cannot delete user with associated contracts. Please reassign or delete contracts first.",
      })
    }

    // Delete user's data
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId: Number.parseInt(id) } }),
      prisma.notificationPreference.deleteMany({ where: { userId: Number.parseInt(id) } }),
      prisma.publicViewSettings.deleteMany({ where: { userId: Number.parseInt(id) } }),
      prisma.permission.deleteMany({ where: { userId: Number.parseInt(id) } }),
      prisma.activity.deleteMany({ where: { userId: Number.parseInt(id) } }),
      prisma.accessLog.deleteMany({ where: { userId: Number.parseInt(id) } }),
      prisma.user.delete({ where: { id: Number.parseInt(id) } }),
    ])

    // Log activity (not related to deleted user)
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "DELETE_USER",
        details: `Deleted user: ${existingUser.username} (${existingUser.email})`,
      },
    })

    return res.json({ message: "User deleted successfully" })
  } catch (error) {
    next(error)
  }
})

export default router
