/**
 * Interfaz para respuestas IPC estándar
 * @template T - Tipo de datos esperado en la respuesta
 */
export interface IpcResponse<T> {
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
  data: T;
}

/**
 * Maneja respuestas IPC estándar, arrojando un error si no son exitosas
 * @template T - Tipo de datos esperado en la respuesta
 * @param res - Respuesta IPC con estructura estándar
 * @returns Los datos de la respuesta si es exitosa
 * @throws Error si la respuesta no es exitosa
 */
export const handleIpcResponse = <T>(res: IpcResponse<T>): T => {
  if (!res.success) throw new Error(res.error?.message || "Error desconocido");
  return res.data;
};
