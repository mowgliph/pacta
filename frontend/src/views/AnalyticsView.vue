<template>
  <div class="analytics-view">
    <div class="page-header">
      <h1>Analíticas de Contratos</h1>
      <div class="date-range">
        <button class="btn-outline">
          <i class="fas fa-calendar"></i>
          Últimos 30 días
        </button>
      </div>
    </div>

    <!-- Resumen General -->
    <div class="metrics-grid">
      <div class="metric-card" v-for="metric in contractMetrics" :key="metric.title">
        <div class="metric-icon" :style="{ backgroundColor: metric.color + '20' }">
          <i :class="metric.icon" :style="{ color: metric.color }"></i>
        </div>
        <div class="metric-content">
          <h3>{{ metric.title }}</h3>
          <p class="metric-value">{{ metric.value }}</p>
          <p class="metric-change" :class="{ 'positive': metric.change > 0, 'negative': metric.change < 0 }">
            {{ Math.abs(metric.change) }}% vs mes anterior
            <i :class="metric.change > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </p>
        </div>
      </div>
    </div>

    <!-- Eficiencia y Cumplimiento -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="card-header">
          <h3>Eficiencia en Gestión</h3>
          <div class="card-actions">
            <button class="btn-icon">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        <div class="efficiency-stats">
          <div class="stat-item" v-for="stat in efficiencyStats" :key="stat.label">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-trend" :class="stat.trend">
              <i :class="stat.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ stat.percentage }}%
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <h3>Cumplimiento y Riesgos</h3>
          <div class="card-actions">
            <button class="btn-icon">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        <div class="compliance-stats">
          <div class="stat-item" v-for="stat in complianceStats" :key="stat.label">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-trend" :class="stat.trend">
              <i :class="stat.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ stat.percentage }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useColors } from '../types/colors'

const colors = useColors()

const contractMetrics = ref([
  {
    title: 'Contratos Activos',
    value: '156',
    change: 8.2,
    icon: 'fas fa-file-contract',
    color: colors.primary
  },
  {
    title: 'Firmados este Mes',
    value: '24',
    change: 12.5,
    icon: 'fas fa-check-circle',
    color: colors.success
  },
  {
    title: 'En Riesgo',
    value: '8',
    change: -2.1,
    icon: 'fas fa-exclamation-triangle',
    color: colors.warning
  },
  {
    title: 'Por Vencer',
    value: '15',
    change: 4.3,
    icon: 'fas fa-clock',
    color: colors.info
  }
])

const efficiencyStats = ref([
  {
    label: 'Tiempo Promedio de Negociación',
    value: '5.2 días',
    trend: 'down',
    percentage: 12
  },
  {
    label: 'Tiempo hasta Firma',
    value: '8.5 días',
    trend: 'down',
    percentage: 8
  },
  {
    label: 'Tiempo de Aprobación',
    value: '2.3 días',
    trend: 'up',
    percentage: 5
  },
  {
    label: 'Tasa de Finalización',
    value: '92%',
    trend: 'up',
    percentage: 3
  }
])

const complianceStats = ref([
  {
    label: 'Cláusulas Críticas',
    value: '45',
    trend: 'up',
    percentage: 15
  },
  {
    label: 'Alertas Pendientes',
    value: '12',
    trend: 'down',
    percentage: 25
  },
  {
    label: 'Incumplimientos',
    value: '3%',
    trend: 'down',
    percentage: 40
  },
  {
    label: 'En Litigio',
    value: '2',
    trend: 'down',
    percentage: 50
  }
])
</script>

<style lang="scss" scoped>
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;

.analytics-view {
  .page-header {
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
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: v.$spacing-lg;
    margin-bottom: v.$spacing-xl;
  }

  .metric-card {
    @include m.card-style;
    display: flex;
    align-items: flex-start;
    gap: v.$spacing-md;

    .metric-icon {
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

    .metric-content {
      h3 {
        @include m.text-secondary;
        margin: 0 0 v.$spacing-xs;
      }

      .metric-value {
        @include m.heading-2;
        color: c.$color-text-primary;
        margin: 0 0 v.$spacing-xs;
      }

      .metric-change {
        @include m.text-small;
        display: flex;
        align-items: center;
        gap: v.$spacing-xs;
        margin: 0;

        &.positive {
          color: c.$color-success;
        }

        &.negative {
          color: c.$color-error;
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

  .efficiency-stats,
  .compliance-stats {
    .stat-item {
      padding: v.$spacing-md 0;
      border-bottom: 1px solid c.$color-border;

      &:last-child {
        border-bottom: none;
      }

      .stat-label {
        @include m.text-secondary;
        margin-bottom: v.$spacing-xs;
      }

      .stat-value {
        @include m.text-base;
        font-weight: v.$font-weight-medium;
        margin-bottom: v.$spacing-xs;
      }

      .stat-trend {
        @include m.text-small;
        display: flex;
        align-items: center;
        gap: v.$spacing-xs;

        &.up {
          color: c.$color-success;
        }

        &.down {
          color: c.$color-error;
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
  .analytics-view {
    .charts-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style> 