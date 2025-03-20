<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>Panel de Control</h1>
      <div class="date-range">
        <button class="btn-outline">
          <i class="fas fa-calendar"></i>
          Últimos 30 días
        </button>
      </div>
    </div>

    <!-- Tarjetas de Estadísticas -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.title">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20' }">
          <i :class="stat.icon" :style="{ color: stat.color }"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stat.title }}</h3>
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-change" :class="{ 'positive': stat.change > 0, 'negative': stat.change < 0 }">
            {{ Math.abs(stat.change) }}% respecto al mes anterior
            <i :class="stat.change > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </p>
        </div>
      </div>
    </div>

    <!-- Sección de Gráficos -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="card-header">
          <h3>Resumen de Actividad</h3>
          <div class="card-actions">
            <button class="btn-icon">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        <div class="chart-placeholder">
          <div class="chart-demo"></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <h3>Actividad de Usuarios</h3>
          <div class="card-actions">
            <button class="btn-icon">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        <div class="chart-placeholder">
          <div class="chart-demo"></div>
        </div>
      </div>
    </div>

    <!-- Actividad Reciente -->
    <div class="activity-card">
      <div class="card-header">
        <h3>Actividad Reciente</h3>
        <button class="btn-text">Ver Todo</button>
      </div>
      <div class="activity-list">
        <div class="activity-item" v-for="activity in recentActivity" :key="activity.id">
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
import { ref } from 'vue'

const stats = ref([
  {
    title: 'Total de Usuarios',
    value: '2,450',
    change: 12.5,
    icon: 'fas fa-users',
    color: '#2196F3'
  },
  {
    title: 'Usuarios Activos',
    value: '1,850',
    change: 8.2,
    icon: 'fas fa-user-check',
    color: '#4CAF50'
  },
  {
    title: 'Nuevos Registros',
    value: '156',
    change: -3.1,
    icon: 'fas fa-user-plus',
    color: '#FF9800'
  },
  {
    title: 'Tasa de Actividad',
    value: '24.5%',
    change: 4.3,
    icon: 'fas fa-chart-line',
    color: '#9C27B0'
  }
])

const recentActivity = ref([
  {
    id: 1,
    title: 'Nuevo usuario registrado',
    time: 'Hace 5 minutos',
    icon: 'fas fa-user-plus',
    color: '#FF9800'
  },
  {
    id: 2,
    title: 'Actualización de perfil',
    time: 'Hace 15 minutos',
    icon: 'fas fa-user-edit',
    color: '#2196F3'
  },
  {
    id: 3,
    title: 'Cambio de rol',
    time: 'Hace 1 hora',
    icon: 'fas fa-user-shield',
    color: '#4CAF50'
  },
  {
    id: 4,
    title: 'Actualización del sistema',
    time: 'Hace 2 horas',
    icon: 'fas fa-sync',
    color: '#9C27B0'
  }
])
</script>

<style lang="scss" scoped>
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;
@use '../styles/typography' as t;

.dashboard-view {
  .dashboard-header {
    @include m.flex-between;
    margin-bottom: v.$spacing-xl;

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
    @include m.card;
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
        margin-bottom: v.$spacing-xs;
      }

      .stat-value {
        @include m.heading-2;
        color: c.$color-text-primary;
        margin-bottom: v.$spacing-xs;
      }

      .stat-change {
        @include m.text-small;
        display: flex;
        align-items: center;
        gap: v.$spacing-xs;

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
    @include m.card;

    .card-header {
      @include m.flex-between;
      margin-bottom: v.$spacing-lg;

      h3 {
        @include m.heading-3;
        color: c.$color-text-primary;
        margin: 0;
      }
    }

    .chart-placeholder {
      height: 300px;
      background-color: c.$color-background;
      border-radius: v.$border-radius-md;
      display: flex;
      align-items: center;
      justify-content: center;

      .chart-demo {
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, c.$color-primary-light 25%, transparent 25%),
                    linear-gradient(-45deg, c.$color-primary-light 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, c.$color-primary-light 75%),
                    linear-gradient(-45deg, transparent 75%, c.$color-primary-light 75%);
        background-size: 20px 20px;
        opacity: 0.1;
      }
    }
  }

  .activity-card {
    @include m.card;

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

// Botones
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
  }
}
</style>