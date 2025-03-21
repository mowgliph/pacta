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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useColors } from '../../types/colors'
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
const contractTrends = ref<DashboardResponse['contractTrends'] | null>(null);
const contractCategories = ref<DashboardResponse['contractCategories']>([]);
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
    contractTrends.value = data.contractTrends;
    contractCategories.value = data.contractCategories;
    
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
@use './dashboard.scss';
</style>