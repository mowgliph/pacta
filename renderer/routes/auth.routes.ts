import express from "express"
import { z } from "zod"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { authenticateJWT } from "../middleware/auth.middleware"

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
})

// Login route
router.post("/login", async (req, res, next) => {
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "24h",
    })

    // Log successful login
    await prisma.accessLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        details: "User logged in successfully",
        ip: req.ip,
        userAgent: req.get("User-Agent") || "Unknown",
      },
    })

    // Return user info and token
    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    next(error)
  }
})

// Register route
router.post("/register", async (req, res, next) => {
  try {
    // Validate request body
    const { username, email, password } = registerSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email or username already exists",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        // Default role is User
        role: "User",
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

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "24h",
    })

    // Log registration
    await prisma.accessLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        details: "User registered successfully",
        ip: req.ip,
        userAgent: req.get("User-Agent") || "Unknown",
      },
    })

    // Return user info and token
    return res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    next(error)
  }
})

// Get current user route
router.get("/me", authenticateJWT, async (req, res, next) => {
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

// Change password route
router.post("/change-password", authenticateJWT, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = z
      .object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      })
      .parse(req.body)

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    })

    // Log password change
    await prisma.accessLog.create({
      data: {
        userId: req.user!.id,
        action: "PASSWORD_CHANGE",
        details: "User changed password",
        ip: req.ip,
        userAgent: req.get("User-Agent") || "Unknown",
      },
    })

    return res.json({ message: "Password changed successfully" })
  } catch (error) {
    next(error)
  }
})

export default router
