<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Header con resumen general -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-text-primary mb-4">Panel de Control</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Resumen Contratos -->
        <div class="card bg-primary/5 border-primary/20">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-sm font-medium text-text-secondary">Contratos Activos</h3>
              <p class="text-2xl font-semibold text-primary">{{ stats.activeContracts }}</p>
            </div>
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <i class="fas fa-file-signature text-primary"></i>
            </div>
          </div>
          <div class="flex items-center text-xs text-text-secondary">
            <span class="flex items-center text-success mr-2">
              <i class="fas fa-arrow-up mr-1"></i>
              3.2%
            </span>
            <span>vs mes anterior</span>
          </div>
        </div>

        <!-- Resumen Vencimientos -->
        <div class="card bg-warning/5 border-warning/20">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-sm font-medium text-text-secondary">Vencimientos Próximos</h3>
              <p class="text-2xl font-semibold text-warning">{{ stats.upcomingDeadlines }}</p>
            </div>
            <div class="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
              <i class="fas fa-clock text-warning"></i>
            </div>
          </div>
          <div class="flex items-center text-xs text-text-secondary">
            <span>En los próximos 30 días</span>
          </div>
        </div>

        <!-- Resumen Renovaciones -->
        <div class="card bg-success/5 border-success/20">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-sm font-medium text-text-secondary">Renovaciones Pendientes</h3>
              <p class="text-2xl font-semibold text-success">{{ stats.pendingRenewals }}</p>
            </div>
            <div class="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
              <i class="fas fa-sync-alt text-success"></i>
            </div>
          </div>
          <div class="flex items-center text-xs text-text-secondary">
            <span class="flex items-center text-success mr-2">
              <i class="fas fa-arrow-down mr-1"></i>
              1.8%
            </span>
            <span>vs mes anterior</span>
          </div>
        </div>

        <!-- Resumen Pagos -->
        <div class="card bg-error/5 border-error/20">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-sm font-medium text-text-secondary">Pagos Atrasados</h3>
              <p class="text-2xl font-semibold text-error">{{ stats.overdueBills }}</p>
            </div>
            <div class="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-error"></i>
            </div>
          </div>
          <div class="flex items-center text-xs text-text-secondary">
            <span class="flex items-center text-error mr-2">
              <i class="fas fa-arrow-up mr-1"></i>
              5.1%
            </span>
            <span>vs mes anterior</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos y Tablas -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Contratos por Estado (Gráfico) -->
      <div class="lg:col-span-2 card h-[400px]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-text-primary">Contratos por Estado</h2>
          <div class="flex items-center gap-2">
            <select v-model="timeRange" class="text-sm border border-border rounded px-2 py-1 bg-transparent">
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Año</option>
            </select>
          </div>
        </div>
        <div class="w-full h-[320px] flex items-center justify-center">
          <!-- Placeholder para el gráfico -->
          <div class="text-center text-text-secondary">
            <i class="fas fa-chart-line text-4xl mb-2"></i>
            <p>Gráfico de contratos por estado</p>
          </div>
        </div>
      </div>

      <!-- Recientes Actividades -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-text-primary">Actividades Recientes</h2>
          <button class="text-xs text-primary">Ver Todas</button>
        </div>
        <div class="space-y-4">
          <div v-for="(activity, index) in recentActivities" :key="index" class="flex items-start gap-3">
            <div :class="`w-8 h-8 rounded-full flex items-center justify-center ${activityIconClass(activity.type)}`">
              <i :class="`fas ${activityIcon(activity.type)}`"></i>
            </div>
            <div class="flex-1">
              <p class="text-sm text-text-primary">{{ activity.description }}</p>
              <div class="flex justify-between text-xs text-text-secondary mt-1">
                <span>{{ activity.user }}</span>
                <span>{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Próximos Vencimientos y Tareas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Próximos Vencimientos -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-text-primary">Próximos Vencimientos</h2>
          <button class="text-xs text-primary">Ver Todos</button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-border">
                <th class="py-3 px-4 text-left text-xs font-medium text-text-secondary">Contrato</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-text-secondary">Fecha</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-text-secondary">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(deadline, index) in upcomingDeadlines" :key="index" 
                  class="border-b border-border hover:bg-background">
                <td class="py-3 px-4">
                  <div>
                    <p class="text-sm font-medium text-text-primary">{{ deadline.contract }}</p>
                    <p class="text-xs text-text-secondary">{{ deadline.client }}</p>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div>
                    <p class="text-sm text-text-primary">{{ deadline.date }}</p>
                    <p class="text-xs text-text-secondary">{{ calculateDaysRemaining(deadline.date) }}</p>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deadline.statusClass}`">
                    {{ deadline.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tareas Pendientes -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-text-primary">Tareas Pendientes</h2>
          <button class="text-xs text-primary">Ver Todas</button>
        </div>
        <div class="space-y-2">
          <div v-for="(task, index) in pendingTasks" :key="index" 
               class="p-3 border border-border rounded-md hover:bg-background">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2">
                <input type="checkbox" v-model="task.completed" class="checkbox" />
                <div>
                  <p class="text-sm font-medium text-text-primary" :class="{ 'line-through': task.completed }">
                    {{ task.title }}
                  </p>
                  <p class="text-xs text-text-secondary">{{ task.description }}</p>
                </div>
              </div>
              <span class="text-xs px-2 py-1 rounded" :class="priorityClass(task.priority)">
                {{ task.priority }}
              </span>
            </div>
            <div class="flex justify-between items-center mt-2 text-xs text-text-secondary">
              <span class="flex items-center gap-1">
                <i class="fas fa-calendar-alt"></i>
                {{ task.dueDate }}
              </span>
              <span class="flex items-center gap-1">
                <i class="fas fa-user"></i>
                {{ task.assignee }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Última Sección: Categorías y Alertas -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Contratos por Categoría -->
      <div class="lg:col-span-2 card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-text-primary">Contratos por Categoría</h2>
          <div class="flex items-center gap-2">
            <button class="text-xs text-primary">Descargar Reporte</button>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div v-for="(category, index) in categories" :key="index" 
               class="p-3 rounded-md border border-border">
            <h3 class="text-sm font-medium text-text-primary mb-1">{{ category.name }}</h3>
            <p class="text-2xl font-semibold">{{ category.count }}</p>
            <div class="flex items-center text-xs mt-2">
              <span :class="`${category.trend > 0 ? 'text-success' : 'text-error'} mr-1`">
                <i :class="`fas fa-arrow-${category.trend > 0 ? 'up' : 'down'}`"></i>
                {{ Math.abs(category.trend) }}%
              </span>
              <span class="text-text-secondary">vs período anterior</span>
            </div>
          </div>
        </div>
        <div class="w-full h-[200px] flex items-center justify-center">
          <!-- Placeholder para el gráfico de categorías -->
          <div class="text-center text-text-secondary">
            <i class="fas fa-chart-pie text-4xl mb-2"></i>
            <p>Distribución de contratos por categoría</p>
          </div>
        </div>
      </div>

      <!-- Alertas y Notificaciones Importantes -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-text-primary">Alertas Importantes</h2>
          <button class="text-xs text-primary">Administrar Alertas</button>
        </div>
        <div class="space-y-3">
          <div v-for="(alert, index) in importantAlerts" :key="index" 
               class="p-3 rounded-md" :class="alertBgClass(alert.level)">
            <div class="flex items-start gap-3">
              <div :class="alertIconClass(alert.level)">
                <i :class="`fas ${alertIcon(alert.level)}`"></i>
              </div>
              <div>
                <h3 class="text-sm font-medium text-text-primary">{{ alert.title }}</h3>
                <p class="text-xs text-text-secondary mt-1">{{ alert.message }}</p>
                <div class="flex justify-between items-center mt-2 text-xs">
                  <span class="text-text-secondary">{{ alert.date }}</span>
                  <button class="text-primary">Acción</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Estadísticas principales
const stats = ref({
  activeContracts: 58,
  upcomingDeadlines: 12,
  pendingRenewals: 8,
  overdueBills: 3
})

// Configuración del rango de tiempo
const timeRange = ref('month')

// Actividades recientes
const recentActivities = ref([
  {
    type: 'create',
    description: 'Nuevo contrato con Empresa ABC',
    user: 'Juan Pérez',
    time: 'Hace 2 horas'
  },
  {
    type: 'update',
    description: 'Actualización del contrato #12345',
    user: 'María Gómez',
    time: 'Hace 5 horas'
  },
  {
    type: 'alert',
    description: 'Contrato #5678 vence en 3 días',
    user: 'Sistema',
    time: 'Hace 1 día'
  },
  {
    type: 'payment',
    description: 'Pago recibido: Factura #INV-2022-456',
    user: 'Ana López',
    time: 'Hace 2 días'
  }
])

// Funciones para los iconos de actividades
const activityIcon = (type) => {
  switch (type) {
    case 'create': return 'fa-file-plus'
    case 'update': return 'fa-edit'
    case 'alert': return 'fa-exclamation-circle'
    case 'payment': return 'fa-money-bill-wave'
    default: return 'fa-circle'
  }
}

const activityIconClass = (type) => {
  switch (type) {
    case 'create': return 'bg-success/10 text-success'
    case 'update': return 'bg-primary/10 text-primary'
    case 'alert': return 'bg-warning/10 text-warning'
    case 'payment': return 'bg-info/10 text-info'
    default: return 'bg-gray-100 text-gray-500'
  }
}

// Próximos vencimientos
const upcomingDeadlines = ref([
  {
    contract: 'Contrato Servicios IT',
    client: 'Empresa Tecnológica XYZ',
    date: '2023-07-15',
    status: 'Pendiente',
    statusClass: 'bg-warning/10 text-warning'
  },
  {
    contract: 'Acuerdo de Confidencialidad',
    client: 'Consultora Legal ABC',
    date: '2023-07-20',
    status: 'En proceso',
    statusClass: 'bg-info/10 text-info'
  },
  {
    contract: 'Contrato de Distribución',
    client: 'Distribuidora Nacional',
    date: '2023-07-25',
    status: 'Revisión',
    statusClass: 'bg-primary/10 text-primary'
  },
  {
    contract: 'Contrato de Arrendamiento',
    client: 'Inmobiliaria Central',
    date: '2023-08-01',
    status: 'Próximo',
    statusClass: 'bg-success/10 text-success'
  }
])

// Calcular días restantes
const calculateDaysRemaining = (dateStr) => {
  const today = new Date()
  const targetDate = new Date(dateStr)
  const diffTime = targetDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Vencido'
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  return `${diffDays} días restantes`
}

// Tareas pendientes
const pendingTasks = ref([
  {
    title: 'Revisar contrato con proveedor',
    description: 'Verificar cláusulas de renovación automática',
    dueDate: '2023-07-12',
    assignee: 'Juan Pérez',
    priority: 'Alta',
    completed: false
  },
  {
    title: 'Enviar recordatorio de pago',
    description: 'Factura #INV-2022-789 pendiente de pago',
    dueDate: '2023-07-14',
    assignee: 'María Gómez',
    priority: 'Media',
    completed: false
  },
  {
    title: 'Actualizar datos de cliente',
    description: 'Actualizar información de contacto de Empresa ABC',
    dueDate: '2023-07-18',
    assignee: 'Carlos Rodríguez',
    priority: 'Baja',
    completed: true
  }
])

// Clases para prioridades
const priorityClass = (priority) => {
  switch (priority) {
    case 'Alta': return 'bg-error/10 text-error'
    case 'Media': return 'bg-warning/10 text-warning'
    case 'Baja': return 'bg-success/10 text-success'
    default: return 'bg-gray-100 text-gray-500'
  }
}

// Categorías de contratos
const categories = ref([
  { name: 'Servicios', count: 25, trend: 5.2 },
  { name: 'Compraventa', count: 18, trend: -2.1 },
  { name: 'Laborales', count: 12, trend: 3.4 },
  { name: 'Arrendamiento', count: 8, trend: 1.8 }
])

// Alertas importantes
const importantAlerts = ref([
  {
    level: 'critical',
    title: 'Contrato a punto de vencer',
    message: 'El contrato #5678 con Empresa ABC vence en 3 días',
    date: '12/07/2023'
  },
  {
    level: 'warning',
    title: 'Pago pendiente',
    message: 'La factura #INV-2022-456 está pendiente de pago desde hace 15 días',
    date: '10/07/2023'
  },
  {
    level: 'info',
    title: 'Recordatorio de renovación',
    message: 'El período de renovación para 5 contratos comienza el próximo mes',
    date: '08/07/2023'
  }
])

// Clases para alertas
const alertBgClass = (level) => {
  switch (level) {
    case 'critical': return 'bg-error/5 border border-error/20'
    case 'warning': return 'bg-warning/5 border border-warning/20'
    case 'info': return 'bg-info/5 border border-info/20'
    default: return 'bg-gray-100'
  }
}

const alertIconClass = (level) => {
  switch (level) {
    case 'critical': return 'w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center'
    case 'warning': return 'w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center'
    case 'info': return 'w-8 h-8 rounded-full bg-info/10 text-info flex items-center justify-center'
    default: return 'w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center'
  }
}

const alertIcon = (level) => {
  switch (level) {
    case 'critical': return 'fa-exclamation-triangle'
    case 'warning': return 'fa-exclamation-circle'
    case 'info': return 'fa-info-circle'
    default: return 'fa-bell'
  }
}
</script>