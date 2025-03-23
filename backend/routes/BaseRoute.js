import express from 'express';
import { LoggingService } from '../services/LoggingService.js';
import { CacheService } from '../services/CacheService.js';
import { ValidationService } from '../services/ValidationService.js';
import { ResponseService } from '../services/ResponseService.js';

export class BaseRoute {
  constructor(controller, router = express.Router()) {
    this.controller = controller;
    this.router = router;
  }

  // Standard CRUD routes
  getAll(options = {}) {
    const { cache = false, validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(ValidationService.createPaginationSchema()));
    }

    if (cache) {
      middlewares.push(this.controller.cacheResponse(cache));
    }

    if (log) {
      middlewares.push(this.controller.logOperation('Get all records'));
    }

    this.router.get('/', ...middlewares, this.controller.getAll.bind(this.controller));
    return this;
  }

  getById(options = {}) {
    const { cache = false, validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(ValidationService.createIdSchema()));
    }

    if (cache) {
      middlewares.push(this.controller.cacheResponse(cache));
    }

    if (log) {
      middlewares.push(this.controller.logOperation('Get record by ID'));
    }

    this.router.get('/:id', ...middlewares, this.controller.getById.bind(this.controller));
    return this;
  }

  create(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(validate));
    }

    if (log) {
      middlewares.push(this.controller.logOperation('Create record'));
    }

    this.router.post('/', ...middlewares, this.controller.create.bind(this.controller));
    return this;
  }

  update(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(validate));
    }

    if (log) {
      middlewares.push(this.controller.logOperation('Update record'));
    }

    this.router.put('/:id', ...middlewares, this.controller.update.bind(this.controller));
    return this;
  }

  delete(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(ValidationService.createIdSchema()));
    }

    if (log) {
      middlewares.push(this.controller.logOperation('Delete record'));
    }

    this.router.delete('/:id', ...middlewares, this.controller.delete.bind(this.controller));
    return this;
  }

  // Bulk operations
  bulkCreate(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(validate));
    }

    if (log) {
      middlewares.push(this.controller.logOperation('Bulk create records'));
    }

    this.router.post('/bulk', ...middlewares, this.controller.bulkCreate.bind(this.controller));
    return this;
  }

  bulkUpdate(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(validate));
    }

    if (log) {
      middlewares.push(this.controller.logOperation('Bulk update records'));
    }

    this.router.put('/bulk', ...middlewares, this.controller.bulkUpdate.bind(this.controller));
    return this;
  }

  bulkDelete(options = {}) {
    const { validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(ValidationService.createIdsSchema()));
    }

    if (log) {
      middlewares.push(this.controller.logOperation('Bulk delete records'));
    }

    this.router.delete('/bulk', ...middlewares, this.controller.bulkDelete.bind(this.controller));
    return this;
  }

  // Search and count
  search(options = {}) {
    const { cache = false, validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(ValidationService.createSearchSchema()));
    }

    if (cache) {
      middlewares.push(this.controller.cacheResponse(cache));
    }

    if (log) {
      middlewares.push(this.controller.logOperation('Search records'));
    }

    this.router.get('/search', ...middlewares, this.controller.search.bind(this.controller));
    return this;
  }

  count(options = {}) {
    const { cache = false, validate = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(ValidationService.createFilterSchema(options.fields || [])));
    }

    if (cache) {
      middlewares.push(this.controller.cacheResponse(cache));
    }

    if (log) {
      middlewares.push(this.controller.logOperation('Count records'));
    }

    this.router.get('/count', ...middlewares, this.controller.count.bind(this.controller));
    return this;
  }

  // Custom routes
  custom(method, path, handler, options = {}) {
    const { validate = false, cache = false, log = true } = options;
    const middlewares = [];

    if (validate) {
      middlewares.push(this.controller.validateRequest(validate));
    }

    if (cache) {
      middlewares.push(this.controller.cacheResponse(cache));
    }

    if (log) {
      middlewares.push(this.controller.logOperation(`${method.toUpperCase()} ${path}`));
    }

    this.router[method.toLowerCase()](path, ...middlewares, handler.bind(this.controller));
    return this;
  }

  // Get router instance
  getRouter() {
    return this.router;
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