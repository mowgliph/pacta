export const handleValidationError = (error) => {
  if (error instanceof z.ZodError) {
    return error.errors.map(err => ({
      campo: err.path.join('.'),
      mensaje: err.message,
      tipo: 'validacion',
      contexto: err.context || {}
    }));
  }

  if (error.name === 'BusinessError') {
    return [{
      campo: error.field || 'general',
      mensaje: error.message || 'Error en la operación',
      tipo: 'negocio',
      contexto: error.context
    }];
  }

  if (error.name === 'NetworkError') {
    return [{
      campo: 'general',
      mensaje: 'Error de conexión. Por favor, verifique su conexión a internet.',
      tipo: 'red',
      contexto: {}
    }];
  }

  if (error.name === 'AuthenticationError') {
    return [{
      campo: 'general',
      mensaje: 'Error de autenticación. Por favor, inicie sesión nuevamente.',
      tipo: 'autenticacion',
      contexto: {}
    }];
  }

  return [{
    campo: 'general',
    mensaje: 'Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo.',
    tipo: 'sistema',
    contexto: {}
  }];
};