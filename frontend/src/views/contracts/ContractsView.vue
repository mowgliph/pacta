<template>
  <div class="p-6 bg-background dark:bg-gray-900">
    <div class="flex justify-between items-center mb-6 md:flex-row flex-col gap-4">
      <h1 class="text-2xl font-bold text-text-primary dark:text-white">Gestión de Contratos</h1>
      <button @click="openContractDialog" class="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 hover:bg-primary-dark transition-colors">
        <i class="fas fa-plus"></i> Nuevo Contrato
      </button>
    </div>

    <!-- Filtros avanzados -->
    <div class="bg-surface-variant dark:bg-gray-800 p-5 mb-6 rounded-lg shadow-sm border border-border dark:border-gray-700">
      <div class="flex md:flex-row flex-col gap-4 mb-4 items-center">
        <div class="relative flex-1 w-full">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary dark:text-gray-400"></i>
          <input
            v-model="searchQuery"
            placeholder="Buscar por título o número de contrato..."
            @input="applyFilters"
            class="pl-10 pr-10 py-2 border border-border dark:border-gray-600 rounded-md w-full bg-surface dark:bg-gray-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <button 
            v-if="searchQuery" 
            @click="clearSearch" 
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary dark:text-gray-400 hover:text-text-primary"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="flex gap-2 md:justify-end justify-center w-full md:w-auto">
          <button 
            @click="showAdvancedFilters = !showAdvancedFilters" 
            class="text-primary flex items-center gap-1 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <i :class="showAdvancedFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            Filtros avanzados
          </button>
          
          <button 
            v-if="hasActiveFilters" 
            @click="clearAllFilters" 
            class="text-error flex items-center gap-1 px-3 py-1.5 rounded-md text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <i class="fas fa-times"></i> Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Estado de contratos -->
      <div class="flex gap-2 mt-4 overflow-x-auto pb-2">
        <button 
          @click="toggleStatusFilter('all')" 
          class="px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap"
          :class="selectedStatuses.length === 0 ? 
            'bg-primary text-white' : 
            'bg-surface dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
        >
          Todos
        </button>
        <button 
          @click="toggleStatusFilter('active')" 
          class="px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap"
          :class="selectedStatuses.includes('active') ? 
            'bg-primary text-white' : 
            'bg-surface dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
        >
          Activos
        </button>
        <button 
          @click="toggleStatusFilter('draft')" 
          class="px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap"
          :class="selectedStatuses.includes('draft') ? 
            'bg-primary text-white' : 
            'bg-surface dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
        >
          Borradores
        </button>
        <button 
          @click="toggleStatusFilter('expired')" 
          class="px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap"
          :class="selectedStatuses.includes('expired') ? 
            'bg-primary text-white' : 
            'bg-surface dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
        >
          Vencidos
        </button>
        <button 
          @click="toggleStatusFilter('terminated')" 
          class="px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap"
          :class="selectedStatuses.includes('terminated') ? 
            'bg-primary text-white' : 
            'bg-surface dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
        >
          Terminados
        </button>
        <button 
          @click="toggleStatusFilter('renewed')" 
          class="px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap"
          :class="selectedStatuses.includes('renewed') ? 
            'bg-primary text-white' : 
            'bg-surface dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
        >
          Renovados
        </button>
      </div>

      <!-- Filtros avanzados -->
      <div v-if="showAdvancedFilters" class="mt-5 pt-5 border-t border-border dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm text-text-secondary dark:text-gray-400 mb-1">Fecha de inicio</label>
            <div class="flex gap-2 items-center">
              <input 
                type="date" 
                v-model="dateFilters.startDateFrom" 
                placeholder="Desde" 
                @change="applyFilters"
                class="px-3 py-1.5 border border-border dark:border-gray-600 rounded-md text-sm flex-1 bg-surface dark:bg-gray-700 dark:text-white"
              />
              <span class="text-text-secondary dark:text-gray-400">-</span>
              <input 
                type="date" 
                v-model="dateFilters.startDateTo" 
                placeholder="Hasta" 
                @change="applyFilters"
                class="px-3 py-1.5 border border-border dark:border-gray-600 rounded-md text-sm flex-1 bg-surface dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div class="flex flex-col gap-1">
            <label class="text-sm text-text-secondary dark:text-gray-400 mb-1">Fecha de fin</label>
            <div class="flex gap-2 items-center">
              <input 
                type="date" 
                v-model="dateFilters.endDateFrom" 
                placeholder="Desde" 
                @change="applyFilters"
                class="px-3 py-1.5 border border-border dark:border-gray-600 rounded-md text-sm flex-1 bg-surface dark:bg-gray-700 dark:text-white"
              />
              <span class="text-text-secondary dark:text-gray-400">-</span>
              <input 
                type="date" 
                v-model="dateFilters.endDateTo" 
                placeholder="Hasta" 
                @change="applyFilters"
                class="px-3 py-1.5 border border-border dark:border-gray-600 rounded-md text-sm flex-1 bg-surface dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div class="flex flex-col gap-1">
            <label class="text-sm text-text-secondary dark:text-gray-400 mb-1">Moneda</label>
            <select 
              v-model="currencyFilter" 
              @change="applyFilters"
              class="px-3 py-1.5 border border-border dark:border-gray-600 rounded-md text-sm bg-surface dark:bg-gray-700 dark:text-white appearance-none"
            >
              <option value="">Todas</option>
              <option value="CUP">CUP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          
          <div class="flex flex-col gap-1">
            <label class="text-sm text-text-secondary dark:text-gray-400 mb-1">Importe mínimo</label>
            <input 
              type="number" 
              v-model.number="amountFilter.min" 
              placeholder="Mínimo" 
              @input="applyFilters"
              class="px-3 py-1.5 border border-border dark:border-gray-600 rounded-md text-sm bg-surface dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div class="flex flex-col gap-1">
            <label class="text-sm text-text-secondary dark:text-gray-400 mb-1">Importe máximo</label>
            <input 
              type="number" 
              v-model.number="amountFilter.max" 
              placeholder="Máximo" 
              @input="applyFilters"
              class="px-3 py-1.5 border border-border dark:border-gray-600 rounded-md text-sm bg-surface dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="flex items-center flex-wrap gap-4 mb-6 bg-surface dark:bg-gray-800 p-4 rounded-lg shadow-sm" v-if="contractStore.contracts.length > 0">
      <div class="flex items-center gap-2">
        <span class="text-text-secondary dark:text-gray-400 text-sm">Total:</span>
        <span class="text-text-primary dark:text-white font-medium">{{ contractStore.contracts.length }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-text-secondary dark:text-gray-400 text-sm">Activos:</span>
        <span class="text-text-primary dark:text-white font-medium">{{ contractStore.activeContracts.length }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-text-secondary dark:text-gray-400 text-sm">Próximos a vencer:</span>
        <span class="text-text-primary dark:text-white font-medium">{{ contractStore.expiringContracts.length }}</span>
      </div>
      <button @click="showStats = !showStats" class="ml-auto text-primary flex items-center gap-1 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <i :class="showStats ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        {{ showStats ? 'Ocultar estadísticas detalladas' : 'Ver estadísticas detalladas' }}
      </button>
    </div>

    <!-- Estadísticas detalladas -->
    <contract-stats v-if="showStats && contractStore.contracts.length > 0" />

    <!-- Tabla de contratos -->
    <div class="bg-surface dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
      <contracts-table 
        v-if="filteredContracts.length > 0"
        :contracts="filteredContracts" 
        :loading="contractStore.loading"
        @edit="editContract"
        @delete="confirmDelete"
        @view="viewContract"
        @document="downloadDocument"
      />
      <div v-else-if="!contractStore.loading" class="flex flex-col items-center justify-center py-16 px-4 text-center">
        <i class="fas fa-folder-open text-5xl text-text-secondary dark:text-gray-400 mb-4"></i>
        <p class="text-text-secondary dark:text-gray-400 text-lg mb-6">No se encontraron contratos con los filtros aplicados</p>
        <button @click="clearAllFilters" class="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 hover:bg-primary-dark transition-colors">
          <i class="fas fa-sync"></i> Limpiar filtros
        </button>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-16 px-4 text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
        <p class="text-text-secondary dark:text-gray-400">Cargando contratos...</p>
      </div>
    </div>

    <!-- Modal para crear/editar contratos -->
    <contract-dialog
      v-model:visible="isDialogVisible"
      :contract="selectedContract"
      @save="saveContract"
    />

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-surface dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold text-text-primary dark:text-white mb-3">Confirmar eliminación</h3>
        <p class="text-text-primary dark:text-gray-200 mb-2">¿Estás seguro de que deseas eliminar el contrato <strong>{{ contractToDelete?.title }}</strong>?</p>
        <p class="text-error dark:text-red-400 text-sm mb-6">Esta acción no se puede deshacer.</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirm = false" class="px-4 py-2 border border-border dark:border-gray-600 rounded-md text-text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
          <button @click="deleteContract" class="px-4 py-2 bg-error text-white rounded-md hover:bg-red-600 transition-colors">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Vista detallada del contrato -->
    <div v-if="showContractDetail" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-surface dark:bg-gray-800 rounded-lg shadow-lg p-0 max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center p-4 border-b border-border dark:border-gray-700">
          <h2 class="text-xl font-semibold text-text-primary dark:text-white">Detalles del Contrato</h2>
          <button @click="closeContractDetail" class="text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="contractStore.loading" class="flex flex-col items-center justify-center py-16 px-4 text-center">
          <i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p class="text-text-secondary dark:text-gray-400">Cargando detalles del contrato...</p>
        </div>

        <div v-else-if="contractDetail" class="overflow-y-auto p-6">
          <div class="flex justify-between items-start flex-col md:flex-row gap-4 mb-6">
            <div class="flex-1">
              <h3 class="text-xl font-bold text-text-primary dark:text-white">{{ contractDetail.title }}</h3>
              <div class="text-primary font-medium">Nº {{ contractDetail.contractNumber }}</div>
              <div class="inline-flex px-2 py-1 mt-2 rounded-full text-sm font-medium" 
                :class="{
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': contractDetail.status === 'active',
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300': contractDetail.status === 'draft',
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': contractDetail.status === 'expired',
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400': contractDetail.status === 'terminated',
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': contractDetail.status === 'renewed'
                }">
                {{ getStatusLabel(contractDetail.status) }}
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button @click="editContract(contractDetail)" class="px-3 py-1.5 border border-border dark:border-gray-600 rounded-md text-text-primary dark:text-white flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <i class="fas fa-pencil-alt"></i> Editar
              </button>
              <div class="relative">
                <button class="px-3 py-1.5 border border-border dark:border-gray-600 rounded-md text-text-primary dark:text-white flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                  <i class="fas fa-sync-alt"></i> Cambiar Estado
                  <i class="fas fa-chevron-down text-xs ml-1"></i>
                </button>
                <div class="absolute right-0 mt-1 w-48 bg-surface dark:bg-gray-800 border border-border dark:border-gray-600 rounded-md shadow-lg z-10 hidden group-hover:block hover:block">
                  <button 
                    v-for="status in ['draft', 'active', 'expired', 'terminated', 'renewed'] as const" 
                    :key="status"
                    :class="['flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700', 
                    { 'bg-primary/10 dark:bg-primary/20': contractDetail.status === status }]"
                    @click="changeContractStatus(contractDetail, status)"
                  >
                    <i v-if="contractDetail.status === status" class="fas fa-check text-primary"></i>
                    <span v-else class="w-4"></span>
                    {{ getStatusLabel(status) }}
                  </button>
                </div>
              </div>
              <button @click="confirmDelete(contractDetail)" class="px-3 py-1.5 border border-error dark:border-red-800 rounded-md text-error dark:text-red-400 flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                <i class="fas fa-trash"></i> Eliminar
              </button>
            </div>
          </div>

          <div class="space-y-6">
            <div class="rounded-lg border border-border dark:border-gray-700 overflow-hidden">
              <div class="p-4 bg-gray-50 dark:bg-gray-750 border-b border-border dark:border-gray-700">
                <div class="text-sm font-medium text-text-secondary dark:text-gray-400">Descripción</div>
              </div>
              <div class="p-4 bg-surface dark:bg-gray-800">
                <div class="text-text-primary dark:text-gray-200 whitespace-pre-line">
                  {{ contractDetail.description || 'Sin descripción' }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="rounded-lg border border-border dark:border-gray-700 overflow-hidden">
                <div class="p-3 bg-gray-50 dark:bg-gray-750 border-b border-border dark:border-gray-700">
                  <div class="text-sm font-medium text-text-secondary dark:text-gray-400">Fecha de inicio</div>
                </div>
                <div class="p-3 bg-surface dark:bg-gray-800">
                  <div class="text-text-primary dark:text-gray-200">{{ formatDate(contractDetail.startDate) }}</div>
                </div>
              </div>
              <div class="rounded-lg border border-border dark:border-gray-700 overflow-hidden">
                <div class="p-3 bg-gray-50 dark:bg-gray-750 border-b border-border dark:border-gray-700">
                  <div class="text-sm font-medium text-text-secondary dark:text-gray-400">Fecha de fin</div>
                </div>
                <div class="p-3 bg-surface dark:bg-gray-800">
                  <div class="text-text-primary dark:text-gray-200">{{ formatDate(contractDetail.endDate) }}</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="rounded-lg border border-border dark:border-gray-700 overflow-hidden">
                <div class="p-3 bg-gray-50 dark:bg-gray-750 border-b border-border dark:border-gray-700">
                  <div class="text-sm font-medium text-text-secondary dark:text-gray-400">Importe</div>
                </div>
                <div class="p-3 bg-surface dark:bg-gray-800">
                  <div class="text-text-primary dark:text-gray-200 font-medium">{{ formatAmount(contractDetail.amount, contractDetail.currency) }}</div>
                </div>
              </div>
              <div class="rounded-lg border border-border dark:border-gray-700 overflow-hidden">
                <div class="p-3 bg-gray-50 dark:bg-gray-750 border-b border-border dark:border-gray-700">
                  <div class="text-sm font-medium text-text-secondary dark:text-gray-400">Notificación</div>
                </div>
                <div class="p-3 bg-surface dark:bg-gray-800">
                  <div class="text-text-primary dark:text-gray-200">{{ contractDetail.notificationDays }} días antes</div>
                </div>
              </div>
            </div>

            <div v-if="contractDetail.documentPath" class="rounded-lg border border-border dark:border-gray-700 overflow-hidden">
              <div class="p-3 bg-gray-50 dark:bg-gray-750 border-b border-border dark:border-gray-700">
                <div class="text-sm font-medium text-text-secondary dark:text-gray-400">Documento</div>
              </div>
              <div class="p-3 bg-surface dark:bg-gray-800">
                <div class="flex items-center gap-2">
                  <i class="fas fa-file-alt text-primary"></i>
                  <span class="text-text-primary dark:text-gray-200 flex-1">{{ getDocumentName(contractDetail.documentPath) }}</span>
                  <button @click="downloadDocument(contractDetail)" class="text-primary hover:text-primary-dark flex items-center gap-1 px-2 py-1 rounded-md hover:bg-primary/10 transition-colors">
                    <i class="fas fa-download"></i> Descargar
                  </button>
                </div>
              </div>
            </div>

            <div class="rounded-lg border border-border dark:border-gray-700 overflow-hidden">
              <div class="p-3 bg-gray-50 dark:bg-gray-750 border-b border-border dark:border-gray-700">
                <div class="text-sm font-medium text-text-secondary dark:text-gray-400">Información adicional</div>
              </div>
              <div class="p-3 bg-surface dark:bg-gray-800 divide-y divide-border dark:divide-gray-700">
                <div class="flex justify-between py-2">
                  <div class="text-sm text-text-secondary dark:text-gray-400">Creado por</div>
                  <div class="text-text-primary dark:text-gray-200">
                    {{ contractDetail.creator ? contractDetail.creator.username : 'Usuario desconocido' }}
                  </div>
                </div>
                <div class="flex justify-between py-2">
                  <div class="text-sm text-text-secondary dark:text-gray-400">Última modificación</div>
                  <div class="text-text-primary dark:text-gray-200">
                    {{ contractDetail.updatedAt ? formatDate(contractDetail.updatedAt) : 'Desconocida' }}
                    {{ contractDetail.modifier ? `por ${contractDetail.modifier.username}` : '' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useContractStore } from '@/stores/contract';
import ContractsTable from '@/components/modules/contracts/ContractsTable.vue';
import ContractDialog from '@/components/modules/contracts/ContractDialog.vue';
import ContractStats from '@/components/modules/contracts/ContractStats.vue';
import { contractService } from '@/services/contract.service';
import type { Contract } from '@/stores/contract';
import type { ContractFilter } from '@/services/contract.service';
import { useNotification } from '@/types/useNotification';
import { useRouter } from 'vue-router';

const router = useRouter();
const contractStore = useContractStore();
const notification = useNotification();

// Estados para los diálogos
const isDialogVisible = ref(false);
const selectedContract = ref<Contract | null>(null);
const showDeleteConfirm = ref(false);
const contractToDelete = ref<Contract | null>(null);
const showContractDetail = ref(false);
const contractDetail = ref<Contract | null>(null);

// Estados para los filtros
const searchQuery = ref('');
const showAdvancedFilters = ref(false);
const selectedStatuses = ref<string[]>([]);

// Filtros avanzados
const dateFilters = reactive({
  startDateFrom: '',
  startDateTo: '',
  endDateFrom: '',
  endDateTo: ''
});

const currencyFilter = ref('');
const amountFilter = reactive({
  min: undefined as number | undefined,
  max: undefined as number | undefined
});

// Estado para mostrar/ocultar estadísticas
const showStats = ref(false);

// Contratos filtrados
const filteredContracts = computed(() => {
  return contractStore.filteredContracts;
});

// Verificar si hay filtros activos
const hasActiveFilters = computed(() => {
  return (
    searchQuery.value !== '' || 
    selectedStatuses.value.length > 0 || 
    dateFilters.startDateFrom !== '' ||
    dateFilters.startDateTo !== '' ||
    dateFilters.endDateFrom !== '' ||
    dateFilters.endDateTo !== '' ||
    currencyFilter.value !== '' ||
    amountFilter.min !== undefined ||
    amountFilter.max !== undefined
  );
});

// Cargar contratos al montar el componente
onMounted(async () => {
  try {
    await contractStore.fetchContracts();
  } catch (error) {
    notification.error('Error al cargar los contratos');
  }
});

// Funciones para manejar filtros
function toggleStatusFilter(status: string) {
  if (status === 'all') {
    selectedStatuses.value = [];
  } else {
    const index = selectedStatuses.value.indexOf(status);
    if (index === -1) {
      selectedStatuses.value.push(status);
    } else {
      selectedStatuses.value.splice(index, 1);
    }
  }
  applyFilters();
}

function clearSearch() {
  searchQuery.value = '';
  applyFilters();
}

function clearAllFilters() {
  searchQuery.value = '';
  selectedStatuses.value = [];
  dateFilters.startDateFrom = '';
  dateFilters.startDateTo = '';
  dateFilters.endDateFrom = '';
  dateFilters.endDateTo = '';
  currencyFilter.value = '';
  amountFilter.min = undefined;
  amountFilter.max = undefined;
  
  // Recargar todos los contratos
  contractStore.fetchContracts();
}

async function applyFilters() {
  const filters: ContractFilter = {
    searchQuery: searchQuery.value,
    status: selectedStatuses.value.length > 0 ? selectedStatuses.value : undefined,
    startDateFrom: dateFilters.startDateFrom,
    startDateTo: dateFilters.startDateTo,
    endDateFrom: dateFilters.endDateFrom,
    endDateTo: dateFilters.endDateTo,
    currency: currencyFilter.value,
    minAmount: amountFilter.min,
    maxAmount: amountFilter.max
  };
  
  try {
    await contractStore.fetchContractsWithFilters(filters);
  } catch (error) {
    notification.error('Error al aplicar los filtros');
  }
}

// Funciones para manejar contratos
function openContractDialog() {
  selectedContract.value = null;
  isDialogVisible.value = true;
}

function editContract(contract: Contract) {
  selectedContract.value = contract;
  isDialogVisible.value = true;
  // Si estamos en la vista detallada, la cerramos
  if (showContractDetail.value) {
    showContractDetail.value = false;
  }
}

async function saveContract(data: any) {
  try {
    if (data.formData.id) {
      // Actualizar contrato existente
      await contractStore.updateContract(
        data.formData.id, 
        data.formData, 
        data.documentFile
      );
      notification.success('Contrato actualizado correctamente');
    } else {
      // Crear nuevo contrato
      await contractStore.createContract(data.formData, data.documentFile);
      notification.success('Contrato creado correctamente');
    }
    
    isDialogVisible.value = false;
    selectedContract.value = null;
    
    // Si estamos en la vista detallada, actualizar los datos
    if (showContractDetail.value && contractDetail.value) {
      contractDetail.value = contractStore.currentContract;
    }
  } catch (error: any) {
    notification.error(`Error: ${error.message}`);
  }
}

function confirmDelete(contract: Contract) {
  contractToDelete.value = contract;
  showDeleteConfirm.value = true;
}

async function deleteContract() {
  if (!contractToDelete.value) return;
  
  const deletedContractId = contractToDelete.value.id;
  
  try {
    await contractStore.deleteContract(deletedContractId);
    notification.success('Contrato eliminado correctamente');
    
    // Cerrar todos los diálogos
    showDeleteConfirm.value = false;
    contractToDelete.value = null;
    
    // Si estamos en la vista detallada y es el contrato que estamos viendo, cerrarla
    if (showContractDetail.value && contractDetail.value && contractDetail.value.id === deletedContractId) {
      showContractDetail.value = false;
      contractDetail.value = null;
    }
  } catch (error) {
    notification.error('Error al eliminar el contrato');
  }
}

async function viewContract(contract: Contract) {
  try {
    showContractDetail.value = true;
    
    // Cargar los detalles completos del contrato
    const detailedContract = await contractStore.fetchContractById(contract.id);
    contractDetail.value = detailedContract;
  } catch (error) {
    notification.error('Error al cargar los detalles del contrato');
    showContractDetail.value = false;
  }
}

function downloadDocument(contract: Contract) {
  if (!contract.documentPath) {
    notification.info('Este contrato no tiene documento adjunto');
    return;
  }
  
  contractStore.downloadContractDocument(contract.id)
    .then(() => {
      notification.success('Documento descargado correctamente');
    })
    .catch(error => {
      notification.error(error.message);
    });
}

function closeContractDetail() {
  showContractDetail.value = false;
  contractDetail.value = null;
}

// Funciones auxiliares
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    'draft': 'Borrador',
    'active': 'Activo',
    'expired': 'Vencido',
    'terminated': 'Terminado',
    'renewed': 'Renovado'
  };
  return statusMap[status] || status;
}

function getDocumentName(path: string) {
  if (!path) return '';
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function changeContractStatus(contract: Contract, newStatus: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed') {
  try {
    contractStore.changeContractStatus(contract.id, newStatus);
    notification.success(`Estado del contrato actualizado a ${getStatusLabel(newStatus)}`);
  } catch (error) {
    notification.error('Error al cambiar el estado del contrato');
  }
}
</script>