import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de la base de datos
const dbConfig = {
  dialect: 'sqlite',
  storage: path.join(__dirname, 'pacta.sqlite'),
  logging: process.env.NODE_ENV === 'development',
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 3,
    match: [/SQLITE_BUSY/]
  }
};

// Crear instancia de Sequelize
const sequelize = new Sequelize(dbConfig);

// Función para probar la conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return false;
  }
};

// Función para sincronizar los modelos
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Base de datos sincronizada correctamente.');
    return true;
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
    return false;
  }
};

// Exportar la instancia de Sequelize
export const db = sequelize;
export default sequelize; 