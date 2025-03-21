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

    <!-- Mensaje de error si existe -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>

    <!-- Indicador de carga -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando información del panel...</p>
    </div>

    <div v-else>
      <!-- Resumen General de Contratos -->
      <div v-if="contractStats" class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" :style="{ backgroundColor: colors.primary + '20' }">
            <i class="fas fa-file-contract" :style="{ color: colors.primary }"></i>
          </div>
          <div class="stat-content">
            <h3>Total de Contratos</h3>
            <p class="stat-value">{{ contractStats.total }}</p>
            <p class="stat-description">Cantidad total de contratos registrados</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" :style="{ backgroundColor: colors.success + '20' }">
            <i class="fas fa-check-circle" :style="{ color: colors.success }"></i>
          </div>
          <div class="stat-content">
            <h3>Contratos Activos</h3>
            <p class="stat-value">{{ contractStats.active }}</p>
            <p class="stat-description">Contratos en curso que aún no han expirado</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" :style="{ backgroundColor: colors.error + '20' }">
            <i class="fas fa-times-circle" :style="{ color: colors.error }"></i>
          </div>
          <div class="stat-content">
            <h3>Contratos Vencidos</h3>
            <p class="stat-value">{{ contractStats.expired }}</p>
            <p class="stat-description">Contratos cuyo plazo ya expiró</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" :style="{ backgroundColor: colors.warning + '20' }">
            <i class="fas fa-clock" :style="{ color: colors.warning }"></i>
          </div>
          <div class="stat-content">
            <h3>Próximos a Vencer</h3>
            <p class="stat-value">{{ contractStats.expiringSoon }}</p>
            <p class="stat-description">Contratos que vencen en los próximos 30 días</p>
          </div>
        </div>
      </div>

      <!-- Estado de Licencia -->
      <div class="license-card">
        <div class="card-header">
          <h3>Estado de la Licencia PACTA</h3>
          <div class="license-status" :class="{ 'warning': !license || licenseDays < 30 }">
            <i class="fas" :class="license ? 'fa-shield-alt' : 'fa-exclamation-triangle'"></i>
            {{ license ? licenseStatus : 'Sin Licencia Activa' }}
          </div>
        </div>
        <div v-if="license" class="license-info">
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
        
        <!-- Mostrar cuando no hay licencia -->
        <div v-else class="license-warning">
          <p>El sistema está funcionando sin una licencia activa. Algunas funcionalidades están limitadas.</p>
          <p class="limitations">Funcionalidades limitadas: <span>Gestión de usuarios, creación y edición de contratos</span></p>
          <router-link to="/settings" class="btn-primary" v-if="authStore.isAdmin">
            <i class="fas fa-key"></i>
            Activar Licencia
          </router-link>
          <p class="contact-info" v-else>
            Para activar una licencia, contacte al administrador del sistema.
          </p>
        </div>
      </div>

      <!-- Tendencias y Reportes -->
      <div class="charts-grid" v-if="contractTrends">
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
            <div class="trend-item">
              <div class="trend-icon" :style="{ backgroundColor: colors.success + '20' }">
                <i class="fas fa-calendar-check" :style="{ color: colors.success }"></i>
              </div>
              <div class="trend-content">
                <div class="trend-label">Nuevos hoy</div>
                <div class="trend-value">{{ contractTrends.newToday }}</div>
              </div>
            </div>
            
            <div class="trend-item">
              <div class="trend-icon" :style="{ backgroundColor: colors.info + '20' }">
                <i class="fas fa-sync" :style="{ color: colors.info }"></i>
              </div>
              <div class="trend-content">
                <div class="trend-label">Nuevos esta semana</div>
                <div class="trend-value">{{ contractTrends.newThisWeek }}</div>
              </div>
            </div>
            
            <div class="trend-item">
              <div class="trend-icon" :style="{ backgroundColor: colors.warning + '20' }">
                <i class="fas fa-search" :style="{ color: colors.warning }"></i>
              </div>
              <div class="trend-content">
                <div class="trend-label">Pendientes de revisión</div>
                <div class="trend-value">{{ contractTrends.reviewPending }}</div>
              </div>
            </div>
            
            <div class="trend-item">
              <div class="trend-icon" :style="{ backgroundColor: colors.primary + '20' }">
                <i class="fas fa-redo" :style="{ color: colors.primary }"></i>
              </div>
              <div class="trend-content">
                <div class="trend-label">Pendientes de renovación</div>
                <div class="trend-value">{{ contractTrends.renewalsPending }}</div>
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
      <div class="activity-card" v-if="recentActivities.length > 0">
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

      <!-- Mensaje si no hay actividades -->
      <div v-else class="empty-state">
        <i class="fas fa-calendar-day"></i>
        <p>No hay actividades recientes para mostrar</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useColors } from '../types/colors'
import { dashboardService } from '@/services/dashboard.service'
import type { DashboardResponse } from '@/services/dashboard.service'
import { useAuthStore } from '@/stores/auth'

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
const licenseStatus = ref<string>('Verificando...');
const licenseExpiry = ref<string>('');
const licenseDays = ref<number>(0);
const registeredCompanies = ref<number>(0);
const activeUsers = ref<number>(0);
const contractTrends = ref<DashboardResponse['contractTrends'] | null>(null);
const contractCategories = ref<DashboardResponse['contractCategories']>([]);
const recentActivities = ref<DashboardResponse['recentActivities']>([]);
const loading = ref<boolean>(true);
const error = ref<string>('');

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
    
    // Manejar cuando license es null
    if (data.license) {
      licenseStatus.value = data.license.status;
      licenseExpiry.value = data.license.expiryDate;
      licenseDays.value = data.license.remainingDays;
      registeredCompanies.value = data.license.registeredCompanies;
      activeUsers.value = data.license.activeUsers;
    } else {
      licenseStatus.value = 'Sin Licencia';
      licenseExpiry.value = 'N/A';
      licenseDays.value = 0;
      registeredCompanies.value = 0;
      activeUsers.value = 0;
    }
    
    contractTrends.value = data.contractTrends;
    contractCategories.value = data.contractCategories;
    recentActivities.value = data.recentActivities;
    
    error.value = '';
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    error.value = 'Error al cargar los datos del dashboard';
    throw err;
  }
}

// Cerrar el menú cuando se hace clic fuera
const closeDateMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.date-selector')) {
    showDateMenu.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', closeDateMenu)
  
  // Cargar datos iniciales
  loading.value = true;
  try {
    await fetchDashboardData(selectedRange.value.days);
  } catch (err) {
    error.value = 'Error al cargar los datos iniciales del dashboard';
  } finally {
    loading.value = false;
  }
})
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

/* Estilos para el loader */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(var(--color-primary-rgb), 0.1);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 20px;
  }
  
  p {
    color: var(--color-text-secondary);
    font-size: 16px;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Estilos para el mensaje de error */
.error-message {
  background-color: rgba(var(--color-error-rgb), 0.1);
  border-left: 4px solid var(--color-error);
  color: var(--color-error);
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  i {
    font-size: 20px;
  }
}

/* Estilos para el estado vacío */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary);
  
  i {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
  }
  
  p {
    font-size: 16px;
  }
}
</style>