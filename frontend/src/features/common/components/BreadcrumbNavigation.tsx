import React from 'react';
import { Link, useRouterState, useMatches } from '@tanstack/react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { IconHome } from '@tabler/icons-react';

// Definición de tipo para el contexto de ruta que proporciona información de breadcrumb
type RouteContext = {
  breadcrumb?: string;
}

// Props del componente
type BreadcrumbNavigationProps = {
  className?: string;
}

// Función para reconstruir la ruta completa
const getFullPath = (paths: string[]): string => {
  return '/' + paths.filter(Boolean).join('/');
};

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ className }) => {
  const router = useRouterState();
  const matches = useMatches();
  
  // Filtramos las rutas que tienen IDs con underscores ya que suelen ser rutas de layout
  const filteredMatches = matches.filter(match => !match.routeId.startsWith('_'));
  
  // Si estamos en la ruta raíz, no mostramos breadcrumbs
  if (filteredMatches.length <= 1 && router.location.pathname === '/') {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {/* Siempre mostramos Home al inicio */}
        <BreadcrumbItem>
          <Link to="/" className="flex items-center">
            <IconHome className="h-4 w-4 mr-1" />
            <span>Inicio</span>
          </Link>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator />
        
        {/* Mapear las rutas anidadas para crear el breadcrumb */}
        {filteredMatches.map((match, index) => {
          const isLast = index === filteredMatches.length - 1;
          const paths = filteredMatches.slice(0, index + 1).map(m => m.pathname);
          const fullPath = getFullPath(paths);
          
          // Extraer el nombre usando el pathname como fallback
          // Nota: cada ruta puede definir un metadato para breadcrumb
          const routeName = 
            // Casting seguro a any para acceder a metadatos posibles
            ((match as any).__lazyMeta?.breadcrumb || 
             (match as any).meta?.breadcrumb) || 
            // Capitalizar el pathname como fallback
            (match.pathname && match.pathname.charAt(0).toUpperCase() + match.pathname.slice(1)) || 
            'Página';
          
          // El último elemento no es clickeable
          return (
            <React.Fragment key={match.id}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{routeName}</BreadcrumbPage>
                ) : (
                  <Link to={fullPath} className="text-muted-foreground hover:text-foreground transition-colors">
                    {routeName}
                  </Link>
                )}
              </BreadcrumbItem>
              
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}; 