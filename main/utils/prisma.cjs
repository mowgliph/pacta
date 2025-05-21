const { PrismaClient } = require("@prisma/client");

class PrismaManager {
  constructor() {
    if (!PrismaManager.instance) {
      this._prisma = new PrismaClient({
        log: [
          { emit: "event", level: "query" },
          { emit: "event", level: "error" },
          { emit: "event", level: "info" },
          { emit: "event", level: "warn" },
        ],
      });

      // Configurar eventos de logging
      this._prisma.$on("query", (e) => {
        console.debug(`Prisma Query: ${e.query} (${e.duration}ms)`);
      });

      this._prisma.$on("error", (e) => {
        console.error(`Prisma Error: ${e.message}`);
      });

      this._prisma.$on("info", (e) => {
        console.info(`Prisma Info: ${e.message}`);
      });

      this._prisma.$on("warn", (e) => {
        console.warn(`Prisma Warning: ${e.message}`);
      });

      PrismaManager.instance = this;
    }

    return PrismaManager.instance;
  }

  async connect() {
    try {
      await this._prisma.$connect();
      console.info("Connected to database successfully");
      return true;
    } catch (error) {
      console.error("Failed to connect to database:", error);
      return false;
    }
  }

  async disconnect() {
    try {
      await this._prisma.$disconnect();
      console.info("Disconnected from database");
      return true;
    } catch (error) {
      console.error("Error disconnecting from database:", error);
      return false;
    }
  }

  get prisma() {
    return this._prisma;
  }
}

// Crear y exportar una única instancia
const prismaManager = new PrismaManager();
module.exports = {
  prisma: prismaManager.prisma,
  initPrisma: () => prismaManager.connect(),
  disconnectPrisma: () => prismaManager.disconnect(),
};
