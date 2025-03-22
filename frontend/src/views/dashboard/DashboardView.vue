<template>
  <div class="dashboard-view">
    <!-- Muestra el SkeletonLoader mientras se cargan los datos -->
    <SkeletonLoader v-if="loading" />

    <!-- Contenido principal del dashboard cuando los datos están cargados -->
    <div v-else class="dashboard-content">
      <div class="dashboard-header">
        <div class="header-main">
          <h1>Dashboard</h1>
          <p class="dashboard-description">Vista general del rendimiento y métricas de contratos</p>
        </div>
        <div class="header-actions">
          <router-link to="/analytics" class="analytics-link">
            <i class="fas fa-chart-bar"></i>
            Ver análisis detallado
          </router-link>
          <button class="refresh-btn" @click="fetchData">
            <i class="fas fa-sync-alt"></i>
            Actualizar datos
          </button>
        </div>
      </div>

      <!-- Mensaje de error si hay problemas con la carga de datos -->
      <div v-if="error" class="error-message">
        <i class="material-icons">error_outline</i>
        <p>{{ error }}</p>
        <button @click="fetchData">Reintentar</button>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div v-if="!error" class="stats-cards" ref="statsRef">
        <div class="stats-card" v-for="(stat, index) in stats" :key="index">
          <div class="stats-icon" :class="stat.color">
            <i class="material-icons">{{ stat.icon }}</i>
          </div>
          <div class="stats-content">
            <h3 class="stats-value">{{ stat.value }}</h3>
            <p class="stats-label">{{ stat.label }}</p>
            <div class="stats-trend" :class="stat.trend > 0 ? 'positive' : 'negative'">
              <i class="material-icons">{{ stat.trend > 0 ? 'trending_up' : 'trending_down' }}</i>
              <span>{{ Math.abs(stat.trend) }}% vs mes anterior</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos y tablas -->
      <div v-if="!error" class="dashboard-charts">
        <!-- Gráfico de tendencias -->
        <div class="chart-card" ref="trendsRef">
          <div class="card-header">
            <h2>Tendencias de Contratos</h2>
            <div class="card-actions">
              <button><i class="material-icons">more_vert</i></button>
            </div>
          </div>
          <div class="card-content">
            <div class="metrics-summary">
              <div class="metric-item" v-for="(metric, index) in trendMetrics" :key="index">
                <div class="metric-icon" :class="metric.color">
                  <i class="material-icons">{{ metric.icon }}</i>
                </div>
                <div class="metric-data">
                  <h4 class="metric-value">{{ metric.value }}</h4>
                  <p class="metric-label">{{ metric.label }}</p>
                </div>
              </div>
            </div>
            
            <div class="chart-container">
              <div class="chart-bars">
                <div class="chart-bar" 
                  v-for="(item, index) in chartData" 
                  :key="index"
                  :data-height="item.value"
                  :style="{ height: '0%' }">
                  <div class="bar-tooltip">{{ item.value }}</div>
                </div>
              </div>
              <div class="chart-labels">
                <span v-for="(item, index) in chartData" :key="index">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Categorías de contratos -->
        <div class="chart-card" ref="categoriesRef">
          <div class="card-header">
            <h2>Categorías de Contratos</h2>
            <div class="card-actions">
              <button><i class="material-icons">more_vert</i></button>
            </div>
          </div>
          <div class="card-content">
            <div class="categories-list">
              <div class="category-item" 
                v-for="(category, index) in categories" 
                :key="index">
                <div class="category-header">
                  <h4>{{ category.name }}</h4>
                  <span class="category-count">{{ category.count }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-track"></div>
                  <div class="progress-fill" 
                    :data-percentage="category.percentage" 
                    :style="{ width: '0%', backgroundColor: category.color }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones Recientes -->
      <div v-if="!error && recentActions.length > 0" class="recent-actions" ref="actionsRef">
        <h2>Acciones Recientes</h2>
        <div class="actions-list">
          <div class="action-item" v-for="(action, index) in recentActions" :key="index">
            <div class="action-icon" :class="action.type">
              <i class="material-icons">{{ getActionIcon(action.type) }}</i>
            </div>
            <div class="action-content">
              <h4>{{ action.title }}</h4>
              <p>{{ action.description }}</p>
              <span class="action-time">{{ action.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useColors } from '../../types/colors'
import { dashboardService } from '@/services/dashboard.service'
import type { DashboardResponse } from '@/services/dashboard.service'
import { useAuthStore } from '@/stores/auth'
import CircularChart from '@/components/modules/dashboard/CircularChart.vue'
import SparkLine from '@/components/modules/dashboard/SparkLine.vue'
import { useMotion } from '@vueuse/motion'
import type { MotionVariants } from '@vueuse/motion'
import SkeletonLoader from '@/components/modules/dashboard/SkeletonLoader.vue'

const colors = useColors()
const authStore = useAuthStore()
const showDateMenu = ref(false)
const selectedRange = ref({
  label: 'Últimos 30 días',
  value: '30',
  days: 30
})

const dateRanges = [
  { label: 'Últimos 7 días', value: '7', days: 7 },
  { label: 'Últimos 30 días', value: '30', days: 30 },
  { label: 'Últimos 60 días', value: '60', days: 60 },
  { label: 'Últimos 90 días', value: '90', days: 90 },
  { label: 'Últimos 6 meses', value: '180', days: 180 },
  { label: 'Último año', value: '365', days: 365 }
]

// Datos reactivos para el dashboard
const contractStats = ref<DashboardResponse['contractStats'] | null>(null);
const contractTrends = ref<DashboardResponse['contractTrends'] | null>(null);
const contractCategories = ref<DashboardResponse['contractCategories']>([]);
const loading = ref<boolean>(true);
const error = ref<string>('');

// Colores para las barras del gráfico
const chartBarColors = [
  colors.primary + 'CC',
  colors.info + 'CC',
  colors.success + 'CC',
  colors.primary + 'CC',
  colors.info + 'CC',
  colors.success + 'CC',
  colors.primary + 'CC'
]

// Leyenda de categorías
const categoryColors = computed(() => {
  return [
    { color: colors.primary, darkColor: colors.primaryDark },
    { color: colors.secondary, darkColor: colors.secondaryDark },
    { color: colors.success, darkColor: colors.success },
    { color: colors.warning, darkColor: colors.warning },
    { color: colors.info, darkColor: colors.info },
    { color: colors.accent, darkColor: colors.accentDark },
  ]
})

// Función para obtener el color de categoría por su índice
const getCategoryColor = (category: string | number) => {
  const colorArray = categoryColors.value;
  let index = 0;
  
  if (typeof category === 'number') {
    index = category;
  } else {
    // Usar el nombre de la categoría para generar un índice consistente
    const hash = category.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    index = Math.abs(hash) % colorArray.length;
  }
  
  return colorArray[index % colorArray.length].color;
}

const toggleDateMenu = () => {
  showDateMenu.value = !showDateMenu.value
}

const selectDateRange = async (range: typeof dateRanges[0]) => {
  selectedRange.value = range
  showDateMenu.value = false
  
  // Llamar al servicio para actualizar los datos
  loading.value = true;
  try {
    await fetchDashboardData(range.days);
  } catch (err) {
    error.value = 'Error al cargar los datos del dashboard';
  } finally {
    loading.value = false;
  }
}

const fetchDashboardData = async (days: number) => {
  try {
    const data = await dashboardService.getDashboardData(days);
    
    // Actualizar los datos con la respuesta del servicio
    contractStats.value = data.contractStats;
    contractTrends.value = data.contractTrends;
    contractCategories.value = data.contractCategories;
    
    error.value = '';
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    error.value = 'Error al cargar los datos del dashboard';
    throw err;
  }
}

const retryFetch = () => {
  loading.value = true;
  fetchDashboardData(selectedRange.value.days)
    .finally(() => {
      loading.value = false;
    });
}

// Cerrar el menú cuando se hace clic fuera
const closeDateMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.date-selector')) {
    showDateMenu.value = false
  }
}

