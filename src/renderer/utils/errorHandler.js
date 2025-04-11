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
      mensaje: error.message,
      tipo: 'negocio',
      contexto: error.context
    }];
  }

  return [{
    campo: 'general',
    mensaje: 'Error de sistema',
    tipo: 'sistema',
    contexto: {}
  }];
};