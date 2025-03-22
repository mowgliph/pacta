<template>
  <div class="contracts-container">
    <div class="contracts-header">
      <h1>Gestión de Contratos</h1>
      <button @click="openContractDialog" class="btn-primary">
        <i class="fas fa-plus"></i> Nuevo Contrato
      </button>
    </div>

    <!-- Filtros avanzados -->
    <div class="filters-container">
      <div class="search-filters">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchQuery"
            placeholder="Buscar por título o número de contrato..."
            @input="applyFilters"
          />
          <button 
            v-if="searchQuery" 
            @click="clearSearch" 
            class="clear-search"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="filter-toggles">
          <button 
            @click="showAdvancedFilters = !showAdvancedFilters" 
            class="btn-text"
          >
            <i :class="showAdvancedFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            Filtros avanzados
          </button>
          
          <button 
            v-if="hasActiveFilters" 
            @click="clearAllFilters" 
            class="btn-text"
          >
            <i class="fas fa-times"></i> Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Estado de contratos -->
      <div class="status-filters">
        <button 
          @click="toggleStatusFilter('all')" 
          :class="['status-filter', { active: selectedStatuses.length === 0 }]"
        >
          Todos
        </button>
        <button 
          @click="toggleStatusFilter('active')" 
          :class="['status-filter', 'status-active', { active: selectedStatuses.includes('active') }]"
        >
          Activos
        </button>
        <button 
          @click="toggleStatusFilter('draft')" 
          :class="['status-filter', 'status-draft', { active: selectedStatuses.includes('draft') }]"
        >
          Borradores
        </button>
        <button 
          @click="toggleStatusFilter('expired')" 
          :class="['status-filter', 'status-expired', { active: selectedStatuses.includes('expired') }]"
        >
          Vencidos
        </button>
        <button 
          @click="toggleStatusFilter('terminated')" 
          :class="['status-filter', 'status-terminated', { active: selectedStatuses.includes('terminated') }]"
        >
          Terminados
        </button>
        <button 
          @click="toggleStatusFilter('renewed')" 
          :class="['status-filter', 'status-renewed', { active: selectedStatuses.includes('renewed') }]"
        >
          Renovados
        </button>
      </div>

      <!-- Filtros avanzados -->
      <div v-if="showAdvancedFilters" class="advanced-filters">
        <div class="filter-grid">
          <div class="filter-group">
            <label>Fecha de inicio</label>
            <div class="date-range">
              <input 
                type="date" 
                v-model="dateFilters.startDateFrom" 
                placeholder="Desde" 
                @change="applyFilters"
              />
              <span>-</span>
              <input 
                type="date" 
                v-model="dateFilters.startDateTo" 
                placeholder="Hasta" 
                @change="applyFilters"
              />
            </div>
          </div>
          
          <div class="filter-group">
            <label>Fecha de fin</label>
            <div class="date-range">
              <input 
                type="date" 
                v-model="dateFilters.endDateFrom" 
                placeholder="Desde" 
                @change="applyFilters"
              />
              <span>-</span>
              <input 
                type="date" 
                v-model="dateFilters.endDateTo" 
                placeholder="Hasta" 
                @change="applyFilters"
              />
            </div>
          </div>
          
          <div class="filter-group">
            <label>Moneda</label>
            <select v-model="currencyFilter" @change="applyFilters">
              <option value="">Todas</option>
              <option value="CUP">CUP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Importe mínimo</label>
            <input 
              type="number" 
              v-model.number="amountFilter.min" 
              placeholder="Mínimo" 
              @input="applyFilters"
            />
          </div>
          
          <div class="filter-group">
            <label>Importe máximo</label>
            <input 
              type="number" 
              v-model.number="amountFilter.max" 
              placeholder="Máximo" 
              @input="applyFilters"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-summary" v-if="contractStore.contracts.length > 0">
      <div class="stat-item">
        <span class="stat-label">Total:</span>
        <span class="stat-value">{{ contractStore.contracts.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Activos:</span>
        <span class="stat-value">{{ contractStore.activeContracts.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Próximos a vencer:</span>
        <span class="stat-value">{{ contractStore.expiringContracts.length }}</span>
      </div>
    </div>

    <!-- Tabla de contratos -->
    <div class="contracts-table-container">
      <contracts-table 
        v-if="filteredContracts.length > 0"
        :contracts="filteredContracts" 
        :loading="contractStore.loading"
        @edit="editContract"
        @delete="confirmDelete"
      />
      <div v-else-if="!contractStore.loading" class="no-data-message">
        <i class="fas fa-folder-open"></i>
        <p>No se encontraron contratos con los filtros aplicados</p>
        <button @click="clearAllFilters" class="btn-primary">
          <i class="fas fa-sync"></i> Limpiar filtros
        </button>
      </div>
      <div v-else class="loading-container">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando contratos...</p>
      </div>
    </div>

    <!-- Modal para crear/editar contratos -->
    <contract-dialog
      v-model:visible="isDialogVisible"
      :contract="selectedContract"
      @save="saveContract"
    />

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteConfirm" class="delete-confirm-overlay">
      <div class="delete-confirm-dialog">
        <h3>Confirmar eliminación</h3>
        <p>¿Estás seguro de que deseas eliminar el contrato <strong>{{ contractToDelete?.title }}</strong>?</p>
        <p class="warning">Esta acción no se puede deshacer.</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false" class="btn-secondary">Cancelar</button>
          <button @click="deleteContract" class="btn-danger">Eliminar</button>
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
import { contractService } from '@/services/contract.service';
import type { Contract } from '@/stores/contract';
import type { ContractFilter } from '@/services/contract.service';
import { useToast } from '@/types/useToast';

const contractStore = useContractStore();
const toast = useToast();
const isDialogVisible = ref(false);
const selectedContract = ref<Contract | null>(null);
const searchQuery = ref('');
const showAdvancedFilters = ref(false);
const selectedStatuses = ref<string[]>([]);
const showDeleteConfirm = ref(false);
const contractToDelete = ref<Contract | null>(null);

// Filtros avanzados
const dateFilters = reactive({
  startDateFrom: '',
  startDateTo: '',
  endDateFrom: '',
  endDateTo: ''
});

const currencyFilter = ref('');
const amountFilter = reactive({
  min: null as number | null,
  max: null as number | null
});

// Computed para verificar si hay filtros activos
const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || 
    selectedStatuses.value.length > 0 || 
    dateFilters.startDateFrom !== '' ||
    dateFilters.startDateTo !== '' ||
    dateFilters.endDateFrom !== '' ||
    dateFilters.endDateTo !== '' ||
    currencyFilter.value !== '' ||
    amountFilter.min !== null ||
    amountFilter.max !== null;
});

// Computed para filtrar contratos
const filteredContracts = computed(() => {
  return contractStore.filteredContracts;
});

// Cargar contratos al montar el componente
onMounted(async () => {
  try {
    await applyFilters();
  } catch (error) {
    console.error('Error al cargar contratos:', error);
    toast.error('No se pudieron cargar los contratos. Por favor, intente de nuevo.');
  }
});

// Métodos para manejar filtros
function toggleStatusFilter(status: string) {
  if (status === 'all') {
    selectedStatuses.value = [];
    return;
  }
  
  const index = selectedStatuses.value.indexOf(status);
  if (index === -1) {
    selectedStatuses.value.push(status);
  } else {
    selectedStatuses.value.splice(index, 1);
  }
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
  amountFilter.min = null;
  amountFilter.max = null;
  
  // Volver a cargar todos los contratos sin filtros
  contractStore.fetchContracts();
}

async function applyFilters() {
  contractStore.setLoading(true);
  
  try {
    // Construir objeto de filtros para enviar al servidor
    const filters: ContractFilter = {};
    
    // Filtro de texto
    if (searchQuery.value.trim()) {
      filters.searchQuery = searchQuery.value.trim();
    }
    
    // Filtros de estado
    if (selectedStatuses.value.length > 0) {
      filters.status = selectedStatuses.value;
    }
    
    // Filtros de fecha
    if (dateFilters.startDateFrom) {
      filters.startDateFrom = dateFilters.startDateFrom;
    }
    
    if (dateFilters.startDateTo) {
      filters.startDateTo = dateFilters.startDateTo;
    }
    
    if (dateFilters.endDateFrom) {
      filters.endDateFrom = dateFilters.endDateFrom;
    }
    
    if (dateFilters.endDateTo) {
      filters.endDateTo = dateFilters.endDateTo;
    }
    
    // Filtro de moneda
    if (currencyFilter.value) {
      filters.currency = currencyFilter.value;
    }
    
    // Filtros de importe
    if (amountFilter.min !== null) {
      filters.minAmount = amountFilter.min;
    }
    
    if (amountFilter.max !== null) {
      filters.maxAmount = amountFilter.max;
    }
    
    // Enviar solicitud al servidor con los filtros
    await contractStore.fetchContractsWithFilters(filters);
  } catch (error) {
    console.error('Error al aplicar filtros:', error);
    toast.error('Error al aplicar los filtros. Por favor, intente de nuevo.');
  } finally {
    contractStore.setLoading(false);
  }
}

// Métodos para manejar contratos
function openContractDialog() {
  selectedContract.value = null;
  isDialogVisible.value = true;
}

function editContract(contract: Contract) {
  selectedContract.value = contract;
  isDialogVisible.value = true;
}

async function saveContract(contractData: Partial<Contract>) {
  try {
    if (selectedContract.value) {
      // Actualizar contrato existente
      await contractStore.updateContract(selectedContract.value.id, contractData);
      toast.success('Contrato actualizado correctamente');
    } else {
      // Crear nuevo contrato
      await contractStore.createContract(contractData);
      toast.success('Contrato creado correctamente');
    }
    isDialogVisible.value = false;
  } catch (error: any) {
    console.error('Error al guardar contrato:', error);
    toast.error(error.message || 'Error al guardar el contrato. Por favor, verifique los datos.');
  }
}

function confirmDelete(contract: Contract) {
  contractToDelete.value = contract;
  showDeleteConfirm.value = true;
}

async function deleteContract() {
  if (!contractToDelete.value) return;
  
  try {
    await contractStore.deleteContract(contractToDelete.value.id);
    toast.success('Contrato eliminado correctamente');
    showDeleteConfirm.value = false;
    contractToDelete.value = null;
  } catch (error: any) {
    console.error('Error al eliminar contrato:', error);
    toast.error(error.message || 'Error al eliminar el contrato. Por favor, intente de nuevo.');
  }
}
</script>

<style lang="scss" scoped>
@use './contracts.scss';
</style>