// Generar datos de ejemplo para nuevos componentes visuales
const generateDummyContractTrends = () => {
  // Datos mensuales para los últimos 12 meses (simulado)
  const monthlyData = [];
  for (let i = 0; i < 12; i++) {
    // Simulando una tendencia general creciente con variaciones
    const baseValue = 10 + i * 1.5;
    const randomFactor = Math.random() * 5 - 2.5; // Fluctuación aleatoria entre -2.5 y +2.5
    monthlyData.push(Math.max(1, Math.round(baseValue + randomFactor)));
  }
  
  return monthlyData;
}

// Datos de contratos mensuales (simulados o reales)
const contractMonthlyData = computed(() => {
  // Si no hay datos reales, generar datos de ejemplo
  if (!contractStats.value || !contractStats.value.total) {
    return generateDummyContractTrends();
  }
  
  // En un sistema real, estos datos vendrían del backend
  // Por ahora simulamos datos basados en el total existente
  return generateDummyContractTrends();
});

// Calcular tendencia relativa (cambio porcentual)
const calculateTrend = (data: number[]) => {
  if (data.length < 2) return 0;
  
  const lastMonth = data[data.length - 1];
  const prevMonth = data[data.length - 2];
  
  if (prevMonth === 0) return 100; // Para evitar división por cero
  
  return Math.round(((lastMonth - prevMonth) / prevMonth) * 100);
}

