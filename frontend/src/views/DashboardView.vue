<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>Panel de Control PACTA</h1>
      <div class="date-range">
        <div class="date-selector">
          <button class="btn-outline" @click="toggleDateMenu">
            <i class="fas fa-calendar"></i>
            {{ selectedRange.label }}
          </button>
          <div class="date-menu" v-if="showDateMenu">
            <div 
              v-for="range in dateRanges" 
              :key="range.value"
              class="date-option"
              :class="{ 'active': selectedRange.value === range.value }"
              @click="selectDateRange(range)"
            >
              {{ range.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen General de Contratos -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in contractStats" :key="stat.title">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20' }">
          <i :class="stat.icon" :style="{ color: stat.color }"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stat.title }}</h3>
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-description">{{ stat.description }}</p>
        </div>
      </div>
    </div>

    <!-- Estado de Licencia -->
    <div class="license-card">
      <div class="card-header">
        <h3>Estado de la Licencia PACTA</h3>
        <div class="license-status" :class="{ 'warning': licenseDays < 30 }">
          <i class="fas fa-shield-alt"></i>
          {{ licenseStatus }}
        </div>
      </div>
      <div class="license-info">
        <div class="info-item">
          <span class="label">Vencimiento:</span>
          <span class="value">{{ licenseExpiry }}</span>
        </div>
        <div class="info-item">
          <span class="label">Días restantes:</span>
          <span class="value">{{ licenseDays }} días</span>
        </div>
        <div class="info-item">
          <span class="label">Empresas registradas:</span>
          <span class="value">{{ registeredCompanies }}</span>
        </div>
        <div class="info-item">
          <span class="label">Usuarios activos:</span>
          <span class="value">{{ activeUsers }}</span>
        </div>
      </div>
    </div>

    <!-- Tendencias y Reportes -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="card-header">
          <h3>Tendencias de Contratos</h3>
          <div class="card-actions">
            <button class="btn-icon">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        <div class="trends-stats">
          <div class="trend-item" v-for="trend in contractTrends" :key="trend.label">
            <div class="trend-icon" :style="{ backgroundColor: trend.color + '20' }">
              <i :class="trend.icon" :style="{ color: trend.color }"></i>
            </div>
            <div class="trend-content">
              <div class="trend-label">{{ trend.label }}</div>
              <div class="trend-value">{{ trend.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <h3>Contratos por Categoría</h3>
          <div class="card-actions">
            <button class="btn-icon">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        <div class="category-stats">
          <div class="category-item" v-for="category in contractCategories" :key="category.name">
            <div class="category-info">
              <span class="category-name">{{ category.name }}</span>
              <div class="progress-bar">
                <div class="progress" :style="{ width: category.percentage + '%' }"></div>
              </div>
            </div>
            <span class="category-value">{{ category.count }} contratos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actividades Recientes -->
    <div class="activity-card">
      <div class="card-header">
        <h3>Actividades Recientes</h3>
        <button class="btn-text">Ver Todo</button>
      </div>
      <div class="activity-list">
        <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
          <div class="activity-icon" :style="{ backgroundColor: activity.color + '20' }">
            <i :class="activity.icon" :style="{ color: activity.color }"></i>
          </div>
          <div class="activity-content">
            <p class="activity-title">{{ activity.title }}</p>
            <p class="activity-time">{{ activity.time }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useColors } from '../types/colors'

const colors = useColors()
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

const toggleDateMenu = () => {
  showDateMenu.value = !showDateMenu.value
}

const selectDateRange = async (range: typeof dateRanges[0]) => {
  selectedRange.value = range
  showDateMenu.value = false
  
  // Aquí se llamaría a la función para actualizar los datos
  await fetchDashboardData(range.days)
}

const fetchDashboardData = async (days: number) => {
  try {
    // Aquí se implementaría la llamada al backend
    // const response = await fetch(`/api/dashboard/stats?days=${days}`)
    // const data = await response.json()
    
    // Por ahora usamos datos de ejemplo
    // Actualizar los datos con la respuesta del backend
    contractStats.value = [
      {
        title: 'Total de Contratos',
        value: '245',
        description: 'Cantidad total de contratos registrados en el sistema',
        icon: 'fas fa-file-contract',
        color: colors.primary
      },
      // ... resto de las estadísticas
    ]
    
    // Actualizar otras secciones con los nuevos datos
    // contractTrends.value = data.trends
    // contractCategories.value = data.categories
    // recentActivities.value = data.activities
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Aquí se podría implementar un manejo de errores más robusto
  }
}

// Cerrar el menú cuando se hace clic fuera
const closeDateMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.date-selector')) {
    showDateMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDateMenu)
  // Cargar datos iniciales
  fetchDashboardData(selectedRange.value.days)
})

