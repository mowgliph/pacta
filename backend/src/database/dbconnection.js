/**
 * Configuración y conexión a la base de datos
 */
import { Sequelize } from 'sequelize';
import config from '../config/app.config.js';

// Configuración de la base de datos
const { host, port, name, user, password, dialect, logging, pool } = config.database;

// Crear instancia de Sequelize
export const sequelize = new Sequelize(name, user, password, {
  host,
  port,
  dialect,
  logging: logging ? console.log : false,
  pool,
  define: {
    timestamps: true,
    underscored: false, // Usar camelCase para nombres de columnas
    freezeTableName: false, // Pluralizar nombres de tablas
  },
});

// Exportar conexión para uso en models
export const db = {
  sequelize,
  Sequelize,
};

/**
 * Prueba la conexión a la base de datos
 * @returns {Promise<Boolean>} - true si la conexión es exitosa
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

/**
 * Sincroniza los modelos con la base de datos
 * @param {Boolean} force - Si debe forzar la recreación de tablas
 * @returns {Promise<Boolean>} - true si la sincronización es exitosa
 */
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized' + (force ? ' (forced)' : ''));
    return true;
  } catch (error) {
    console.error('Unable to sync database:', error);
    return false;
  }
};
