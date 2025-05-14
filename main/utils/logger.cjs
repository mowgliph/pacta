const { config } = require("./config.cjs");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// Asegurar que el directorio de logs exista
const logDir = config.logs.path;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Obtener fecha actual formateada
function getFormattedDate() {
  const date = new Date();
  return date.toISOString().split("T")[0];
}

// Crear streams para los logs
const errorLogPath = path.join(logDir, `error-${getFormattedDate()}.log`);
const combinedLogPath = path.join(logDir, `combined-${getFormattedDate()}.log`);

// Crear los streams de archivo
const errorLogStream = fs.createWriteStream(errorLogPath, { flags: "a" });
const combinedLogStream = fs.createWriteStream(combinedLogPath, { flags: "a" });

// Niveles de log
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  log: 3,
  debug: 4,
};

// Nivel configurado
const configuredLevel = LOG_LEVELS[config.logs.level] || LOG_LEVELS.info;

// Formatear mensaje de log
function formatLogMessage(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const formattedArgs = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
    .join(" ");

  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedArgs}`;
}

// Escribir en consola y archivo
function writeLog(level, message, ...args) {
  const logLevel = LOG_LEVELS[level] || LOG_LEVELS.info;

  // Si el nivel es mayor que el configurado, no registrar
  if (logLevel > configuredLevel) return;

  const formattedMessage = formatLogMessage(level, message, ...args);

  // Escribir en consola - corregimos el error de TypeScript aquí
  switch (level) {
    case "error":
      console.error(formattedMessage);
      break;
    case "warn":
      console.warn(formattedMessage);
      break;
    case "info":
      console.info(formattedMessage);
      break;
    case "debug":
      console.debug(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }

  // Escribir en archivo
  combinedLogStream.write(formattedMessage + "\n");

  // Errores también se escriben en el log de errores
  if (level === "error" || level === "warn") {
    errorLogStream.write(formattedMessage + "\n");
  }
}

// Exportar logger
exports.logger = {
  error: (message, ...args) => writeLog("error", message, ...args),
  warn: (message, ...args) => writeLog("warn", message, ...args),
  info: (message, ...args) => writeLog("info", message, ...args),
  log: (message, ...args) => writeLog("log", message, ...args),
  debug: (message, ...args) => writeLog("debug", message, ...args),

  // Método para cerrar los streams
  close: () => {
    errorLogStream.end();
    combinedLogStream.end();
  },
};

// Cerrar los streams cuando la aplicación se cierra
app.on("will-quit", () => {
  exports.logger.info("Cerrando logger...");
  exports.logger.close();
});
