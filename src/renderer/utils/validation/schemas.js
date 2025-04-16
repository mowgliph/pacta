import { z } from 'zod';

// Esquemas base
export const AuthSchema = z.object({
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede exceder 20 caracteres'),
  password: z.string()
    .refine((password, ctx) => {
      // Si el usuario es admin o ra, permitir la contraseña "pacta" sin validaciones adicionales
      if (ctx.data.username === 'admin' || ctx.data.username === 'ra') {
        return true;
      }
      
      // Para otros usuarios, aplicar validaciones estándar
      if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 8,
          type: "string",
          inclusive: true,
          message: "La contraseña debe tener al menos 8 caracteres"
        });
        return false;
      }
      
      if (!/[A-Z]/.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe contener al menos una mayúscula"
        });
        return false;
      }
      
      if (!/[0-9]/.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe contener al menos un número"
        });
        return false;
      }
      
      return true;
    })
});

// Esquema de Relaciones de Contratos
export const EsquemaRelacionesContrato = z.object({
  contratoPadre: z.object({
    id: z.string({
      required_error: "El ID del contrato padre es requerido",
      invalid_type_error: "El ID debe ser una cadena de texto"
    }),
    tipo: z.enum(['maestro', 'marco'], {
      invalid_type_error: "Tipo de contrato padre no válido"
    }),
    empresaId: z.number().optional(),
    departamentoId: z.number().optional(),
    responsableId: z.number().optional(),
  }).optional(),
  
  contratosRelacionados: z.array(z.object({
    id: z.string({
      required_error: "El ID del contrato relacionado es requerido"
    }),
    tipoRelacion: z.enum(['suplemento', 'modificacion', 'renovacion'], {
      invalid_type_error: "Tipo de relación no válido"
    }),
    fechaEfectiva: z.date({
      required_error: "La fecha efectiva es requerida",
      invalid_type_error: "Fecha efectiva no válida"
    })
  })).optional(),

  dependencias: z.array(z.object({
    contratoId: z.string(),
    tipo: z.enum(['requerido', 'opcional'], {
      invalid_type_error: "Tipo de dependencia no válido"
    }),
    estado: z.enum(['activo', 'pendiente', 'completado']),
    reglasValidacion: z.array(z.object({
      condicion: z.string(),
      mensaje: z.string()
    }))
  })).optional()
}).refine(data => {
  if (data.dependencias?.length && !data.contratoPadre) {
    return false;
  }
  return true;
}, {
  message: "Las dependencias requieren un contrato padre",
  path: ["dependencias"]
});

export const ContractSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre del contrato debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  fechaInicio: z.date({
    required_error: 'La fecha de inicio es requerida',
    invalid_type_error: 'Formato de fecha inválido'
  }),
  fechaFin: z.date()
    .refine(date => date > new Date(), {
      message: 'La fecha final debe ser futura'
    }),
  estado: z.enum(['Activo', 'Inactivo', 'Pendiente'], {
    errorMap: () => ({ message: 'Estado no válido' })
  }),
  urlArchivo: z.string().url('URL de documento inválida').optional(),
  relaciones: EsquemaRelacionesContrato,
  validaciones: z.object({
    cadenaAprobacion: z.array(z.object({
      rol: z.string(),
      orden: z.number(),
      requerido: z.boolean()
    })),
    reglasPersonalizadas: z.array(z.object({
      regla: z.string(),
      mensajeError: z.string(),
      severidad: z.enum(['error', 'advertencia'])
    }))
  }).optional()
});

export const SupplementSchema = z.object({
  descripcion: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  fecha: z.date({
    required_error: 'La fecha del suplemento es requerida',
    invalid_type_error: 'Formato de fecha inválido'
  }),
  rutaArchivo: z.string().url('Ruta de archivo inválida').optional()
});

export const EstadisticasSchema = z.object({
  rangoFechas: z.object({
    fechaInicio: z.date({
      required_error: "La fecha inicial es requerida",
      invalid_type_error: "Fecha inicial debe ser válida"
    }),
    fechaFin: z.date({
      required_error: "La fecha final es requerida",
      invalid_type_error: "Fecha final debe ser válida"
    })
  }).refine(data => data.fechaInicio <= data.fechaFin, {
    message: "La fecha final debe ser posterior a la inicial",
    path: ["fechaFin"]
  }),
  filtros: z.object({
    tiposContrato: z.array(z.string()).optional(),
    estado: z.array(z.string()).optional(),
    empresas: z.array(z.string()).optional()
  })
});

export const ReporteSchema = z.object({
  tipo: z.enum(['resumen', 'detallado', 'financiero', 'cumplimiento'], {
    invalid_type_error: "Tipo de reporte no válido"
  }),
  formato: z.enum(['pdf', 'excel', 'csv'], {
    invalid_type_error: "Formato de exportación no válido"
  }),
  rangoFechas: z.object({
    fechaInicio: z.date(),
    fechaFin: z.date()
  }),
  incluirAdjuntos: z.boolean().default(false),
  filtros: z.object({
    estadoContrato: z.array(z.string()).optional(),
    tiposContrato: z.array(z.string()).optional(),
    empresas: z.array(z.string()).optional()
  })
});

export const PerfilUsuarioSchema = z.object({
  nombreCompleto: z.string()
    .min(3, 'El nombre completo debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  rol: z.enum(['Administrador', 'Gestor', 'Usuario'])
});

export const ArchivoSchema = z.object({
  archivo: z.instanceof(File),
  tipo: z.enum(['contrato', 'suplemento', 'otro']),
  tamañoMaximo: z.number().default(10 * 1024 * 1024) // 10MB por defecto
});

export const NotificacionSchema = z.object({
  titulo: z.string().min(3).max(100),
  mensaje: z.string().min(10).max(500),
  tipo: z.enum(['info', 'advertencia', 'error', 'exito']),
  idUsuario: z.number().optional(),
  leida: z.boolean().default(false)
});

export const PermisosRolSchema = z.object({
  rol: z.enum(['Administrador', 'Gestor', 'Usuario', 'RA']),
  permisos: z.array(
    z.enum(['lectura', 'escritura', 'eliminacion', 'gestion'])
  )
});

export const EmpresaSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre de la empresa debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  rif: z.string()
    .regex(/^[JGVE]-\d{8}-\d$/, 'Formato de RIF inválido'),
  direccion: z.string()
    .max(500, 'La dirección no puede exceder 500 caracteres'),
  contactoPrincipal: z.object({
    nombre: z.string(),
    telefono: z.string(),
    email: z.string().email('Email de contacto inválido')
  })
});

export const DepartamentoSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre del departamento debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  responsable: z.string(),
  presupuesto: z.number().optional()
});

export const AuditoriaSchema = z.object({
  accion: z.enum(['crear', 'modificar', 'eliminar', 'ver']),
  entidad: z.string(),
  detalles: z.string(),
  fecha: z.date(),
  usuario: z.string(),
  cambios: z.array(z.object({
    campo: z.string(),
    valorAnterior: z.any(),
    valorNuevo: z.any()
  })).optional()
});


export const ValidacionesAvanzadasSchema = z.object({
  reglas: z.array(z.object({
    campo: z.string(),
    tipo: z.enum(['requerido', 'dependiente', 'condicional']),
    condicion: z.string(),
    mensaje: z.string()
  })),
  dependencias: z.array(z.object({
    campoOrigen: z.string(),
    campoDependiente: z.string(),
    tipo: z.enum(['habilitar', 'deshabilitar', 'mostrar', 'ocultar'])
  }))
});


