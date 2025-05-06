export const handleIpcResponse = <T>(res: any): T => {
  if (!res.success) throw new Error(res.error?.message || "Error desconocido");
  return res.data;
};
