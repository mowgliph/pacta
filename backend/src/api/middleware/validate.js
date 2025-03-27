import { ValidationError } from '../../utils/errors.js';
import { z } from 'zod';

/**
 * Middleware para validar datos de solicitud usando Zod
 *
 * @param {object} schema - Esquema Zod para validación
 * @param {string} type - Tipo de datos a validar: 'body' (default), 'query', 'params'
 * @returns {function} Middleware Express
 */
export const validate = (schema, type = 'body') => {
  return (req, res, next) => {
    try {
      // Seleccionar el origen de datos adecuado
      const data = req[type];

      // Validar datos con el esquema Zod
      const result = schema.safeParse(data);

      if (!result.success) {
        // Formatear errores de Zod
        const formattedErrors = {};

        result.error.errors.forEach(error => {
          const path = error.path.join('.');
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(error.message);
        });

        throw new ValidationError('Error de validación', formattedErrors);
      }

      // Reemplazar los datos con los validados y transformados por Zod
      req[type] = result.data;
      next();
    } catch (error) {
      // Si ya es un error de validación, pásalo directamente
      if (error instanceof ValidationError) {
        next(error);
      } else {
        // Otros errores (como los de tipo sintáctico)
        next(new ValidationError('Error de validación', { general: [error.message] }));
      }
    }
  };
};

/**
 * Middleware para validar múltiples fuentes de datos usando Zod
 *
 * @param {object} schemas - Objeto con esquemas para cada tipo: { body, query, params }
 * @returns {function} Middleware Express
 */
export const validateAll = schemas => {
  return (req, res, next) => {
    try {
      const errors = {};
      let hasErrors = false;

      // Validar cada tipo de datos si hay un esquema para él
      ['body', 'query', 'params'].forEach(type => {
        if (schemas[type]) {
          const result = schemas[type].safeParse(req[type]);

          if (!result.success) {
            hasErrors = true;

            // Formatear errores
            result.error.errors.forEach(error => {
              const path = `${type}.${error.path.join('.')}`;
              if (!errors[path]) {
                errors[path] = [];
              }
              errors[path].push(error.message);
            });
          } else {
            // Actualizar datos validados
            req[type] = result.data;
          }
        }
      });

      if (hasErrors) {
        throw new ValidationError('Error de validación', errors);
      }

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        next(error);
      } else {
        next(new ValidationError('Error de validación', { general: [error.message] }));
      }
    }
  };
};

/**
 * Middleware para validar ID numérico en parámetros
 * @returns {function} Middleware Express
 */
export const validateId = () => {
  return validate(
    z.object({
      id: z.coerce.number().int().positive(),
    }),
    'params',
  );
};

/**
 * Forma abreviada para validar solo el cuerpo de la solicitud
 * @param {z.ZodSchema} bodySchema - Esquema para validar req.body
 * @returns {Function} Middleware para Express
 */
export const validateBody = bodySchema => validate(bodySchema, 'body');

/**
 * Forma abreviada para validar solo los parámetros de la solicitud
 * @param {z.ZodSchema} paramsSchema - Esquema para validar req.params
 * @returns {Function} Middleware para Express
 */
export const validateParams = paramsSchema => validate(paramsSchema, 'params');

/**
 * Forma abreviada para validar solo los parámetros de consulta
 * @param {z.ZodSchema} querySchema - Esquema para validar req.query
 * @returns {Function} Middleware para Express
 */
export const validateQuery = querySchema => validate(querySchema, 'query');

// Ejemplo de uso:
/*
import { z } from 'zod';
import { validate, validateBody } from '../middleware/validate.js';

// Validación completa
router.post('/users', validate({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
  }),
  query: z.object({
    referral: z.string().optional(),
  })
}), userController.create);

// Solo validar body
router.post('/login', validateBody(
  z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })
), authController.login);
*/
