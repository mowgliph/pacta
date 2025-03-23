<template>
  <div class="w-full relative">
    <!-- Estado de carga -->
    <div v-if="loading" class="py-10 flex flex-col items-center justify-center text-text-secondary">
      <i class="fas fa-spinner fa-spin text-3xl mb-2 text-primary animate-spin"></i>
      <span>Cargando contratos...</span>
    </div>
    
    <!-- Estado sin datos -->
    <div v-else-if="!contracts || contracts.length === 0" class="py-10 text-center text-text-secondary">
      <i class="fas fa-file-contract text-5xl mb-3 opacity-50 text-primary"></i>
      <h3 class="mb-1 text-text-primary">No hay contratos disponibles</h3>
      <p>No se encontraron contratos que coincidan con los criterios de búsqueda.</p>
    </div>
    
    <!-- Tabla de contratos -->
    <template v-else>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('contractNumber')" 
                  class="cursor-pointer whitespace-nowrap relative hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  :class="{ 'text-primary': currentSort === 'contractNumber' }">
                Número 
                <i :class="[getSortIconClass('contractNumber'), 'text-sm ml-1 opacity-70']"></i>
                <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"
                     :class="{ 'w-full': currentSort === 'contractNumber' }"></div>
              </th>
              <th @click="sortBy('title')" 
                  class="cursor-pointer whitespace-nowrap relative hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  :class="{ 'text-primary': currentSort === 'title' }">
                Título
                <i :class="[getSortIconClass('title'), 'text-sm ml-1 opacity-70']"></i>
                <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"
                     :class="{ 'w-full': currentSort === 'title' }"></div>
              </th>
              <th @click="sortBy('startDate')" 
                  class="cursor-pointer whitespace-nowrap relative hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  :class="{ 'text-primary': currentSort === 'startDate' }">
                Fecha Inicio
                <i :class="[getSortIconClass('startDate'), 'text-sm ml-1 opacity-70']"></i>
                <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"
                     :class="{ 'w-full': currentSort === 'startDate' }"></div>
              </th>
              <th @click="sortBy('endDate')" 
                  class="cursor-pointer whitespace-nowrap relative hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  :class="{ 'text-primary': currentSort === 'endDate' }">
                Fecha Fin
                <i :class="[getSortIconClass('endDate'), 'text-sm ml-1 opacity-70']"></i>
                <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"
                     :class="{ 'w-full': currentSort === 'endDate' }"></div>
              </th>
              <th @click="sortBy('status')" 
                  class="cursor-pointer whitespace-nowrap relative hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  :class="{ 'text-primary': currentSort === 'status' }">
                Estado
                <i :class="[getSortIconClass('status'), 'text-sm ml-1 opacity-70']"></i>
                <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"
                     :class="{ 'w-full': currentSort === 'status' }"></div>
              </th>
              <th @click="sortBy('amount')" 
                  class="cursor-pointer whitespace-nowrap relative hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  :class="{ 'text-primary': currentSort === 'amount' }">
                Importe
                <i :class="[getSortIconClass('amount'), 'text-sm ml-1 opacity-70']"></i>
                <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"
                     :class="{ 'w-full': currentSort === 'amount' }"></div>
              </th>
              <th class="text-center">Doc</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contract in displayedContracts" 
                :key="contract.id" 
                class="border-b border-border transition-colors hover:bg-gray-50 dark:hover:bg-surface-hover last:border-b-0">
              <td class="p-3 font-mono text-primary font-medium">{{ contract.contractNumber }}</td>
              <td class="p-3 font-medium text-text-primary">{{ contract.title }}</td>
              <td class="p-3">{{ formatDate(contract.startDate) }}</td>
              <td class="p-3">{{ formatDate(contract.endDate) }}</td>
              <td class="p-3">
                <StatusBadge :status="contract.status" />
              </td>
              <td class="p-3">{{ formatCurrency(contract.amount, contract.currency) }}</td>
              <td class="p-3 text-center">
                <button 
                  v-if="contract.documentPath" 
                  @click="$emit('document', contract)" 
                  class="w-9 h-9 rounded-full flex items-center justify-center transition-colors text-primary hover:bg-primary/10"
                  title="Descargar documento">
                  <i class="fas fa-file-download"></i>
                </button>
                <span v-else class="opacity-50 inline-block" title="Sin documento">
                  <i class="fas fa-file-alt text-text-secondary"></i>
                </span>
              </td>
              <td class="p-3">
                <div class="flex justify-end gap-1">
                  <button @click="$emit('view', contract); showContractDetails(contract)" 
                          class="w-9 h-9 rounded-full flex items-center justify-center relative overflow-hidden text-info hover:text-info-dark group" 
                          title="Ver detalles">
                    <span class="absolute inset-0 bg-info/0 group-hover:bg-info/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform"></span>
                    <i class="fas fa-eye relative z-10"></i>
                  </button>
                  <button @click="$emit('edit', contract)" 
                          class="w-9 h-9 rounded-full flex items-center justify-center relative overflow-hidden text-primary hover:text-primary-dark group" 
                          title="Editar">
                    <span class="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform"></span>
                    <i class="fas fa-edit relative z-10"></i>
                  </button>
                  <button @click="$emit('delete', contract)" 
                          class="w-9 h-9 rounded-full flex items-center justify-center relative overflow-hidden text-error hover:text-error-dark group" 
                          title="Eliminar">
                    <span class="absolute inset-0 bg-error/0 group-hover:bg-error/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform"></span>
                    <i class="fas fa-trash-alt relative z-10"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginación -->
      <div class="flex justify-between items-center p-3 border-t border-border bg-surface rounded-b-md sm:flex-row flex-col gap-2">
        <div class="text-text-secondary text-sm">
          Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredContracts.length) }} de {{ filteredContracts.length }} contratos
        </div>
        <div class="flex items-center gap-1">
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="w-9 h-9 flex items-center justify-center rounded border border-border bg-transparent cursor-pointer transition-all hover:bg-gray-100 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-surface-hover"
            title="Primera página">
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="w-9 h-9 flex items-center justify-center rounded border border-border bg-transparent cursor-pointer transition-all hover:bg-gray-100 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-surface-hover"
            title="Página anterior">
            <i class="fas fa-angle-left"></i>
          </button>
          
          <div class="flex gap-1">
            <button 
              v-for="page in displayedPages" 
              :key="page"
              @click="currentPage = page" 
              class="w-9 h-9 flex items-center justify-center rounded border border-border bg-transparent cursor-pointer transition-all text-sm"
              :class="currentPage === page ? 'bg-primary text-white border-primary font-medium' : 'hover:bg-gray-100 hover:border-primary hover:text-primary dark:hover:bg-surface-hover'">
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="w-9 h-9 flex items-center justify-center rounded border border-border bg-transparent cursor-pointer transition-all hover:bg-gray-100 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-surface-hover"
            title="Página siguiente">
            <i class="fas fa-angle-right"></i>
          </button>
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage === totalPages"
            class="w-9 h-9 flex items-center justify-center rounded border border-border bg-transparent cursor-pointer transition-all hover:bg-gray-100 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-surface-hover"
            title="Última página">
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
        <div>
          <select 
            v-model="itemsPerPage"
            class="p-1.5 px-2 border border-border rounded bg-surface text-sm text-text-primary cursor-pointer transition-all hover:border-primary focus:border-primary focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%228%22%20height%3D%226%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22%23666%22%20d%3D%22M7%201.5%204%204.5%201%201.5%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center]">
            <option :value="5">5 por página</option>
            <option :value="10">10 por página</option>
            <option :value="20">20 por página</option>
            <option :value="50">50 por página</option>
          </select>
        </div>
      </div>
    </template>
    
    <!-- Modal de detalles del contrato -->
    <div v-if="selectedContract" 
         class="fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-fadeIn backdrop-blur-sm">
      <div class="bg-surface rounded-lg w-[90%] max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl animate-slideInUp">
        <div class="p-4 flex justify-between items-center border-b border-border">
          <h2 class="m-0 text-text-primary font-semibold">Detalles del Contrato</h2>
          <button @click="selectedContract = null" 
                  class="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100 hover:text-primary dark:hover:bg-surface-hover">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div class="mb-4">
            <h3 class="mt-0 mb-3 pb-2 border-b border-border text-primary font-medium">Información General</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span class="block text-text-secondary mb-1 text-sm">Número de Contrato:</span>
                <span class="font-medium text-text-primary">{{ selectedContract.contractNumber }}</span>
              </div>
              <div>
                <span class="block text-text-secondary mb-1 text-sm">Título:</span>
                <span class="font-medium text-text-primary">{{ selectedContract.title }}</span>
              </div>
              <div>
                <span class="block text-text-secondary mb-1 text-sm">Estado:</span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium"
                      :class="{
                        'bg-success/10 text-success': selectedContract.status === 'active',
                        'bg-error/10 text-error': selectedContract.status === 'expired',
                        'bg-warning/10 text-warning': selectedContract.status === 'draft',
                        'bg-secondary/10 text-secondary': selectedContract.status === 'terminated',
                        'bg-info/10 text-info': selectedContract.status === 'renewed'
                      }">
                  <span class="w-1.5 h-1.5 rounded-full mr-1"
                        :class="{
                          'bg-success': selectedContract.status === 'active',
                          'bg-error': selectedContract.status === 'expired',
                          'bg-warning': selectedContract.status === 'draft',
                          'bg-secondary': selectedContract.status === 'terminated',
                          'bg-info': selectedContract.status === 'renewed'
                        }"></span>
                  {{ getStatusText(selectedContract.status) }}
                </span>
              </div>
              <div>
                <span class="block text-text-secondary mb-1 text-sm">Fecha de Inicio:</span>
                <span class="font-medium text-text-primary">{{ formatDate(selectedContract.startDate) }}</span>
              </div>
              <div>
                <span class="block text-text-secondary mb-1 text-sm">Fecha de Fin:</span>
                <span class="font-medium text-text-primary">{{ formatDate(selectedContract.endDate) }}</span>
              </div>
              <div>
                <span class="block text-text-secondary mb-1 text-sm">Importe:</span>
                <span class="font-medium text-text-primary">{{ formatCurrency(selectedContract.amount, selectedContract.currency) }}</span>
              </div>
              <div>
                <span class="block text-text-secondary mb-1 text-sm">Días de Notificación:</span>
                <span class="font-medium text-text-primary">{{ selectedContract.notificationDays }}</span>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <h3 class="mt-0 mb-3 pb-2 border-b border-border text-primary font-medium">Descripción</h3>
            <p class="whitespace-pre-line leading-relaxed text-text-primary">{{ selectedContract.description || 'Sin descripción' }}</p>
          </div>
          
          <div>
            <h3 class="mt-0 mb-3 pb-2 border-b border-border text-primary font-medium">Documentos</h3>
            <div v-if="selectedContract.documentPath" class="flex items-center gap-2 mt-2">
              <i class="fas fa-file-pdf text-error"></i>
              <a :href="selectedContract.documentPath" target="_blank" class="text-primary no-underline hover:underline transition-colors hover:text-primary-dark">Ver documento adjunto</a>
            </div>
            <p v-else>No hay documentos adjuntos</p>
          </div>
        </div>
        
        <div class="p-4 flex justify-end gap-2 border-t border-border bg-gray-50 dark:bg-surface-hover">
          <button @click="$emit('edit', selectedContract); selectedContract = null" 
                  class="bg-primary text-white border-none py-1.5 px-3 rounded cursor-pointer transition-all hover:bg-primary-dark flex items-center gap-1 font-medium">
            <i class="fas fa-edit text-sm"></i> Editar
          </button>
          <button @click="$emit('delete', selectedContract); selectedContract = null" 
                  class="bg-error text-white border-none py-1.5 px-3 rounded cursor-pointer transition-all hover:bg-error-dark flex items-center gap-1 font-medium">
            <i class="fas fa-trash-alt text-sm"></i> Eliminar
          </button>
          <button @click="selectedContract = null" 
                  class="bg-transparent text-text-primary border border-border py-1.5 px-3 rounded cursor-pointer transition-all hover:border-primary hover:text-primary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Contract } from '@/stores/contract';