const contractStats = ref([
  {
    title: 'Total de Contratos',
    value: '245',
    description: 'Cantidad total de contratos registrados en el sistema',
    icon: 'fas fa-file-contract',
    color: colors.primary
  },
  {
    title: 'Contratos Activos',
    value: '180',
    description: 'Contratos en curso que aún no han expirado',
    icon: 'fas fa-check-circle',
    color: colors.success
  },
  {
    title: 'Contratos Vencidos',
    value: '45',
    description: 'Contratos cuyo plazo ya expiró',
    icon: 'fas fa-times-circle',
    color: colors.error
  },
  {
    title: 'Próximos a Vencer',
    value: '20',
    description: 'Contratos que vencen en los próximos 30 días',
    icon: 'fas fa-clock',
    color: colors.warning
  }
])

const licenseStatus = ref('Licencia Activa')
const licenseExpiry = ref('12/12/2025')
const licenseDays = ref(365)
const registeredCompanies = ref('15')
const activeUsers = ref('45')

const contractTrends = ref([
  {
    label: 'Firmados este mes',
    value: '24',
    icon: 'fas fa-calendar-check',
    color: colors.success
  },
  {
    label: 'Renovados este mes',
    value: '12',
    icon: 'fas fa-sync',
    color: colors.info
  },
  {
    label: 'Cancelados este mes',
    value: '3',
    icon: 'fas fa-ban',
    color: colors.error
  },
  {
    label: 'Tiempo promedio de firma',
    value: '5.2 días',
    icon: 'fas fa-clock',
    color: colors.warning
  }
])

const contractCategories = ref([
  { name: 'Servicios', count: 35, percentage: 35 },
  { name: 'Alquileres', count: 10, percentage: 10 },
  { name: 'Contratos laborales', count: 15, percentage: 15 },
  { name: 'Proveedores', count: 25, percentage: 25 },
  { name: 'Otros', count: 15, percentage: 15 }
])

const recentActivities = ref([
  {
    id: 1,
    title: 'Usuario modificó el contrato "Acuerdo de servicio"',
    time: 'Hace 3 horas',
    icon: 'fas fa-edit',
    color: colors.primary
  },
  {
    id: 2,
    title: 'Se firmó el contrato "Acuerdo de confidencialidad"',
    time: 'Ayer',
    icon: 'fas fa-signature',
    color: colors.success
  },
  {
    id: 3,
    title: 'El contrato "Proveedor IT" está a 5 días de vencer',
    time: 'Hace 2 días',
    icon: 'fas fa-exclamation-triangle',
    color: colors.warning
  },
  {
    id: 4,
    title: 'Se agregó un nuevo contrato "Licencia de software"',
    time: 'Hace 3 días',
    icon: 'fas fa-plus-circle',
    color: colors.info
  }
])
</script>

<style lang="scss" scoped>
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;

