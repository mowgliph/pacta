import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UpcomingContract } from '../types';
import { Badge } from '@/components/ui/badge';
import { IconCalendarDue, IconExternalLink } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

type UpcomingContractsCardProps = {
  contracts: UpcomingContract[];
  isLoading?: boolean;
  className?: string;
}

export const UpcomingContractsCard: React.FC<UpcomingContractsCardProps> = ({
  contracts = [],
  isLoading = false,
  className
}) => {
  // Determinar la variante del badge según los días restantes
  const getVariant = (days: number) => {
    if (days <= 7) return 'destructive';
    if (days <= 30) return 'warning';
    return 'outline';
  };
  
  // Renderizar un elemento de contrato próximo a vencer
  const renderContractItem = (contract: UpcomingContract) => (
    <div key={contract.id} className="flex justify-between items-center py-3">
      <div className="space-y-1">
        <div className="font-medium text-sm">
          {contract.company}
        </div>
        <div className="text-xs text-muted-foreground">
          #{contract.contractNumber} - {contract.type}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={getVariant(contract.daysUntilExpiry)}>
          {contract.daysUntilExpiry} días
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          asChild
        >
          <Link to={`/contracts/${contract.id}`}>
            <IconExternalLink className="h-4 w-4" />
            <span className="sr-only">Ver contrato</span>
          </Link>
        </Button>
      </div>
    </div>
  );
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contratos por vencer</CardTitle>
        {!isLoading && contracts.length > 0 && (
          <Link to="/contracts?filter=expiring">
            <Button variant="ghost" size="sm" className="text-xs">
              Ver todos
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Mostrar esqueleto durante la carga
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center py-3">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : contracts.length === 0 ? (
          // Mostrar mensaje si no hay contratos por vencer
          <div className="py-8 text-center text-muted-foreground">
            <IconCalendarDue className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No hay contratos próximos a vencer</p>
          </div>
        ) : (
          // Mostrar los contratos
          <div className="space-y-1 divide-y">
            {contracts.map(renderContractItem)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 