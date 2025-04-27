import express from "express"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware"

const router = express.Router()
const prisma = new PrismaClient()

// Validation schema
const settingSchema = z.object({
  value: z.string(),
})

// Get all settings
router.get("/", authenticateJWT, async (req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { category: "asc" },
    })

    return res.json({ settings })
  } catch (error) {
    next(error)
  }
})

// Get settings by category
router.get("/category/:category", authenticateJWT, async (req, res, next) => {
  try {
    const { category } = req.params

    const settings = await prisma.setting.findMany({
      where: { category },
      orderBy: { key: "asc" },
    })

    return res.json({ settings })
  } catch (error) {
    next(error)
  }
})

// Get setting by key
router.get("/:key", authenticateJWT, async (req, res, next) => {
  try {
    const { key } = req.params

    const setting = await prisma.setting.findUnique({
      where: { key },
    })

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" })
    }

    return res.json({ setting })
  } catch (error) {
    next(error)
  }
})

// Update setting
router.put("/:key", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const { key } = req.params
    const { value } = settingSchema.parse(req.body)

    const existingSetting = await prisma.setting.findUnique({
      where: { key },
    })

    if (!existingSetting) {
      return res.status(404).json({ message: "Setting not found" })
    }

    const setting = await prisma.setting.update({
      where: { key },
      data: { value },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "UPDATE_SETTING",
        details: `Updated setting: ${key} to value: ${value}`,
      },
    })

    return res.json({ setting })
  } catch (error) {
    next(error)
  }
})

// Get SMTP configuration
router.get("/smtp/config", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const smtpConfig = await prisma.sMTPConfig.findFirst()

    if (!smtpConfig) {
      return res.status(404).json({ message: "SMTP configuration not found" })
    }

    // Don't return the password
    const { password, ...config } = smtpConfig

    return res.json({ smtpConfig: config })
  } catch (error) {
    next(error)
  }
})

// Update SMTP configuration
router.put("/smtp/config", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const smtpSchema = z.object({
      host: z.string(),
      port: z.number(),
      secure: z.boolean(),
      username: z.string(),
      password: z.string().optional(),
      from: z.string().email(),
      enabled: z.boolean(),
    })

    const smtpData = smtpSchema.parse(req.body)

    const existingConfig = await prisma.sMTPConfig.findFirst()

    let smtpConfig

    if (existingConfig) {
      // Update existing config
      smtpConfig = await prisma.sMTPConfig.update({
        where: { id: existingConfig.id },
        data: {
          ...smtpData,
          // Only update password if provided
          ...(smtpData.password ? { password: smtpData.password } : {}),
        },
      })
    } else {
      // Create new config
      if (!smtpData.password) {
        return res.status(400).json({ message: "Password is required for new SMTP configuration" })
      }

      smtpConfig = await prisma.sMTPConfig.create({
        data: smtpData,
      })
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "UPDATE_SMTP_CONFIG",
        details: `Updated SMTP configuration`,
      },
    })

    // Don't return the password
    const { password, ...config } = smtpConfig

    return res.json({ smtpConfig: config })
  } catch (error) {
    next(error)
  }
})

// Get user notification preferences
router.get("/notifications/preferences", authenticateJWT, async (req, res, next) => {
  try {
    const preferences = await prisma.notificationPreference.findMany({
      where: { userId: req.user!.id },
    })

    return res.json({ preferences })
  } catch (error) {
    next(error)
  }
})

// Update user notification preferences
router.put("/notifications/preferences/:type", authenticateJWT, async (req, res, next) => {
  try {
    const { type } = req.params
    const preferencesSchema = z.object({
      email: z.boolean(),
      inApp: z.boolean(),
      system: z.boolean(),
    })

    const preferencesData = preferencesSchema.parse(req.body)

    const existingPreference = await prisma.notificationPreference.findFirst({
      where: {
        userId: req.user!.id,
        type,
      },
    })

    let preference

    if (existingPreference) {
      // Update existing preference
      preference = await prisma.notificationPreference.update({
        where: { id: existingPreference.id },
        data: preferencesData,
      })
    } else {
      // Create new preference
      preference = await prisma.notificationPreference.create({
        data: {
          userId: req.user!.id,
          type,
          ...preferencesData,
        },
      })
    }

    return res.json({ preference })
  } catch (error) {
    next(error)
  }
})

export default router
