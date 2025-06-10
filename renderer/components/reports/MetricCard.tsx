import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  change,
  icon,
  className = '',
}: MetricCardProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {change !== undefined && (
          <div className="mt-2 flex items-center text-xs">
            {change >= 0 ? (
              <IconArrowUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <IconArrowDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={cn(
              'font-medium',
              change >= 0 ? 'text-green-500' : 'text-red-500'
            )}>
              {Math.abs(change)}% vs período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