import StatusBadge from '@/components/base/StatusBadge.vue';

// Props
const props = defineProps<{
  contracts: Contract[];
  loading: boolean;
}>();

// Emits
defineEmits<{
  (e: 'edit', contract: Contract): void;
  (e: 'delete', contract: Contract): void;
  (e: 'view', contract: Contract): void;
  (e: 'document', contract: Contract): void;
}>();

// Referencias reactivas
const currentSort = ref('updatedAt');
const sortOrder = ref<'asc' | 'desc'>('desc');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const selectedContract = ref<Contract | null>(null);

// Resetear página cuando cambian los contratos
watch(() => props.contracts, () => {
  currentPage.value = 1;
});

// Función para obtener el ícono de ordenación
function getSortIconClass(field: string) {
  if (field !== currentSort.value) {
    return 'fas fa-sort';
  }
  return sortOrder.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
}

// Función para ordenar los contratos
function sortBy(field: string) {
  if (currentSort.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.value = field;
    sortOrder.value = 'asc';
  }
}

// Contratos ordenados
const sortedContracts = computed(() => {
  return [...props.contracts].sort((a, b) => {
    let aValue: any = a[currentSort.value as keyof Contract];
    let bValue: any = b[currentSort.value as keyof Contract];
    
    // Convertir fechas a objetos Date para comparar
    if (currentSort.value === 'startDate' || currentSort.value === 'endDate' || currentSort.value === 'updatedAt' || currentSort.value === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Convertir a minúsculas para strings para comparar sin distinguir mayúsculas
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    // Realizar la comparación según el orden
    if (aValue < bValue) {
      return sortOrder.value === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder.value === 'asc' ? 1 : -1;
    }
    return 0;
  });
});

// Contratos filtrados (en este caso, simplemente los ordenados)
const filteredContracts = computed(() => {
  return sortedContracts.value;
});

// Total de páginas
const totalPages = computed(() => {
  return Math.ceil(filteredContracts.value.length / itemsPerPage.value);
});

// Contratos a mostrar en la página actual
const displayedContracts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredContracts.value.slice(start, end);
});

