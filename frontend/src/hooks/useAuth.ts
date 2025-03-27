import { useStore } from '@/store'

export const useAuth = () => {
  const { 
    usuario, 
    token, 
    cargando, 
    error,
    iniciarSesion,
    cerrarSesion,
    verificarSesion,
    tienePermiso 
  } = useStore()

  return {
    usuario,
    token,
    cargando,
    error,
    iniciarSesion,
    cerrarSesion,
    verificarSesion,
    tienePermiso,
    estaAutenticado: !!token
  }
}