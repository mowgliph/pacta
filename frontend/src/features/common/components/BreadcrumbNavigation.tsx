import React from 'react';
import { Link, useMatches } from '@remix-run/react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { IconHome } from '@tabler/icons-react';

// Props del componente
type BreadcrumbNavigationProps = {
  className?: string;
}

// Tipo para los datos de la ruta en Remix
type RouteHandle = {
  breadcrumb?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ className }) => {
  const matches = useMatches();
  
  // Filtramos las rutas sin handle o breadcrumb
  const breadcrumbs = matches
    .filter(match => match.handle && (match.handle as RouteHandle).breadcrumb)
    .map(match => ({
      breadcrumb: (match.handle as RouteHandle).breadcrumb as string,
      pathname: match.pathname
    }));
  
  // Si no hay breadcrumbs o estamos en la ruta raíz, no mostramos nada
  if (breadcrumbs.length === 0 || window.location.pathname === '/') {
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
        
        {/* Mapear las rutas para crear el breadcrumb */}
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <React.Fragment key={item.pathname}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.breadcrumb}</BreadcrumbPage>
                ) : (
                  <Link 
                    to={item.pathname} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.breadcrumb}
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