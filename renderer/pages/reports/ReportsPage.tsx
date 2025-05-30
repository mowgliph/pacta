import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, FileText, Users, FileCheck, FileX } from 'lucide-react';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, PieChart, LineChart } from '@/components/charts/charts';
import { ReportCard, ReportFilters } from '@/components/reports';

type ReportType = 'contracts' | 'clients' | 'suppliers' | 'renewals';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

const reportTypes = [
  { value: 'contracts', label: 'Contratos' },
  { value: 'clients', label: 'Clientes' },
  { value: 'suppliers', label: 'Proveedores' },
  { value: 'renewals', label: 'Renovaciones' },
];

// Datos de ejemplo para las gráficas
const generateMockData = (type: ReportType, dateRange: DateRange) => {
  // En una aplicación real, estos datos vendrían de una API
  // basada en el tipo de reporte y el rango de fechas
  
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const currentMonth = new Date().getMonth();
  
  return {
    barData: {
      labels: months.slice(0, currentMonth + 1),
      datasets: [
        {
          label: 'Contratos',
          data: Array.from({ length: currentMonth + 1 }, () => Math.floor(Math.random() * 100) + 20),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
      ],
    },
    pieData: {
      labels: ['Activos', 'Por vencer', 'Vencidos', 'Cancelados'],
      datasets: [
        {
          data: [65, 15, 10, 10],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
          borderWidth: 1,
        },
      ],
    },
    lineData: {
      labels: months.slice(0, currentMonth + 1),
      datasets: [
        {
          label: 'Clientes',
          data: Array.from({ length: currentMonth + 1 }, () => Math.floor(Math.random() * 50) + 10),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Proveedores',
          data: Array.from({ length: currentMonth + 1 }, () => Math.floor(Math.random() * 30) + 5),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.3,
          fill: true,
        },
      ],
    },
  };
};

export default function ReportsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  
  const [reportType, setReportType] = useState<ReportType>('contracts');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(subMonths(new Date(), 6)), // Últimos 6 meses por defecto
    to: endOfMonth(new Date()),
  });
  
  const [reportData, setReportData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (isAuthenticated) {
      loadReportData();
    }
  }, [isAuthenticated, isLoading, navigate, reportType, dateRange]);

  const loadReportData = async () => {
    setIsLoadingData(true);
    
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generar datos de ejemplo basados en el tipo de reporte y fechas
      const data = generateMockData(reportType, dateRange);
      setReportData(data);
    } catch (error) {
      console.error('Error al cargar los datos del reporte:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleReportTypeChange = (type: string) => {
    setReportType(type as ReportType);
  };

  const handleResetFilters = () => {
    setDateRange({
      from: startOfMonth(subMonths(new Date(), 6)),
      to: endOfMonth(new Date()),
    });
    setReportType('contracts');
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-sm text-muted-foreground">
          Visualiza y analiza los datos de tu negocio
        </p>
      </div>

      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        reportType={reportType}
        onReportTypeChange={handleReportTypeChange}
        onReset={handleResetFilters}
        reportTypes={reportTypes}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ReportCard
          title="Total de Contratos"
          value="1,245"
          change={12.5}
          description="vs mes anterior"
          icon={<FileText className="h-5 w-5 text-blue-500" />}
        />
        <ReportCard
          title="Clientes Activos"
          value="342"
          change={5.2}
          description="+12 este mes"
          icon={<Users className="h-5 w-5 text-green-500" />}
        />
        <ReportCard
          title="Contratos por Vencer"
          value="28"
          change={-3.4}
          description="Próximos 30 días"
          icon={<FileCheck className="h-5 w-5 text-amber-500" />}
        />
        <ReportCard
          title="Contratos Vencidos"
          value="5"
          change={0}
          description="Necesitan atención"
          icon={<FileX className="h-5 w-5 text-red-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Contratos por Mes</h2>
            <Button variant="ghost" size="sm" className="text-sm">
              Ver más <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="h-80">
            <BarChart 
              data={reportData?.barData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Estado de Contratos</h2>
            <Button variant="ghost" size="sm" className="text-sm">
              Ver más <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="h-80">
            <PieChart 
              data={reportData?.pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tendencias Mensuales</h2>
          <Button variant="ghost" size="sm" className="text-sm">
            Exportar <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="h-96">
          <LineChart 
            data={reportData?.lineData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
