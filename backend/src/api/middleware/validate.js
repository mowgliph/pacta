import { ValidationError } from '../../utils/errors.js';

export const validate = schema => async (req, res, next) => {
  try {
    const validatedData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request data with validated data
    req.body = validatedData.body;
    req.query = validatedData.query;
    req.params = validatedData.params;

    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      next(new ValidationError(JSON.stringify(validationErrors)));
    } else {
      next(error);
    }
  }
};

// Example usage:
/*
const userSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
  }),
});

router.post('/users', validate(userSchema), userController.create);
*/
