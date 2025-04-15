const { ZodError } = require('zod');

const errorHandler = (error, channel) => {
  // Log the error for debugging
  console.error(`Error en el canal ${channel}:`, error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      status: 'error',
      code: 'VALIDATION_ERROR',
      errors: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    };
  }

  // Handle database errors
  if (error.code && error.code.startsWith('P')) {
    return {
      status: 'error',
      code: 'DATABASE_ERROR',
      message: 'Ha ocurrido un error en la base de datos'
    };
  }

  // Handle file system errors
  if (error.code && error.code.startsWith('E')) {
    return {
      status: 'error',
      code: 'FILE_SYSTEM_ERROR',
      message: 'Error al acceder a los archivos del sistema'
    };
  }

  // Default error response
  return {
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'Ha ocurrido un error interno del servidor'
  };
};

module.exports = errorHandler;