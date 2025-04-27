import express from "express"
import { PrismaClient } from "@prisma/client"
import { authenticateJWT } from "../middleware/auth.middleware"

const router = express.Router()
const prisma = new PrismaClient()

// Get all notifications for the current user
router.get("/", authenticateJWT, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    })

    return res.json({ notifications })
  } catch (error) {
    next(error)
  }
})

// Get unread notifications count
router.get("/unread-count", authenticateJWT, async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
    })

    return res.json({ count })
  } catch (error) {
    next(error)
  }
})

// Mark notification as read
router.put("/:id/read", authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params

    const notification = await prisma.notification.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    // Check if notification belongs to the current user
    if (notification.userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id: Number.parseInt(id) },
      data: { isRead: true },
    })

    return res.json({ notification: updatedNotification })
  } catch (error) {
    next(error)
  }
})

// Mark all notifications as read
router.put("/read-all", authenticateJWT, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
      data: { isRead: true },
    })

    return res.json({ message: "All notifications marked as read" })
  } catch (error) {
    next(error)
  }
})

// Delete notification
router.delete("/:id", authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params

    const notification = await prisma.notification.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    // Check if notification belongs to the current user
    if (notification.userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: Number.parseInt(id) },
    })

    return res.json({ message: "Notification deleted successfully" })
  } catch (error) {
    next(error)
  }
})

export default router
