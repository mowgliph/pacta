import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurarnos de que el directorio de la base de datos exista
const dbDir = path.join(__dirname, '../database');
const dbPath = path.join(dbDir, 'pacta.sqlite');

// Crear directorio si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Directorio de base de datos creado:', dbDir);
}

// Verificar que el directorio tenga permisos de escritura
try {
  fs.accessSync(dbDir, fs.constants.W_OK);
  console.log('El directorio de base de datos tiene permisos de escritura');
} catch (err) {
  console.error('ERROR: No se puede escribir en el directorio de la base de datos', dbDir);
  console.error('Por favor, verifica los permisos del directorio');
}

// Mostrar la ruta absoluta para verificar
console.log('Ruta absoluta de la base de datos:', path.resolve(dbPath));

// Configuración de Sequelize con opciones adicionales para desarrollo
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

// Funciones de utilidad para compatibilidad con el código antiguo
// Estas funciones simulan la API db.query pero usan Sequelize internamente
const db = {
  async query(sql, params = []) {
    try {
      // Adaptar consultas SQL simples a Sequelize
      // Nota: Este es un enfoque muy básico que solo manejará consultas sencillas
      const lowerSql = sql.toLowerCase();
      
      // Manejar SELECT
      if (lowerSql.startsWith('select')) {
        const [results] = await sequelize.query(sql, {
          replacements: params,
          type: Sequelize.QueryTypes.SELECT
        });
        return { rows: results || [] };
      }
      
      // Manejar INSERT, UPDATE, DELETE
      else {
        const [results] = await sequelize.query(sql, {
          replacements: params,
          type: Sequelize.QueryTypes.RAW
        });
        return { rows: [results] };
      }
    } catch (error) {
      console.error('Error en consulta SQL:', error);
      throw error;
    }
  }
};

// Función para hacer hash de contraseña
function hashPassword(password) {
  try {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password).digest('hex');
  } catch (error) {
    console.error('Error al hacer hash de la contraseña:', error);
    return password;
  }
}

// Exportar todo lo necesario
export { db, hashPassword };
export default sequelize;