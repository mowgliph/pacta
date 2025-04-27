import express from "express"
import { PrismaClient } from "@prisma/client"
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware"
import { createBackup } from "../services/backup.service"
import fs from "fs"

const router = express.Router()
const prisma = new PrismaClient()

// Get all backups
router.get("/", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
    })

    return res.json({ backups })
  } catch (error) {
    next(error)
  }
})

// Create a new backup
router.post("/", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const backup = await createBackup(prisma)

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "CREATE_BACKUP",
        details: `Created backup: ${backup.filename}`,
      },
    })

    return res.status(201).json({ backup })
  } catch (error) {
    next(error)
  }
})

// Download a backup
router.get("/:id/download", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params

    const backup = await prisma.backup.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!backup) {
      return res.status(404).json({ message: "Backup not found" })
    }

    // Check if file exists
    if (!fs.existsSync(backup.filepath)) {
      return res.status(404).json({ message: "Backup file not found" })
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "DOWNLOAD_BACKUP",
        details: `Downloaded backup: ${backup.filename}`,
      },
    })

    // Send file
    res.download(backup.filepath, backup.filename)
  } catch (error) {
    next(error)
  }
})

// Delete a backup
router.delete("/:id", authenticateJWT, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params

    const backup = await prisma.backup.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!backup) {
      return res.status(404).json({ message: "Backup not found" })
    }

    // Delete file if it exists
    if (fs.existsSync(backup.filepath)) {
      fs.unlinkSync(backup.filepath)
    }

    // Delete backup record
    await prisma.backup.delete({
      where: { id: Number.parseInt(id) },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        action: "DELETE_BACKUP",
        details: `Deleted backup: ${backup.filename}`,
      },
    })

    return res.json({ message: "Backup deleted successfully" })
  } catch (error) {
    next(error)
  }
})

export default router
