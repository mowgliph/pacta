import { useState } from 'react'

/**
 * Hook personalizado para gestionar el estado de diálogos o modales
 * Proporciona un mecanismo para alternar el estado con la misma entrada
 * (si se pasa el mismo valor que ya está activo, se cierra)
 * 
 * @param initialState Valor inicial del estado (string, boolean o null)
 * @returns [estado actual, función para alternar el estado]
 * 
 * @example
 * // Para un diálogo simple (abierto/cerrado)
 * const [open, setOpen] = useDialogState<boolean>(false);
 * 
 * // Para un diálogo con diferentes modos
 * const [dialogMode, setDialogMode] = useDialogState<"crear" | "editar" | "eliminar">();
 * 
 * // Para abrir el diálogo en modo editar
 * setDialogMode("editar");
 * 
 * // Para cerrar el diálogo
 * setDialogMode(null);
 * // O también:
 * setDialogMode("editar"); // Si ya estaba en modo editar, se cierra
 */
export function useDialogState<T extends string | boolean>(
  initialState: T | null = null
) {
  const [state, setState] = useState<T | null>(initialState)

  // Esta función alterna el estado: si el nuevo valor es igual al actual, lo pone a null
  const toggleState = (newState: T | null) =>
    setState((prevState) => (prevState === newState ? null : newState))

  return [state, toggleState] as const
} 