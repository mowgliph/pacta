import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { logger } from "../index"

const prisma = new PrismaClient()

// Interface for decoded JWT token
interface DecodedToken {
  userId: number
  role: string
  iat: number
  exp: number
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        role: string
      }
    }
  }
}

// Middleware to authenticate JWT token
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as DecodedToken

    // Set user info in request object
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    }

    // Log access
    await prisma.accessLog.create({
      data: {
        userId: decoded.userId,
        action: "API_ACCESS",
        details: `${req.method} ${req.originalUrl}`,
        ip: req.ip,
        userAgent: req.get("User-Agent") || "Unknown",
      },
    })

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" })
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" })
    }

    logger.error("Authentication error:", error)
    return res.status(500).json({ message: "Authentication error" })
  }
}

// Middleware to check user permissions
export const checkPermission = (resource: string, action: "create" | "read" | "update" | "delete") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" })
      }

      // Admin role has all permissions
      if (req.user.role === "Admin") {
        return next()
      }

      // Check user's specific permissions
      const permission = await prisma.permission.findFirst({
        where: {
          userId: req.user.id,
          resource,
          [`can${action.charAt(0).toUpperCase() + action.slice(1)}`]: true,
        },
      })

      if (!permission) {
        return res.status(403).json({
          message: `You don't have permission to ${action} ${resource}`,
        })
      }

      next()
    } catch (error) {
      logger.error("Permission check error:", error)
      return res.status(500).json({ message: "Permission check error" })
    }
  }
}

// Middleware to check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" })
  }

  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required" })
  }

  next()
}
