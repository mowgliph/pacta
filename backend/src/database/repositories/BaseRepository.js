/**
 * Repositorio Base Abstracto
 * Define la interfaz común para todos los repositorios
 */
export class BaseRepository {
  /**
   * Constructor del repositorio base
   */
  constructor() {
    if (this.constructor === BaseRepository) {
      throw new Error('BaseRepository es una clase abstracta y no puede ser instanciada directamente');
    }
  }

  /**
   * Encuentra todos los registros que coinciden con los criterios
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} options - Opciones adicionales (paginación, ordenamiento, etc.)
   * @returns {Promise<Array>} - Registros encontrados
   */
  async findAll(criteria = {}, options = {}) {
    throw new Error('El método findAll() debe ser implementado por las clases hijas');
  }

  /**
   * Encuentra un registro por su ID
   * @param {string|number} id - ID del registro
   * @param {Object} options - Opciones adicionales (includes, select, etc.)
   * @returns {Promise<Object>} - Registro encontrado o null
   */
  async findById(id, options = {}) {
    throw new Error('El método findById() debe ser implementado por las clases hijas');
  }

  /**
   * Encuentra un único registro que coincide con los criterios
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Registro encontrado o null
   */
  async findOne(criteria = {}, options = {}) {
    throw new Error('El método findOne() debe ser implementado por las clases hijas');
  }

  /**
   * Crea un nuevo registro
   * @param {Object} data - Datos del nuevo registro
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Registro creado
   */
  async create(data, options = {}) {
    throw new Error('El método create() debe ser implementado por las clases hijas');
  }

  /**
   * Actualiza un registro existente
   * @param {string|number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Registro actualizado
   */
  async update(id, data, options = {}) {
    throw new Error('El método update() debe ser implementado por las clases hijas');
  }

  /**
   * Elimina un registro existente
   * @param {string|number} id - ID del registro
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async delete(id, options = {}) {
    throw new Error('El método delete() debe ser implementado por las clases hijas');
  }

  /**
   * Cuenta registros según criterios de búsqueda
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {Promise<number>} - Número de registros
   */
  async count(criteria = {}) {
    throw new Error('El método count() debe ser implementado por las clases hijas');
  }

  /**
   * Inserta múltiples registros en una sola operación
   * @param {Array} data - Array de datos a insertar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} - Registros creados
   */
  async bulkCreate(data, options = {}) {
    throw new Error('El método bulkCreate() debe ser implementado por las clases hijas');
  }

  /**
   * Actualiza múltiples registros en una sola operación
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} data - Datos a actualizar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} - Número de registros actualizados
   */
  async bulkUpdate(criteria, data, options = {}) {
    throw new Error('El método bulkUpdate() debe ser implementado por las clases hijas');
  }

  /**
   * Elimina múltiples registros en una sola operación
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} - Número de registros eliminados
   */
  async bulkDelete(criteria, options = {}) {
    throw new Error('El método bulkDelete() debe ser implementado por las clases hijas');
  }

  /**
   * Realiza una operación de transacción
   * @param {Function} callback - Función a ejecutar dentro de la transacción
   * @returns {Promise<any>} - Resultado de la transacción
   */
  async transaction(callback) {
    throw new Error('El método transaction() debe ser implementado por las clases hijas');
  }
} 