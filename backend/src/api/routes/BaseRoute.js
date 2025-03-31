/**
 * Clase base para definir rutas de la API
 * Proporciona métodos para registrar rutas CRUD estándar
 */
import express from 'express';
import { LoggingService } from '../../services/LoggingService.js';
import CacheService from '../../services/CacheService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { ResponseService } from '../../services/ResponseService.js';
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';

export class BaseRoute {
  /**
   * Constructor de la ruta base
   * @param {Object} controller - Controlador a utilizar para esta ruta
   */
  constructor(controller) {
    if (!controller) {
      throw new Error('Controller is required for BaseRoute');
    }
    this.controller = controller;
    this.router = Router();
    this.path = '/';
  }

  /**
   * Obtiene el router configurado
   * @returns {Router} - Express Router configurado
   */
  getRouter() {
    return this.router;
  }

  /**
   * Crea un middleware para registrar operaciones
   * @param {string} operation - Nombre de la operación
   * @returns {Function} - Middleware para logging
   */
  logOperation(operation) {
    return (req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        LoggingService.info(`${operation} completed`, {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration: `${duration}ms`,
          userId: req.user?.id,
        });
      });
      next();
    };
  }

  /**
   * Crea un middleware para validar la solicitud
   * @param {object} schema - Esquema de validación
   * @returns {Function} - Middleware para validación
   */
  validateRequest(schema) {
    return async (req, res, next) => {
      try {
        const validationService = new ValidationService();
        const validatedData = await validationService.validate(schema, req.body);
        req.body = validatedData;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Crea un middleware para cachear la respuesta
   * @param {number} ttl - Tiempo de vida en segundos
   * @returns {Function} - Middleware para caché
   */
  cacheResponse(ttl = 600) {
    return async (req, res, next) => {
      try {
        const cacheKey = `cache:${req.originalUrl}`;
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json(ResponseService.success(cachedData));
        }

        const originalJson = res.json;
        res.json = function (data) {
          CacheService.set(cacheKey, data, ttl);
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Registra todas las rutas CRUD estándar
   * @param {String} path - Ruta base, por defecto '/'
   * @param {Object} options - Opciones de configuración
   * @returns {BaseRoute} - this, para encadenamiento
   */
  registerRoutes(path = '/', options = {}) {
    this.path = path;

    const {
      getAll = true,
      getById = true,
      create = true,
      update = true,
      remove = true,
      authAll = false,
      authRequired = [],
      adminOnly = [],
      paramIdName = 'id',
    } = options;

    // GET all
    if (getAll) {
      const middlewares = [];
      if (authAll || authRequired.includes('getAll')) {
        middlewares.push(authenticate);
      }
      if (adminOnly.includes('getAll')) {
        middlewares.push(authorize('admin'));
      }
      this.router.get(path, ...middlewares, this.controller.getAll);
    }

    // GET by ID
    if (getById) {
      const middlewares = [];
      if (authAll || authRequired.includes('getById')) {
        middlewares.push(authenticate);
      }
      if (adminOnly.includes('getById')) {
        middlewares.push(authorize('admin'));
      }
      this.router.get(`${path}/:${paramIdName}`, ...middlewares, this.controller.getById);
    }

    // POST (create)
    if (create) {
      const middlewares = [];
      if (authAll || authRequired.includes('create')) {
        middlewares.push(authenticate);
      }
      if (adminOnly.includes('create')) {
        middlewares.push(authorize('admin'));
      }
      this.router.post(path, ...middlewares, this.controller.create);
    }

    // PUT (update)
    if (update) {
      const middlewares = [];
      if (authAll || authRequired.includes('update')) {
        middlewares.push(authenticate);
      }
      if (adminOnly.includes('update')) {
        middlewares.push(authorize('admin'));
      }
      this.router.put(`${path}/:${paramIdName}`, ...middlewares, this.controller.update);
    }

    // DELETE
    if (remove) {
      const middlewares = [];
      if (authAll || authRequired.includes('delete')) {
        middlewares.push(authenticate);
      }
      if (adminOnly.includes('delete')) {
        middlewares.push(authorize('admin'));
      }
      this.router.delete(`${path}/:${paramIdName}`, ...middlewares, this.controller.delete);
    }

    return this;
  }

  /**
   * Registra una ruta GET
   * @param {String} path - Ruta a registrar
   * @param {Function|Array} handlerOrMiddlewares - Manejador de la ruta o middlewares
   * @param {Function} [handler] - Manejador de la ruta si el segundo argumento es middlewares
   * @returns {BaseRoute} - this, para encadenamiento
   */
  get(path, handlerOrMiddlewares, handler) {
    // Si el segundo argumento es un arreglo, asumimos que son middlewares
    if (Array.isArray(handlerOrMiddlewares)) {
      this.router.get(path, ...handlerOrMiddlewares, handler);
    } 
    // Si el segundo argumento es una función y el tercero no existe, asumimos que es el handler
    else if (typeof handlerOrMiddlewares === 'function' && !handler) {
      this.router.get(path, handlerOrMiddlewares);
    }
    // Si tanto el segundo como el tercer argumento existen, el segundo es un middleware y el tercero el handler
    else {
      this.router.get(path, handlerOrMiddlewares, handler);
    }
    return this;
  }

  /**
   * Registra una ruta POST
   * @param {String} path - Ruta a registrar
   * @param {Function|Array} handlerOrMiddlewares - Manejador de la ruta o middlewares
   * @param {Function} [handler] - Manejador de la ruta si el segundo argumento es middlewares
   * @returns {BaseRoute} - this, para encadenamiento
   */
  post(path, handlerOrMiddlewares, handler) {
    // Si el segundo argumento es un arreglo, asumimos que son middlewares
    if (Array.isArray(handlerOrMiddlewares)) {
      this.router.post(path, ...handlerOrMiddlewares, handler);
    } 
    // Si el segundo argumento es una función y el tercero no existe, asumimos que es el handler
    else if (typeof handlerOrMiddlewares === 'function' && !handler) {
      this.router.post(path, handlerOrMiddlewares);
    }
    // Si tanto el segundo como el tercer argumento existen, el segundo es un middleware y el tercero el handler
    else {
      this.router.post(path, handlerOrMiddlewares, handler);
    }
    return this;
  }

  /**
   * Registra una ruta PUT
   * @param {String} path - Ruta a registrar
   * @param {Function|Array} handlerOrMiddlewares - Manejador de la ruta o middlewares
   * @param {Function} [handler] - Manejador de la ruta si el segundo argumento es middlewares
   * @returns {BaseRoute} - this, para encadenamiento
   */
  put(path, handlerOrMiddlewares, handler) {
    // Si el segundo argumento es un arreglo, asumimos que son middlewares
    if (Array.isArray(handlerOrMiddlewares)) {
      this.router.put(path, ...handlerOrMiddlewares, handler);
    } 
    // Si el segundo argumento es una función y el tercero no existe, asumimos que es el handler
    else if (typeof handlerOrMiddlewares === 'function' && !handler) {
      this.router.put(path, handlerOrMiddlewares);
    }
    // Si tanto el segundo como el tercer argumento existen, el segundo es un middleware y el tercero el handler
    else {
      this.router.put(path, handlerOrMiddlewares, handler);
    }
    return this;
  }

  /**
   * Registra una ruta DELETE
   * @param {String|Object} pathOrOptions - Ruta a registrar o opciones de configuración
   * @param {Function|Array} handlerOrMiddlewares - Manejador de la ruta o middlewares
   * @param {Function} [handler] - Manejador de la ruta si el segundo argumento es middlewares
   * @returns {BaseRoute} - this, para encadenamiento
   */
  delete(pathOrOptions, handlerOrMiddlewares, handler) {
    // Caso 1: Se llama con options (nueva forma con objeto de opciones)
    if (typeof pathOrOptions === 'object' && !Array.isArray(pathOrOptions) && !handlerOrMiddlewares) {
      const options = pathOrOptions || {};
      const { validate = false, log = true } = options;
      const mw = [];

      if (validate) {
        mw.push(this.validateRequest(ValidationService.createIdSchema()));
      }

      if (log) {
        mw.push(this.logOperation('Delete record'));
      }

      this.router.delete('/:id', ...mw, this.controller.delete.bind(this.controller));
      return this;
    }
    
    // Caso 2: Se llama con path y middlewares/handler (forma tradicional)
    // Si el segundo argumento es un arreglo, asumimos que son middlewares
    if (Array.isArray(handlerOrMiddlewares)) {
      this.router.delete(pathOrOptions, ...handlerOrMiddlewares, handler);
    } 
    // Si el segundo argumento es una función y el tercero no existe, asumimos que es el handler
    else if (typeof handlerOrMiddlewares === 'function' && !handler) {
      this.router.delete(pathOrOptions, handlerOrMiddlewares);
    }
    // Si tanto el segundo como el tercer argumento existen, el segundo es un middleware y el tercero el handler
    else {
      this.router.delete(pathOrOptions, handlerOrMiddlewares, handler);
    }
    return this;
  }

  /**
   * Registra una ruta PATCH
   * @param {String} path - Ruta a registrar
   * @param {Function|Array} handlerOrMiddlewares - Manejador de la ruta o middlewares
   * @param {Function} [handler] - Manejador de la ruta si el segundo argumento es middlewares
   * @returns {BaseRoute} - this, para encadenamiento
   */
  patch(path, handlerOrMiddlewares, handler) {
    // Si el segundo argumento es un arreglo, asumimos que son middlewares
    if (Array.isArray(handlerOrMiddlewares)) {
      this.router.patch(path, ...handlerOrMiddlewares, handler);
    } 
    // Si el segundo argumento es una función y el tercero no existe, asumimos que es el handler
    else if (typeof handlerOrMiddlewares === 'function' && !handler) {
      this.router.patch(path, handlerOrMiddlewares);
    }
    // Si tanto el segundo como el tercer argumento existen, el segundo es un middleware y el tercero el handler
    else {
      this.router.patch(path, handlerOrMiddlewares, handler);
    }
    return this;
  }

  // Standard CRUD routes
  getAll(options = {}) {
    const { cache = false, validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.validateRequest(ValidationService.createPaginationSchema()));
    }

    if (cache) {
      middlewares.push(this.cacheResponse(cache));
    }

    if (log) {
      middlewares.push(this.logOperation('Get all records'));
    }

    this.router.get('/', ...middlewares, this.controller.getAll.bind(this.controller));
    return this;
  }

  getById(options = {}) {
    const { cache = false, validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.validateRequest(ValidationService.createIdSchema()));
    }

    if (cache) {
      middlewares.push(this.cacheResponse(cache));
    }

    if (log) {
      middlewares.push(this.logOperation('Get record by ID'));
    }

    this.router.get('/:id', ...middlewares, this.controller.getById.bind(this.controller));
    return this;
  }

  create(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.validateRequest(validate));
    }

    if (log) {
      middlewares.push(this.logOperation('Create record'));
    }

    this.router.post('/', ...middlewares, this.controller.create.bind(this.controller));
    return this;
  }

  update(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.validateRequest(validate));
    }

    if (log) {
      middlewares.push(this.logOperation('Update record'));
    }

    this.router.put('/:id', ...middlewares, this.controller.update.bind(this.controller));
    return this;
  }

  // Bulk operations
  bulkCreate(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.validateRequest(validate));
    }

    if (log) {
      middlewares.push(this.logOperation('Bulk create records'));
    }

    this.router.post('/bulk', ...middlewares, this.controller.bulkCreate.bind(this.controller));
    return this;
  }

  bulkUpdate(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.validateRequest(validate));
    }

    if (log) {
      middlewares.push(this.logOperation('Bulk update records'));
    }

    this.router.put('/bulk', ...middlewares, this.controller.bulkUpdate.bind(this.controller));
    return this;
  }

  bulkDelete(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.validateRequest(ValidationService.createIdsSchema()));
    }

    if (log) {
      middlewares.push(this.logOperation('Bulk delete records'));
    }

    this.router.delete('/bulk', ...middlewares, this.controller.bulkDelete.bind(this.controller));
    return this;
  }

  // Search and count
  search(options = {}) {
    const { cache = false, validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.validateRequest(ValidationService.createSearchSchema()));
    }

    if (cache) {
      middlewares.push(this.cacheResponse(cache));
    }

    if (log) {
      middlewares.push(this.logOperation('Search records'));
    }

    this.router.get('/search', ...middlewares, this.controller.search.bind(this.controller));
    return this;
  }

  count(options = {}) {
    const { cache = false, validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(
        this.validateRequest(ValidationService.createFilterSchema(options.fields || [])),
      );
    }

    if (cache) {
      middlewares.push(this.cacheResponse(cache));
    }

    if (log) {
      middlewares.push(this.logOperation('Count records'));
    }

    this.router.get('/count', ...middlewares, this.controller.count.bind(this.controller));
    return this;
  }

  // Custom routes
  custom(method, path, handler, options = {}) {
    const { validate = false, cache = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.validateRequest(validate));
    }

    if (cache) {
      middlewares.push(this.cacheResponse(cache));
    }

    if (log) {
      middlewares.push(this.logOperation(`${method.toUpperCase()} ${path}`));
    }

    this.router[method.toLowerCase()](path, ...middlewares, handler.bind(this.controller));
    return this;
  }

  // Apply middleware to all routes
  use(middleware) {
    this.router.use(middleware);
    return this;
  }

  // Apply prefix to all routes
  prefix(prefix) {
    this.router = express.Router().use(prefix, this.router);
    return this;
  }

  // Apply authentication middleware
  authenticate(middleware) {
    this.router.use(middleware);
    return this;
  }

  // Apply authorization middleware
  authorize(middleware) {
    this.router.use(middleware);
    return this;
  }

  // Apply rate limiting middleware
  rateLimit(middleware) {
    this.router.use(middleware);
    return this;
  }

  // Apply validation middleware
  validate(middleware) {
    this.router.use(middleware);
    return this;
  }

  // Apply caching middleware
  cache(middleware) {
    this.router.use(middleware);
    return this;
  }

  // Apply logging middleware
  log(middleware) {
    this.router.use(middleware);
    return this;
  }
}
