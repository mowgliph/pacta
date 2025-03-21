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
import { useColors } from '../../types/colors'

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
@use './analyticsView.scss';
</style> 