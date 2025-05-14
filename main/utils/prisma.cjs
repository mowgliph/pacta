const { PrismaClient } = require("@prisma/client");

// Crear una única instancia de PrismaClient para toda la aplicación
exports.prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

// Registrar eventos de Prisma para diagnóstico
exports.prisma.$on("query", (e) => {
  console.debug(`Prisma Query: ${e.query} (${e.duration}ms)`);
});

exports.prisma.$on("error", (e) => {
  console.error(`Prisma Error: ${e.message}`);
});

exports.prisma.$on("info", (e) => {
  console.info(`Prisma Info: ${e.message}`);
});

exports.prisma.$on("warn", (e) => {
  console.warn(`Prisma Warning: ${e.message}`);
});

// Inicializar conexión (puedes llamar a esta función desde main/index.ts)
exports.initPrisma = async function () {
  try {
    await exports.prisma.$connect();
    console.info("Connected to database successfully");
    return true;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return false;
  }
};
