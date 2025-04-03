const ContractsTable: React.FC<ContractsTableProps> = ({ 
  contracts = [], 
  isLoading = false,
  onViewContract,
  isSelectable = false,
  onSelectContract
}) => {
  // Función para renderizar el estado del contrato
  const renderStatus = (status: ContractStatus) => {
    const statusConfig: Record<ContractStatus, { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' }> = {
      [ContractStatus.ACTIVE]: { label: 'Activo', variant: 'default' },
      [ContractStatus.DRAFT]: { label: 'Borrador', variant: 'outline' },
      [ContractStatus.EXPIRED]: { label: 'Vencido', variant: 'destructive' },
      [ContractStatus.CANCELLED]: { label: 'Cancelado', variant: 'secondary' },
      [ContractStatus.RENEWAL]: { label: 'En renovación', variant: 'outline' }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };
  
  // Función para renderizar el tipo de contrato
  const renderType = (type: ContractType) => {
    const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
      [ContractType.CLIENT]: { 
        label: 'Cliente', 
        icon: <IconBuildingStore className="h-4 w-4 mr-1" /> 
      },
      [ContractType.PROVIDER]: { 
        label: 'Proveedor', 
        icon: <IconTruckDelivery className="h-4 w-4 mr-1" /> 
      },
      [ContractType.EMPLOYEE]: { 
        label: 'Empleado', 
        icon: <IconUserPlus className="h-4 w-4 mr-1" /> 
      },
      [ContractType.OTHER]: { 
        label: 'Otro', 
        icon: <IconFile className="h-4 w-4 mr-1" /> 
      }
    };

    const config = typeConfig[type] || { label: type, icon: <IconFile className="h-4 w-4 mr-1" /> };
    
    return (
      <div className="flex items-center text-sm">
        {config.icon}
        {config.label}
      </div>
    );
  };
  
  // Si no hay contratos y no está cargando, mostrar mensaje
  if (contracts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No hay contratos para mostrar</p>
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {isSelectable && <TableHead className="w-12"></TableHead>}
            <TableHead>Contrato</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fechas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Esqueletos de carga
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {isSelectable && <TableCell className="w-12"><div className="h-4 w-4 rounded-sm bg-muted animate-pulse" /></TableCell>}
                <TableCell>
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  </div>
                </TableCell>
                <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-6 w-16 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-28 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell className="text-right"><div className="h-8 w-8 bg-muted rounded-full ml-auto animate-pulse" /></TableCell>
              </TableRow>
            ))
          ) : (
            contracts.map((contract) => (
              <TableRow key={contract.id}>
                {isSelectable && (
                  <TableCell className="w-12">
                    <Checkbox 
                      checked={false} 
                      onCheckedChange={() => onSelectContract?.(contract)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div>
                    <div className="font-medium">{contract.title}</div>
                    <div className="text-sm text-muted-foreground">#{contract.contractNumber}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {contract.company?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  {renderType(contract.type as ContractType)}
                </TableCell>
                <TableCell>
                  {renderStatus(contract.status as ContractStatus)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{formatDate(contract.startDate)} -</div>
                    <div>{formatDate(contract.endDate)}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewContract(contract.id)}
                  >
                    <IconEye className="h-4 w-4" />
                    <span className="sr-only">Ver contrato</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}; 