.dashboard-view {
  .dashboard-header {
    @include m.flex-between;
    margin-bottom: v.$spacing-xl;
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: c.$color-surface;
    padding: v.$spacing-lg 0;
    border-bottom: 1px solid c.$color-border;

    h1 {
      @include m.heading-1;
      color: c.$color-text-primary;
      margin: 0;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: v.$spacing-lg;
    margin-bottom: v.$spacing-xl;
  }

  .stat-card {
    @include m.card-style;
    display: flex;
    align-items: flex-start;
    gap: v.$spacing-md;

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: v.$border-radius-md;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: v.$font-size-xl;
      }
    }

    .stat-content {
      h3 {
        @include m.text-secondary;
        margin: 0 0 v.$spacing-xs;
      }

      .stat-value {
        @include m.heading-2;
        color: c.$color-text-primary;
        margin: 0 0 v.$spacing-xs;
      }

      .stat-description {
        @include m.text-small;
        color: c.$color-text-secondary;
        margin: 0;
      }
    }
  }

  .license-card {
    @include m.card-style;
    margin-bottom: v.$spacing-xl;

    .card-header {
      @include m.flex-between;
      margin-bottom: v.$spacing-lg;

      h3 {
        @include m.heading-3;
        color: c.$color-text-primary;
        margin: 0;
      }

      .license-status {
        display: flex;
        align-items: center;
        gap: v.$spacing-xs;
        padding: v.$spacing-xs v.$spacing-sm;
        border-radius: v.$border-radius-sm;
        background-color: rgba(c.$color-success, 0.1);
        color: c.$color-success;

        &.warning {
          background-color: rgba(c.$color-warning, 0.1);
          color: c.$color-warning;
        }

        i {
          font-size: v.$font-size-sm;
        }
      }
    }

    .license-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: v.$spacing-lg;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: v.$spacing-xs;

        .label {
          @include m.text-small;
          color: c.$color-text-secondary;
        }

        .value {
          @include m.text-base;
          color: c.$color-text-primary;
          font-weight: v.$font-weight-medium;
        }
      }
    }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: v.$spacing-lg;
    margin-bottom: v.$spacing-xl;
  }

  .chart-card {
    @include m.card-style;

    .card-header {
      @include m.flex-between;
      margin-bottom: v.$spacing-lg;

      h3 {
        @include m.heading-3;
        color: c.$color-text-primary;
        margin: 0;
      }
    }
  }

  .trends-stats {
    .trend-item {
      display: flex;
      align-items: center;
      gap: v.$spacing-md;
      padding: v.$spacing-md 0;
      border-bottom: 1px solid c.$color-border;

      &:last-child {
        border-bottom: none;
      }

      .trend-icon {
        width: 40px;
        height: 40px;
        border-radius: v.$border-radius-sm;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: v.$font-size-lg;
        }
      }

      .trend-content {
        flex: 1;

        .trend-label {
          @include m.text-secondary;
          margin-bottom: v.$spacing-xs;
        }

        .trend-value {
          @include m.text-base;
          color: c.$color-text-primary;
          font-weight: v.$font-weight-medium;
        }
      }
    }
  }

  .category-stats {
    .category-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: v.$spacing-md 0;
      border-bottom: 1px solid c.$color-border;

      &:last-child {
        border-bottom: none;
      }

      .category-info {
        flex: 1;
        margin-right: v.$spacing-md;

        .category-name {
          @include m.text-base;
          display: block;
          margin-bottom: v.$spacing-xs;
        }

        .progress-bar {
          height: 6px;
          background-color: c.$color-background;
          border-radius: v.$border-radius-sm;
          overflow: hidden;

          .progress {
            height: 100%;
            background-color: c.$color-primary;
            border-radius: v.$border-radius-sm;
            transition: width 0.3s ease;
          }
        }
      }

      .category-value {
        @include m.text-base;
        color: c.$color-text-secondary;
      }
    }
  }

  .activity-card {
    @include m.card-style;

    .card-header {
      @include m.flex-between;
      margin-bottom: v.$spacing-lg;

      h3 {
        @include m.heading-3;
        color: c.$color-text-primary;
        margin: 0;
      }
    }

    .activity-list {
      .activity-item {
        display: flex;
        align-items: center;
        gap: v.$spacing-md;
        padding: v.$spacing-md 0;
        border-bottom: 1px solid c.$color-border;

        &:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: v.$border-radius-sm;
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            font-size: v.$font-size-lg;
          }
        }

        .activity-content {
          flex: 1;

          .activity-title {
            @include m.text-base;
            color: c.$color-text-primary;
            margin-bottom: v.$spacing-xs;
          }

          .activity-time {
            @include m.text-small;
            color: c.$color-text-secondary;
          }
        }
      }
    }
  }
}

// Utility Classes
.btn-outline {
  @include m.button-outline;
}

.btn-icon {
  @include m.button-icon;
}

.btn-text {
  @include m.button-text;
}

@media (max-width: v.$breakpoint-md) {
  .dashboard-view {
    .dashboard-header {
      flex-direction: column;
      gap: v.$spacing-md;
      align-items: flex-start;
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }

    .license-info {
      grid-template-columns: 1fr !important;
    }
  }
}

.date-selector {
  position: relative;

  .date-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: v.$spacing-xs;
    background-color: c.$color-surface;
    border: 1px solid c.$color-border;
    border-radius: v.$border-radius-md;
    box-shadow: v.$shadow-md;
    z-index: 1000;
    min-width: 200px;

    .date-option {
      padding: v.$spacing-sm v.$spacing-md;
      cursor: pointer;
      transition: background-color v.$transition-fast;

      &:hover {
        background-color: c.$color-surface-hover;
      }

      &.active {
        background-color: rgba(c.$color-primary, 0.1);
        color: c.$color-primary;
      }
    }
  }
}
</style>