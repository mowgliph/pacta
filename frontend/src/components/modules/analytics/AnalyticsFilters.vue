<template>
  <div class="mb-6">
    <div class="bg-surface dark:bg-gray-800 rounded-lg p-5 shadow-sm">
      <div class="space-y-4 mb-4">
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="(preset, i) in datePresets" 
            :key="i" 
            class="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm rounded-md transition-colors"
            :class="selectedDatePreset === preset.value ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="selectDatePreset(preset.value)"
          >
            {{ preset.label }}
          </button>
        </div>
        
        <div v-if="showDatePicker" class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[150px]">
            <label class="text-xs mb-1 text-text-secondary dark:text-gray-400 block">Desde</label>
            <input 
              type="date" 
              v-model="startDate" 
              :max="formatDateForInput(endDate)"
              @change="onCustomDateChange"
              class="w-full p-2 border border-border dark:border-gray-600 rounded-md text-sm focus-ring dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="flex-1 min-w-[150px]">
            <label class="text-xs mb-1 text-text-secondary dark:text-gray-400 block">Hasta</label>
            <input 
              type="date" 
              v-model="endDate" 
              :min="formatDateForInput(startDate)"
              :max="formatDateForInput(new Date())"
              @change="onCustomDateChange"
              class="w-full p-2 border border-border dark:border-gray-600 rounded-md text-sm focus-ring dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
      
      <div 
        v-if="showAdvancedFilters" 
        class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-4 border-t border-border dark:border-gray-700"
      >
        <div>
          <label class="text-xs mb-1 text-text-secondary dark:text-gray-400 block">Categoría</label>
          <select 
            v-model="selectedCategory" 
            @change="applyFilters"
            class="w-full p-2 border border-border dark:border-gray-600 rounded-md text-sm focus-ring bg-surface dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todas</option>
            <option v-for="(category, i) in categories" :key="i" :value="category.value">
              {{ category.label }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="text-xs mb-1 text-text-secondary dark:text-gray-400 block">Estado</label>
          <select 
            v-model="selectedStatus" 
            @change="applyFilters"
            class="w-full p-2 border border-border dark:border-gray-600 rounded-md text-sm focus-ring bg-surface dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos</option>
            <option v-for="(status, i) in statuses" :key="i" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="text-xs mb-1 text-text-secondary dark:text-gray-400 block">Nivel de riesgo</label>
          <select 
            v-model="selectedRiskLevel" 
            @change="applyFilters"
            class="w-full p-2 border border-border dark:border-gray-600 rounded-md text-sm focus-ring bg-surface dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos</option>
            <option v-for="(risk, i) in riskLevels" :key="i" :value="risk.value">
              {{ risk.label }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="flex justify-end flex-wrap gap-2 mt-4">
        <button 
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-gray-100 dark:bg-gray-700 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
          @click="toggleAdvancedFilters"
        >
          <i :class="showAdvancedFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          {{ showAdvancedFilters ? 'Ocultar filtros' : 'Más filtros' }}
        </button>
        
        <button 
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-gray-100 dark:bg-gray-700 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
          @click="toggleDatePicker"
        >
          <i :class="showDatePicker ? 'fas fa-calendar-minus' : 'fas fa-calendar-alt'"></i>
          {{ showDatePicker ? 'Ocultar calendario' : 'Seleccionar fechas' }}
        </button>
        
        <button 
          v-if="hasActiveFilters"
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-red-50 dark:bg-red-900/30 text-error dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
          @click="clearFilters"
        >
          <i class="fas fa-times"></i>
          Limpiar filtros
        </button>
        
        <button 
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-primary text-white transition-colors hover:bg-primary-dark"
          @click="applyFilters"
        >
          <i class="fas fa-filter"></i>
          Aplicar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import moment from 'moment';

// Props
interface Props {
  initialDatePreset?: string;
  initialStartDate?: Date | string;
  initialEndDate?: Date | string;
  categories?: { label: string; value: string }[];
  statuses?: { label: string; value: string }[];
  riskLevels?: { label: string; value: string }[];
}

const props = withDefaults(defineProps<Props>(), {
  initialDatePreset: '30d',
  initialStartDate: () => moment().subtract(30, 'days').toDate(),
  initialEndDate: () => new Date(),
  categories: () => [],
  statuses: () => [],
  riskLevels: () => []
});

// Emits
const emit = defineEmits(['filter-change']);

// State
const selectedDatePreset = ref(props.initialDatePreset);
const startDate = ref(formatDateForInput(
  typeof props.initialStartDate === 'string' 
    ? new Date(props.initialStartDate) 
    : props.initialStartDate
));
const endDate = ref(formatDateForInput(
  typeof props.initialEndDate === 'string' 
    ? new Date(props.initialEndDate) 
    : props.initialEndDate
));
const selectedCategory = ref('');
const selectedStatus = ref('');
const selectedRiskLevel = ref('');
const showAdvancedFilters = ref(false);
const showDatePicker = ref(false);

// Date Presets
const datePresets = [
  { label: 'Última semana', value: '7d' },
  { label: 'Último mes', value: '30d' },
  { label: 'Último trimestre', value: '90d' },
  { label: 'Último año', value: '365d' },
  { label: 'Personalizado', value: 'custom' }
];

// Computed
const hasActiveFilters = computed(() => {
  return selectedCategory.value !== '' || 
         selectedStatus.value !== '' || 
         selectedRiskLevel.value !== '' ||
         selectedDatePreset.value !== '30d';
});

// Methods
function formatDateForInput(date: Date | string): string {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function selectDatePreset(preset: string) {
  selectedDatePreset.value = preset;
  
  if (preset !== 'custom') {
    let daysToSubtract = 30;
    
    switch (preset) {
      case '7d':
        daysToSubtract = 7;
        break;
      case '30d':
        daysToSubtract = 30;
        break;
      case '90d':
        daysToSubtract = 90;
        break;
      case '365d':
        daysToSubtract = 365;
        break;
    }
    
    startDate.value = formatDateForInput(moment().subtract(daysToSubtract, 'days').toDate());
    endDate.value = formatDateForInput(new Date());
    
    applyFilters();
  } else {
    showDatePicker.value = true;
  }
}

function onCustomDateChange() {
  selectedDatePreset.value = 'custom';
  applyFilters();
}

function toggleAdvancedFilters() {
  showAdvancedFilters.value = !showAdvancedFilters.value;
}

function toggleDatePicker() {
  showDatePicker.value = !showDatePicker.value;
  
  if (showDatePicker.value) {
    selectedDatePreset.value = 'custom';
  }
}

function clearFilters() {
  selectedDatePreset.value = '30d';
  startDate.value = formatDateForInput(moment().subtract(30, 'days').toDate());
  endDate.value = formatDateForInput(new Date());
  selectedCategory.value = '';
  selectedStatus.value = '';
  selectedRiskLevel.value = '';
  
  applyFilters();
}

function applyFilters() {
  const filters = {
    dateRange: {
      preset: selectedDatePreset.value,
      startDate: new Date(startDate.value),
      endDate: new Date(endDate.value)
    },
    category: selectedCategory.value,
    status: selectedStatus.value,
    riskLevel: selectedRiskLevel.value
  };
  
  emit('filter-change', filters);
}

// Watch for prop changes
watch(() => props.initialDatePreset, (newPreset) => {
  if (newPreset && newPreset !== selectedDatePreset.value) {
    selectDatePreset(newPreset);
  }
});

// Lifecycle hooks
onMounted(() => {
  applyFilters();
});
</script>

<style scoped>
/* Este componente utiliza clases de Tailwind directamente en el template */
</style> 