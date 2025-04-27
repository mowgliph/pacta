import type { Request, Response, NextFunction } from "express"
import { logger } from "../index"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors,
    })
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === "P2002") {
      const field = err.meta?.target as string[]
      return res.status(409).json({
        message: `A record with this ${field.join(", ")} already exists`,
      })
    }

    // Record not found
    if (err.code === "P2001" || err.code === "P2018") {
      return res.status(404).json({
        message: "Record not found",
      })
    }

    // Foreign key constraint failed
    if (err.code === "P2003") {
      return res.status(400).json({
        message: "Related record not found",
      })
    }
  }

  // Default error response
  return res.status(500).json({
    message: "Internal server error",
  })
}
