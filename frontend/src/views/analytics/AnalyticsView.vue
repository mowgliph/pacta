<template>
  <div class="analytics-view">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Cargando datos de análisis...</span>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error al cargar los datos</h3>
        <p>{{ error }}</p>
        <button @click="fetchAnalyticsData" class="btn-retry">
          <i class="fas fa-sync-alt"></i> Reintentar
        </button>
      </div>
    </div>

    <template v-else>
      <header class="analytics-header">
        <div class="header-content">
          <h1>Análisis y Estadísticas de Contratos</h1>
          <p>Datos detallados y métricas para el rendimiento, cumplimiento y riesgo de sus contratos.</p>
        </div>
        <div class="header-actions">
          <button class="btn-export" @click="generateReport('pdf')">
            <i class="fas fa-file-pdf"></i> Exportar PDF
          </button>
          <button class="btn-export" @click="generateReport('excel')">
            <i class="fas fa-file-excel"></i> Exportar Excel
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

      <section class="metrics-overview">
        <h2>Métricas Principales</h2>
        <div class="metrics-grid">
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

      <section class="charts-section">
        <div class="charts-container">
          <div class="chart-column">
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
          <div class="chart-column">
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

      <section class="stats-section">
        <div class="stats-container">
          <div class="stats-column">
            <h3>Estadísticas de Eficiencia</h3>
            <div class="stats-grid">
              <div 
                v-for="(stat, index) in analyticsData.efficiency" 
                :key="index"
                class="stat-card"
              >
                <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend" :class="stat.trend">
              <i :class="stat.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ stat.percentage }}%
            </div>
          </div>
        </div>
      </div>

          <div class="stats-column">
            <h3>Estadísticas de Cumplimiento</h3>
            <div class="stats-grid">
              <div 
                v-for="(stat, index) in analyticsData.compliance" 
                :key="index"
                class="stat-card"
              >
                <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend" :class="stat.trend">
              <i :class="stat.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ stat.percentage }}%
            </div>
          </div>
        </div>
      </div>
    </div>
      </section>

      <section class="predictions-section">
        <h2>Predicciones y Tendencias</h2>
        <div class="predictions-grid">
          <div 
            v-for="(prediction, index) in analyticsData.predictions" 
            :key="index"
            class="prediction-card"
          >
            <h3>{{ prediction.title }}</h3>
            <div class="prediction-value">{{ prediction.value }}</div>
            <div class="prediction-change" :class="{ 'positive': prediction.isPositive, 'negative': !prediction.isPositive }">
              <i :class="prediction.isPositive ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ prediction.change }}% {{ prediction.isPositive ? 'aumento' : 'reducción' }}
            </div>
          </div>
        </div>
      </section>

      <section class="contracts-section">
        <h2>Contratos en Riesgo</h2>
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

<style lang="scss" scoped>
@use './AnalyticsView.scss';
</style> 