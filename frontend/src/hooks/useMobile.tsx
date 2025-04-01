import * as React from 'react'

/**
 * Punto de quiebre para considerar un dispositivo como móvil (en píxeles)
 */
const MOBILE_BREAKPOINT = 768

/**
 * Hook para detectar si el dispositivo actual es móvil basado en el ancho de pantalla
 * @returns {boolean} true si el dispositivo es móvil (anchura < 768px)
 */
export function useMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const handleChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Añadir listener para cambios en el tamaño de la ventana
    mediaQuery.addEventListener('change', handleChange)
    
    // Establecer el valor inicial
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Limpiar el listener cuando el componente se desmonte
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Convertimos undefined a false (al inicio antes del efecto)
  return !!isMobile
}

/**
 * Hook alternativo que devuelve si el dispositivo es móvil, tablet o desktop
 * @returns {string} 'mobile', 'tablet', o 'desktop'
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    // Establecer valor inicial
    handleResize()

    // Añadir listener para cambios de tamaño
    window.addEventListener('resize', handleResize)
    
    // Limpiar
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceType
} 