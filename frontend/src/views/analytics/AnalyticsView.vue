<template>
  <div class="p-5 bg-background dark:bg-gray-900 relative">
    <div v-if="loading" class="absolute top-0 left-0 w-full h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
      <div class="w-12 h-12 border-3 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin mb-4"></div>
      <span class="text-base font-medium text-text-primary dark:text-white">Cargando datos de análisis...</span>
    </div>

    <div v-else-if="error" class="flex items-center justify-center py-16">
      <div class="text-center max-w-md p-8 bg-surface dark:bg-gray-800 rounded-lg shadow-md">
        <i class="fas fa-exclamation-circle text-4xl text-error dark:text-red-400 mb-4"></i>
        <h3 class="text-lg mb-1 text-text-primary dark:text-white">Error al cargar los datos</h3>
        <p class="text-text-secondary dark:text-gray-400 mb-6">{{ error }}</p>
        <button @click="fetchAnalyticsData" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white border-none rounded-md cursor-pointer text-base transition-all duration-200 hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-sm">
          <i class="fas fa-sync-alt"></i> Reintentar
        </button>
      </div>
    </div>

    <template v-else>
      <header class="flex justify-between items-start mb-6 pb-5 border-b border-border dark:border-gray-700 md:flex-row flex-col gap-4">
        <div class="max-w-3xl">
          <h1 class="text-2xl md:text-3xl font-bold m-0 mb-1 text-text-primary dark:text-white tracking-tight">Análisis y Estadísticas de Contratos</h1>
          <p class="text-text-secondary dark:text-gray-400 text-base m-0 leading-relaxed">Datos detallados y métricas para el rendimiento, cumplimiento y riesgo de sus contratos.</p>
        </div>
        <div class="flex gap-2">
          <button class="inline-flex items-center gap-2 px-3 py-2 bg-surface dark:bg-gray-800 border border-border dark:border-gray-700 rounded-md text-sm cursor-pointer transition-all duration-200 text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-primary hover:-translate-y-0.5 hover:shadow-sm" @click="generateReport('pdf')">
            <i class="fas fa-file-pdf text-primary"></i> Exportar PDF
          </button>
          <button class="inline-flex items-center gap-2 px-3 py-2 bg-surface dark:bg-gray-800 border border-border dark:border-gray-700 rounded-md text-sm cursor-pointer transition-all duration-200 text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-primary hover:-translate-y-0.5 hover:shadow-sm" @click="generateReport('excel')">
            <i class="fas fa-file-excel text-primary"></i> Exportar Excel
          </button>
        </div>
      </header>

      <AnalyticsFilters 
        :initialDatePreset="dateRange.preset"
        :initialStartDate="dateRange.startDate"
        :initialEndDate="dateRange.endDate"
        :categories="categoriesOptions"
        :statuses="statusOptions"
        :riskLevels="riskLevelOptions"
        @filter-change="handleFilterChange"
      />

      <section class="mb-10">
        <h2 class="text-lg font-semibold mb-5 text-text-primary dark:text-white tracking-tight flex items-center before:content-[''] before:inline-block before:w-1 before:h-5 before:bg-primary before:mr-2 before:rounded-sm">Métricas Principales</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard 
            v-for="(metric, index) in analyticsData.metrics" 
            :key="index"
            :title="metric.title"
            :value="metric.value"
            :icon="metric.icon"
            :change="metric.change"
            :colorClass="metric.colorClass"
          />
        </div>
      </section>

      <section class="mb-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 bg-surface dark:bg-gray-800 rounded-lg p-5 shadow-sm">
          <div>
            <AnalyticsChart
              title="Tendencia de Contratos"
              :chartData="analyticsData.trends"
              type="line"
              :height="350"
              :showControls="true"
              :periodSelector="true"
              :showFooter="true"
              @period-change="handlePeriodChange"
            />
          </div>
          <div>
            <AnalyticsChart
              title="Distribución de Contratos"
              :chartData="donutChartData"
              type="doughnut"
              :height="350"
              :showFooter="true"
              footnote="Distribución por categoría"
            />
          </div>
        </div>
      </section>

      <section class="mb-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="bg-surface dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <h3 class="text-base mb-4 text-text-primary dark:text-white pb-2 border-b border-border dark:border-gray-700">Estadísticas de Eficiencia</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="(stat, index) in analyticsData.efficiency" 
                :key="index"
                class="bg-background dark:bg-gray-750 rounded-lg p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-sm"
              >
                <div class="text-xl font-bold mb-0.5 text-text-primary dark:text-white">{{ stat.value }}</div>
                <div class="text-sm text-text-secondary dark:text-gray-400 mb-1">{{ stat.label }}</div>
                <div class="flex items-center gap-1 text-sm font-semibold" :class="stat.trend === 'up' ? 'text-success' : 'text-error'">
                  <i :class="stat.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ stat.percentage }}%
                </div>
              </div>
            </div>
          </div>

          <div class="bg-surface dark:bg-gray-800 rounded-lg p-5 shadow-sm">
            <h3 class="text-base mb-4 text-text-primary dark:text-white pb-2 border-b border-border dark:border-gray-700">Estadísticas de Cumplimiento</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="(stat, index) in analyticsData.compliance" 
                :key="index"
                class="bg-background dark:bg-gray-750 rounded-lg p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-sm"
              >
                <div class="text-xl font-bold mb-0.5 text-text-primary dark:text-white">{{ stat.value }}</div>
                <div class="text-sm text-text-secondary dark:text-gray-400 mb-1">{{ stat.label }}</div>
                <div class="flex items-center gap-1 text-sm font-semibold" :class="stat.trend === 'up' ? 'text-success' : 'text-error'">
                  <i :class="stat.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ stat.percentage }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-lg font-semibold mb-5 text-text-primary dark:text-white tracking-tight flex items-center before:content-[''] before:inline-block before:w-1 before:h-5 before:bg-primary before:mr-2 before:rounded-sm">Predicciones y Tendencias</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div 
            v-for="(prediction, index) in analyticsData.predictions" 
            :key="index"
            class="bg-surface dark:bg-gray-800 rounded-lg p-5 shadow-sm border-t-4 border-primary transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <h3 class="text-base m-0 mb-1 text-text-secondary dark:text-gray-400">{{ prediction.title }}</h3>
            <div class="text-3xl font-bold mb-1 text-text-primary dark:text-white">{{ prediction.value }}</div>
            <div class="flex items-center gap-1 text-sm" :class="{ 'text-success': prediction.isPositive, 'text-error': !prediction.isPositive }">
              <i :class="prediction.isPositive ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ prediction.change }}% {{ prediction.isPositive ? 'aumento' : 'reducción' }}
            </div>
          </div>
        </div>
      </section>

      <section class="mb-10 bg-surface dark:bg-gray-800 rounded-lg p-5 shadow-sm">
        <h2 class="text-lg font-semibold mb-4 text-text-primary dark:text-white tracking-tight flex items-center before:content-[''] before:inline-block before:w-1 before:h-5 before:bg-primary before:mr-2 before:rounded-sm">Contratos en Riesgo</h2>
        <AnalyticsTable
          :columns="riskContractsColumns"
          :data="riskContractsData"
          :loading="tableLoading"
          :searchable="true"
          :exportable="true"
          @export="exportTableData"
          @row-click="viewContractDetails"
          :rowClickable="true"
        />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AnalyticsFilters from '@/components/modules/analytics/AnalyticsFilters.vue';