// Tendencia de contratos (cambio porcentual desde el mes anterior)
const contractTrend = computed(() => {
  return calculateTrend(contractMonthlyData.value);
});

// Porcentaje de contratos activos
const activeContractData = computed(() => {
  if (!contractStats.value) return [50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78];
  
  const percentages = [];
  const total = contractStats.value.total;
  
  // Simular tendencia del porcentaje activo a lo largo del tiempo
  for (let i = 0; i < 12; i++) {
    const activePercent = Math.round(((contractStats.value.active / total) * 100) - 10 + i * 2);
    percentages.push(Math.min(100, Math.max(0, activePercent)));
  }
  
  return percentages;
});

// Tendencia de contratos activos
const activeContractTrend = computed(() => {
  return calculateTrend(activeContractData.value);
});

// Configuración para animaciones con vueuse/motion
const statsCardVariants = {
  initial: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const trendsCardVariants = {
  initial: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
}

const categoriesCardVariants = {
  initial: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
}

const actionsVariants = {
  initial: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const categoryItemVariants = {
  initial: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
}

// Refs para las animaciones
const statsRef = ref(null)
const trendsRef = ref(null) 
const categoriesRef = ref(null)
const actionsRef = ref(null)

// Aplicar motion
const statsMotion = useMotion(statsRef, statsCardVariants)
const trendsMotion = useMotion(trendsRef, trendsCardVariants)
const categoriesMotion = useMotion(categoriesRef, categoriesCardVariants)
const actionsMotion = useMotion(actionsRef, actionsVariants)

onMounted(async () => {
  document.addEventListener('click', closeDateMenu)
  
  // Cargar datos iniciales
  loading.value = true;
  try {
    await fetchDashboardData(selectedRange.value.days);
    
    // Activar animaciones después de cargar los datos
    setTimeout(() => {
      statsMotion.apply('visible');
      trendsMotion.apply('visible');
      categoriesMotion.apply('visible');
      actionsMotion.apply('visible');
      
      // Animar las barras de progreso
      const progressBars = document.querySelectorAll('.progress-fill');
      progressBars.forEach((bar: Element) => {
        const percentage = bar.getAttribute('data-percentage');
        if (percentage && bar instanceof HTMLElement) {
          bar.style.width = `${percentage}%`;
        }
      });
      
      // Animar barras del gráfico
      const chartBars = document.querySelectorAll('.chart-bar');
      chartBars.forEach((bar: Element) => {
        const height = bar.getAttribute('data-height');
        if (height && bar instanceof HTMLElement) {
          bar.style.setProperty('--target-height', `${height}px`);
        }
      });
    }, 300);
  } catch (err) {
    error.value = 'Error al cargar los datos iniciales del dashboard';
  } finally {
    loading.value = false;
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDateMenu)
})

// Datos del dashboard
const stats = ref([
  {
    icon: 'description',
    value: '128',
    label: 'Total de Contratos',
    trend: 12,
    color: 'primary'
  },
  {
    icon: 'check_circle',
    value: '85',
    label: 'Contratos Activos',
    trend: 8,
    color: 'success'
  },
  {
    icon: 'error',
    value: '15',
    label: 'Contratos Vencidos',
    trend: -5,
    color: 'danger'
  },
  {
    icon: 'schedule',
    value: '12',
    label: 'Próximos a Vencer',
    trend: 3,
    color: 'warning'
  }
]);

const trendMetrics = ref([
  {
    icon: 'today',
    value: '5',
    label: 'Nuevos hoy',
    color: 'success'
  },
  {
    icon: 'date_range',
    value: '24',
    label: 'Nuevos esta semana',
    color: 'primary'
  },
  {
    icon: 'search',
    value: '8',
    label: 'Pendientes de revisión',
    color: 'warning'
  },
  {
    icon: 'sync',
    value: '10',
    label: 'Pendientes de renovación',
    color: 'info'
  }
]);

const chartData = ref([
  { label: 'Lun', value: 25 },
  { label: 'Mar', value: 40 },
  { label: 'Mié', value: 30 },
  { label: 'Jue', value: 50 },
  { label: 'Vie', value: 70 },
  { label: 'Sáb', value: 45 },
  { label: 'Dom', value: 60 }
]);

const categories = ref([
  { name: 'Servicios', count: 42, percentage: 32, color: '#4a90e2' },
  { name: 'Tecnología', count: 28, percentage: 22, color: '#50c878' },
  { name: 'Proveedores', count: 35, percentage: 27, color: '#f39c12' },
  { name: 'Recursos Humanos', count: 23, percentage: 19, color: '#9b59b6' }
]);

const recentActions = ref([
  {
    type: 'create',
    title: 'Contrato Creado',
    description: 'Se ha creado un nuevo contrato con Proveedor XYZ',
    time: 'Hace 2 horas'
  },
  {
    type: 'update',
    title: 'Contrato Actualizado',
    description: 'Se actualizaron los términos del contrato #1242',
    time: 'Hace 5 horas'
  },
  {
    type: 'alert',
    title: 'Alerta de Vencimiento',
    description: 'El contrato #5678 vence en 7 días',
    time: 'Hace 1 día'
  }
]);

// Función para obtener el icono según el tipo de acción
function getActionIcon(type: string): string {
  switch (type) {
    case 'create':
      return 'add_circle';
    case 'update':
      return 'edit';
    case 'delete':
      return 'delete';
    case 'alert':
      return 'warning';
    case 'complete':
      return 'check_circle';
    default:
      return 'info';
  }
}

// Función para cargar datos del dashboard
const fetchData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Llamar al servicio real para obtener datos del backend
    const response = await dashboardService.getDashboardData(selectedRange.value.days);
    
    // Actualizar los datos del dashboard con la respuesta del backend
    if (response) {
      // Actualizar estadísticas con datos reales del backend
      if (response.contractStats) {
        stats.value = [
          {
            icon: 'description',
            value: response.contractStats.total.toString(),
            label: 'Total de Contratos',
            trend: response.contractStats.totalTrend || 0,
            color: 'primary'
          },
          {
            icon: 'check_circle',
            value: response.contractStats.active.toString(),
            label: 'Contratos Activos',
            trend: response.contractStats.activeTrend || 0,
            color: 'success'
          },
          {
            icon: 'error',
            value: response.contractStats.expired.toString(),
            label: 'Contratos Vencidos',
            trend: response.contractStats.expiredTrend || 0,
            color: 'danger'
          },
          {
            icon: 'schedule',
            value: response.contractStats.expiringSoon.toString(),
            label: 'Próximos a Vencer',
            trend: response.contractStats.expiringSoonTrend || 0,
            color: 'warning'
          }
        ];
      }
      
      // Actualizar métricas de tendencia con datos reales
      if (response.contractTrends) {
        trendMetrics.value = [
          {
            icon: 'today',
            value: response.contractTrends.newToday.toString(),
            label: 'Nuevos hoy',
            color: 'success'
          },
          {
            icon: 'date_range',
            value: response.contractTrends.newThisWeek.toString(),
            label: 'Nuevos esta semana',
            color: 'primary'
          },
          {
            icon: 'search',
            value: response.contractTrends.reviewPending.toString(),
            label: 'Pendientes de revisión',
            color: 'warning'
          },
          {
            icon: 'sync',
            value: response.contractTrends.renewalsPending.toString(),
            label: 'Pendientes de renovación',
            color: 'info'
          }
        ];
      }
      
      // Actualizar datos de categorías si existen
      if (response.contractCategories && response.contractCategories.length > 0) {
        categories.value = response.contractCategories.map((category, index) => ({
          name: category.name,
          count: category.count,
          percentage: category.percentage,
          color: getCategoryColor(category.name) // Usar función existente para obtener colores
        }));
      }
      
      // Actualizar acciones recientes si existe la propiedad
      if (response.recentActions && response.recentActions.length > 0) {
        recentActions.value = response.recentActions.map(action => ({
          type: action.type,
          title: action.title,
          description: action.description,
          time: action.time
        }));
      }
    }
    
    loading.value = false;
    
    // Activar animaciones después de cargar los datos
    setTimeout(() => {
      statsMotion.apply('visible');
      trendsMotion.apply('visible');
      categoriesMotion.apply('visible');
      actionsMotion.apply('visible');
      
      // Animar barras de progreso
      const progressBars = document.querySelectorAll('.progress-fill');
      progressBars.forEach((bar: Element) => {
        const percentage = (bar as HTMLElement).dataset.percentage;
        if (percentage) {
          (bar as HTMLElement).style.width = `${percentage}%`;
        }
      });
      
      // Animar barras del gráfico
      const chartBars = document.querySelectorAll('.chart-bar');
      chartBars.forEach((bar: Element) => {
        const height = (bar as HTMLElement).dataset.height;
        if (height) {
          (bar as HTMLElement).style.height = `${height}%`;
        }
      });
    }, 300);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    loading.value = false;
    error.value = 'Error al cargar los datos del dashboard. Por favor, inténtelo de nuevo.';
  }
}
</script>

<style lang="scss" scoped>
@use './dashboard.scss';

.chart-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 1rem 0;
}

.categories-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.circular-charts {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .chart-row {
    flex-direction: column;
  }
  
  .circular-charts {
    justify-content: center;
    gap: 1rem;
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  .header-main {
    flex: 1;
    min-width: 300px;
  }
  
  .header-actions {
    display: flex;
    gap: 1rem;
    
    .analytics-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      background-color: var(--color-surface-variant);
      color: var(--color-primary);
      text-decoration: none;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: var(--color-surface-hover);
      }
      
      i {
        font-size: 18px;
      }
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .analytics-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: var(--color-surface-variant);
    color: var(--color-text);
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: var(--color-surface-hover);
    }
    
    i {
      color: var(--color-primary);
    }
  }
  
  .btn-refresh {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: var(--color-surface-variant);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: var(--color-surface-hover);
    }
  }
}
</style>