// Páginas a mostrar en la paginación
const displayedPages = computed(() => {
  const pages = [];
  let startPage = Math.max(1, currentPage.value - 2);
  let endPage = Math.min(totalPages.value, startPage + 4);
  
  // Ajustar startPage si endPage está al límite
  if (endPage === totalPages.value) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Formatear fecha
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Formatear moneda
function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

// Obtener texto según el estado
function getStatusText(status: string) {
  const statusTexts: Record<string, string> = {
    'draft': 'Borrador',
    'active': 'Activo',
    'expired': 'Vencido',
    'terminated': 'Terminado',
    'renewed': 'Renovado'
  };
  return statusTexts[status] || status;
}

function showContractDetails(contract: Contract) {
  selectedContract.value = contract;
}
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease;
}

.animate-slideInUp {
  animation: slideInUp 0.3s ease;
}

@media (max-width: 768px) {
  th {
    display: none;
  }
  
  tbody tr {
    @apply block mb-3 border border-border rounded p-2;
  }
  
  td {
    @apply flex justify-between items-center py-1.5 text-right border-b border-border border-dashed;
  }
  
  td:last-child {
    @apply border-b-0 justify-end;
  }
  
  td:before {
    content: attr(data-label);
    @apply font-medium text-left text-text-secondary;
  }
}
</style>