import MetricCard from '@/components/modules/analytics/MetricCard.vue';
import AnalyticsChart from '@/components/modules/analytics/AnalyticsChart.vue';
import AnalyticsTable from '@/components/modules/analytics/AnalyticsTable.vue';
import { analyticsService } from '@/services/analytics.service';
import type { AnalyticsResponse } from '@/services/analytics.service';

// Router
const router = useRouter();

// State
const loading = ref(true);
const error = ref<string | null>(null);
const tableLoading = ref(false);
const analyticsData = ref<AnalyticsResponse>({
  metrics: [],
  efficiency: [],
  compliance: [],
  predictions: [],
  distribution: [],
  trends: {
    labels: [],
    datasets: []
  }
});

const dateRange = ref({
  preset: '30d',
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: new Date()
});

const riskContractsData = ref<any[]>([]);

// Options for filters
const categoriesOptions = [
  { label: 'Servicios', value: 'services' },
  { label: 'Proveedores', value: 'suppliers' },
  { label: 'Clientes', value: 'clients' },
  { label: 'Empleados', value: 'employees' },
  { label: 'Tecnología', value: 'technology' },
  { label: 'Otros', value: 'others' }
];

const statusOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Expirado', value: 'expired' },
  { label: 'Cancelado', value: 'cancelled' }
];

const riskLevelOptions = [
  { label: 'Alto', value: 'high' },
  { label: 'Medio', value: 'medium' },
  { label: 'Bajo', value: 'low' }
];

