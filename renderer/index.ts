import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { PrismaClient } from "@prisma/client"
import winston from "winston"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import contractRoutes from "./routes/contract.routes"
import userRoutes from "./routes/user.routes"
import companyRoutes from "./routes/company.routes"
import notificationRoutes from "./routes/notification.routes"
import settingRoutes from "./routes/setting.routes"
import backupRoutes from "./routes/backup.routes"
import { errorHandler } from "./middleware/error.middleware"
import { BackupService } from "./services/backup.service"
import { NotificationService } from "./services/notification.service"
import { EmailService } from "./services/email.service"

// Load environment variables
dotenv.config()

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: "pacta-api" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
})

// Initialize Prisma
const prisma = new PrismaClient()

// Initialize Express
const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Parse JSON bodies
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  })
  next()
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/contracts", contractRoutes)
app.use("/api/users", userRoutes)
app.use("/api/companies", companyRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/settings", settingRoutes)
app.use("/api/backups", backupRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)

  // Initialize services
  new BackupService(prisma, logger)
  new NotificationService(prisma, logger)
  new EmailService(prisma, logger)
  
  logger.info("Services initialized")
})

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error)
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection at:", promise, "reason:", reason)
})

export { prisma, logger }
