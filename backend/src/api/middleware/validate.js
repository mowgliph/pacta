import { ValidationError } from '../../utils/errors.js';
import { z } from 'zod';

/**
 * Middleware de validación de datos con Zod
 * @param {object} options - Opciones de validación
 * @param {z.ZodSchema} options.body - Esquema para validar req.body
 * @param {z.ZodSchema} options.query - Esquema para validar req.query
 * @param {z.ZodSchema} options.params - Esquema para validar req.params
 * @returns {Function} Middleware para Express
 */
export const validate = (options) => async (req, res, next) => {
  try {
    const schema = z.object({
      body: options.body ? options.body : z.any(),
      query: options.query ? options.query : z.any(),
      params: options.params ? options.params : z.any(),
    });

    const data = {
      body: req.body,
      query: req.query,
      params: req.params,
    };

    const validatedData = await schema.parseAsync(data);

    // Replace request data with validated data
    req.body = validatedData.body;
    req.query = validatedData.query;
    req.params = validatedData.params;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      next(new ValidationError('Validation failed', validationErrors));
    } else {
      next(error);
    }
  }
};

/**
 * Forma abreviada para validar solo el cuerpo de la solicitud
 * @param {z.ZodSchema} bodySchema - Esquema para validar req.body
 * @returns {Function} Middleware para Express
 */
export const validateBody = (bodySchema) => validate({ body: bodySchema });

/**
 * Forma abreviada para validar solo los parámetros de la solicitud
 * @param {z.ZodSchema} paramsSchema - Esquema para validar req.params
 * @returns {Function} Middleware para Express
 */
export const validateParams = (paramsSchema) => validate({ params: paramsSchema });

/**
 * Forma abreviada para validar solo los parámetros de consulta
 * @param {z.ZodSchema} querySchema - Esquema para validar req.query
 * @returns {Function} Middleware para Express
 */
export const validateQuery = (querySchema) => validate({ query: querySchema });

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
