import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Componente que inicializa la navegación en el AuthProvider.
 * Este componente debe estar dentro de un componente Route.
 */
export function RouterInitializer() {
  const navigate = useNavigate();
  const { initializeNavigation } = useAuth();

  useEffect(() => {
    // Inicializar la navegación en el AuthProvider
    if (navigate && initializeNavigation) {
      initializeNavigation(navigate);
    }
  }, [navigate, initializeNavigation]);

  return null;
}
