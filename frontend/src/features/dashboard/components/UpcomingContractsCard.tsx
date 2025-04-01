import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UpcomingContract {
  id: string;
  contractNumber: string;
  company: string;
  type: string;
  daysUntilExpiry: number;
}

interface UpcomingContractsCardProps {
  contracts: UpcomingContract[];
  isLoading?: boolean;
}

export const UpcomingContractsCard: React.FC<UpcomingContractsCardProps> = ({
  contracts,
  isLoading = false,
}) => {
  // Función para determinar el color del indicador según los días restantes
  const getExpiryColor = (days: number) => {
    if (days <= 7) return 'bg-red-500';
    if (days <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Función para formatear el texto de días restantes
  const formatDaysText = (days: number) => {
    if (days === 1) return '1 día';
    if (days < 7) return `${days} días`;
    if (days < 30) return `${Math.ceil(days / 7)} semanas`;
    return `${Math.ceil(days / 30)} ${Math.ceil(days / 30) === 1 ? 'mes' : 'meses'}`;
  };

  // Si está cargando, mostrar esqueleto de carga
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Contratos por Vencer</CardTitle>
          <CardDescription>
            Contratos que requieren renovación próximamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 border-b pb-3 last:border-0">
                <div className="h-2 w-2 rounded-full bg-muted animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 w-12 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="h-3 w-28 bg-muted rounded animate-pulse mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Contratos por Vencer</CardTitle>
        <CardDescription>
          Contratos que requieren renovación próximamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <p>No hay contratos próximos a vencer</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div 
                key={contract.id} 
                className="flex items-center gap-2 border-b pb-3 last:border-0 group transition-colors hover:bg-muted/30 p-2 rounded-md"
              >
                <div 
                  className={cn(
                    "h-2 w-2 rounded-full transition-all group-hover:scale-125", 
                    getExpiryColor(contract.daysUntilExpiry)
                  )} 
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Contrato #{contract.contractNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDaysText(contract.daysUntilExpiry)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {contract.company} - {contract.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 