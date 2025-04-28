"use client";

import { useState, useCallback } from "react";
import { z } from "zod";

/**
 * Hook personalizado para manejar formularios con validación Zod
 * 
 * @param schema - Esquema Zod para validación
 * @param initialValues - Valores iniciales del formulario
 * @returns Objeto con valores, errores y funciones para manejar el formulario
 */
export function useZodForm<T extends z.ZodType>(
  schema: T,
  initialValues: z.infer<T> = {} as z.infer<T>
) {
  // Estado para valores del formulario
  const [values, setValues] = useState<z.infer<T>>(initialValues);
  
  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estado para indicar si el formulario está enviándose
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Manejar cambio en un campo del formulario
   */
  const handleChange = useCallback((field: keyof z.infer<T>, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error al cambiar valor
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Validar el formulario completo
   */
  const validate = useCallback(() => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema, values]);

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = useCallback((onSubmit: (values: z.infer<T>) => Promise<void> | void) => {
    return async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      
      if (validate()) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    };
  }, [validate, values]);

  /**
   * Restablecer el formulario a sus valores iniciales
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValue: (field: keyof z.infer<T>, value: any) => handleChange(field, value),
    setValues: (newValues: Partial<z.infer<T>>) => 
      setValues(prev => ({ ...prev, ...newValues })),
    reset,
    validate,
  };
} 