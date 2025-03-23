<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <button
      v-for="action in actions"
      :key="action.id"
      class="flex flex-col items-center justify-center p-4 rounded-lg bg-surface hover:bg-primary/5 border border-border hover:border-primary/20 transition-all duration-300"
      @click="action.onClick"
    >
      <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3" :class="action.bgColor">
        <i :class="action.icon + ' text-xl ' + action.iconColor"></i>
      </div>
      <span class="text-sm font-medium text-text-primary text-center">{{ action.label }}</span>
      <span class="text-xs text-text-secondary text-center mt-1">{{ action.description }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  bgColor: string;
  iconColor: string;
  onClick: () => void;
}

const actions: QuickAction[] = [
  {
    id: 'new-contract',
    label: 'Nuevo Contrato',
    description: 'Crear contrato',
    icon: 'fas fa-file-signature',
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
    onClick: () => router.push('/contracts/new')
  },
  {
    id: 'new-license',
    label: 'Nueva Licencia',
    description: 'Registrar licencia',
    icon: 'fas fa-key',
    bgColor: 'bg-success/10',
    iconColor: 'text-success',
    onClick: () => router.push('/licenses/new')
  },
  {
    id: 'renewals',
    label: 'Renovaciones',
    description: 'Ver pendientes',
    icon: 'fas fa-sync-alt',
    bgColor: 'bg-warning/10',
    iconColor: 'text-warning',
    onClick: () => router.push('/contracts/renewals')
  },
  {
    id: 'reports',
    label: 'Reportes',
    description: 'Generar informe',
    icon: 'fas fa-chart-bar',
    bgColor: 'bg-info/10',
    iconColor: 'text-info',
    onClick: () => router.push('/reports')
  }
];
</script>

<style scoped>
button {
  @apply focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2;
}
</style> 