// Table columns configuration
const riskContractsColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Nombre del Contrato', sortable: true },
  { key: 'category', label: 'Categoría', sortable: true },
  { 
    key: 'riskLevel', 
    label: 'Nivel de Riesgo', 
    sortable: true,
    format: (value: string) => {
      const colors: Record<string, string> = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981'
      };
      const labels: Record<string, string> = {
        high: 'Alto',
        medium: 'Medio',
        low: 'Bajo'
      };
      return `<span style="color: ${colors[value]}; font-weight: 600;">${labels[value] || value}</span>`;
    }
  },
  { key: 'endDate', label: 'Fecha de Expiración', sortable: true },
  { 
    key: 'status', 
    label: 'Estado', 
    sortable: true,
    format: (value: string) => {
      const colors: Record<string, string> = {
        active: '#10b981',
        pending: '#f59e0b',
        expired: '#ef4444',
        cancelled: '#6b7280'
      };
      const labels: Record<string, string> = {
        active: 'Activo',
        pending: 'Pendiente',
        expired: 'Expirado',
        cancelled: 'Cancelado'
      };
      return `<span style="color: ${colors[value]}; font-weight: 600;">${labels[value] || value}</span>`;
    }
  },
];

// Computed
const donutChartData = computed(() => {
  return {
    labels: analyticsData.value.distribution.map(item => item.category),
    datasets: [{
      label: 'Distribución de Contratos',
      data: analyticsData.value.distribution.map(item => item.count),
      backgroundColor: analyticsData.value.distribution.map(item => item.color)
    }]
  };
});

// Methods
async function fetchAnalyticsData() {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await analyticsService.getAnalyticsData(
      Math.round((dateRange.value.endDate.getTime() - dateRange.value.startDate.getTime()) / (24 * 60 * 60 * 1000)),
      dateRange.value.preset
    );
    
    analyticsData.value = data;
    
    // Simulate fetching risk contracts data
    await fetchRiskContractsData();
  } catch (err) {
    console.error('Error fetching analytics data:', err);
    error.value = err instanceof Error ? err.message : 'Error desconocido al cargar los datos';
  } finally {
    loading.value = false;
  }
}

async function fetchRiskContractsData() {
  tableLoading.value = true;
  
  try {
    // Conectar con el nuevo endpoint para obtener contratos en riesgo
    const response = await analyticsService.getRiskContracts();
    riskContractsData.value = response.data;
  } catch (err) {
    console.error('Error fetching risk contracts data:', err);
    // Si hay un error, usar datos de respaldo
    riskContractsData.value = [
      {
        id: 'CNT-001',
        name: 'Servicio de Limpieza Anual',
        category: 'Servicios',
        riskLevel: 'high',
        endDate: '2023-06-30',
        status: 'active'
      },
      {
        id: 'CNT-002',
        name: 'Licencias Software ERP',
        category: 'Tecnología',
        riskLevel: 'medium',
        endDate: '2023-07-15',
        status: 'active'
      },
      {
        id: 'CNT-003',
        name: 'Arrendamiento Oficinas',
        category: 'Inmuebles',
        riskLevel: 'low',
        endDate: '2024-01-01',
        status: 'active'
      },
      {
        id: 'CNT-004',
        name: 'Suministro Materiales Oficina',
        category: 'Proveedores',
        riskLevel: 'medium',
        endDate: '2023-08-22',
        status: 'active'
      },
      {
        id: 'CNT-005',
        name: 'Servicio Internet Corporativo',
        category: 'Tecnología',
        riskLevel: 'high',
        endDate: '2023-05-10',
        status: 'active'
      }
    ];
  } finally {
    tableLoading.value = false;
  }
}

function handleFilterChange(filters: any) {
  dateRange.value = filters.dateRange;
  fetchAnalyticsData();
}

function handlePeriodChange(period: string) {
  dateRange.value.preset = period;
  fetchAnalyticsData();
}

function generateReport(format: 'pdf' | 'excel' | 'csv') {
  analyticsService.generateReport(format, {
    startDate: dateRange.value.startDate,
    endDate: dateRange.value.endDate
  })
    .then(url => {
      // In a real app, this might download the file or open it in a new window
      console.log(`Report generated, download URL: ${url}`);
      window.open(url, '_blank');
    })
    .catch(err => {
      console.error('Error generating report:', err);
      // Show error toast or notification
    });
}

function exportTableData() {
  // In a real app, this would export the table data to CSV/Excel
  const blob = new Blob([JSON.stringify(riskContractsData.value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contratos-en-riesgo.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function viewContractDetails(contract: any) {
  router.push(`/contracts/${contract.id}`);
}

// Lifecycle hooks
onMounted(() => {
  fetchAnalyticsData();
});
</script>