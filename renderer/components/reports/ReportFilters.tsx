import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { IconCalendar, IconFilter, IconRotate2 } from '@tabler/icons-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface ReportFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  reportType: string;
  onReportTypeChange: (type: string) => void;
  onReset: () => void;
  reportTypes: Array<{ value: string; label: string }>;
  className?: string;
}

export function ReportFilters({
  dateRange,
  onDateRangeChange,
  reportType,
  onReportTypeChange,
  onReset,
  reportTypes,
  className = '',
}: ReportFiltersProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow p-4 mb-6', className)}>
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte
            </label>
            <Select
              value={reportType}
              onValueChange={onReportTypeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de inicio
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange.from && 'text-muted-foreground'
                  )}
                >
                  <IconCalendar className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    format(dateRange.from, 'PPP', { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  selectedDate={dateRange.from}
                  onSelectDate={(date) =>
                    onDateRangeChange({
                      from: date,
                      to: dateRange.to,
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de fin
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange.to && 'text-muted-foreground'
                  )}
                  disabled={!dateRange.from}
                >
                  <IconCalendar className="mr-2 h-4 w-4" />
                  {dateRange.to ? (
                    format(dateRange.to, 'PPP', { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  selectedDate={dateRange.to}
                  onSelectDate={(date) =>
                    onDateRangeChange({
                      from: dateRange.from,
                      to: date,
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full sm:w-auto"
          >
            <IconRotate2 className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
          <Button className="w-full sm:w-auto">
            <IconFilter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>
    </div>
  );
}
