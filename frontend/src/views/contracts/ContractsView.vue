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
        :contracts="filteredContracts" 
        :loading="contractStore.loading"
        @edit="editContract"
        @delete="confirmDelete"
      />
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

const contractStore = useContractStore();
const isDialogVisible = ref(false);
const selectedContract = ref(null);
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
  let contracts = contractStore.contracts;
  
  // Filtros de texto
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    contracts = contracts.filter(contract => 
      contract.title.toLowerCase().includes(query) || 
      contract.contractNumber.toLowerCase().includes(query) ||
      contract.description?.toLowerCase().includes(query)
    );
  }
  
  // Filtros de estado
  if (selectedStatuses.value.length > 0) {
    contracts = contracts.filter(contract => 
      selectedStatuses.value.includes(contract.status)
    );
  }
  
  // Filtros de fecha
  if (dateFilters.startDateFrom) {
    contracts = contracts.filter(contract => 
      new Date(contract.startDate) >= new Date(dateFilters.startDateFrom)
    );
  }
  
  if (dateFilters.startDateTo) {
    contracts = contracts.filter(contract => 
      new Date(contract.startDate) <= new Date(dateFilters.startDateTo)
    );
  }
  
  if (dateFilters.endDateFrom) {
    contracts = contracts.filter(contract => 
      new Date(contract.endDate) >= new Date(dateFilters.endDateFrom)
    );
  }
  
  if (dateFilters.endDateTo) {
    contracts = contracts.filter(contract => 
      new Date(contract.endDate) <= new Date(dateFilters.endDateTo)
    );
  }
  
  // Filtro de moneda
  if (currencyFilter.value) {
    contracts = contracts.filter(contract => 
      contract.currency === currencyFilter.value
    );
  }
  
  // Filtros de importe
  if (amountFilter.min !== null) {
    contracts = contracts.filter(contract => 
      contract.amount >= amountFilter.min!
    );
  }
  
  if (amountFilter.max !== null) {
    contracts = contracts.filter(contract => 
      contract.amount <= amountFilter.max!
    );
  }
  
  return contracts;
});

// Cargar contratos al montar el componente
onMounted(async () => {
  try {
    await contractStore.fetchContracts();
  } catch (error) {
    console.error('Error al cargar contratos:', error);
    // Aquí se podría mostrar una notificación al usuario
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
}

function applyFilters() {
  // Esta función puede usarse en el futuro para aplicar filtros al servidor
  // Por ahora usamos computed para filtrar localmente
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
    } else {
      // Crear nuevo contrato
      await contractStore.createContract(contractData);
    }
    isDialogVisible.value = false;
  } catch (error) {
    console.error('Error al guardar contrato:', error);
    // Aquí se podría mostrar una notificación al usuario
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
    showDeleteConfirm.value = false;
    contractToDelete.value = null;
  } catch (error) {
    console.error('Error al eliminar contrato:', error);
    // Aquí se podría mostrar una notificación al usuario
  }
}
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;
@use '../../styles/typography' as t;

.contracts-container {
  padding: v.$spacing-unit * 4;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contracts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: v.$spacing-unit * 4;

  h1 {
    @include t.heading-1;
    margin: 0;
  }
}

.filters-container {
  background-color: var(--color-surface);
  border-radius: v.$border-radius-md;
  padding: v.$spacing-unit * 3;
  margin-bottom: v.$spacing-unit * 3;
  box-shadow: v.$shadow-sm;
}

.search-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: v.$spacing-unit * 3;
  flex-wrap: wrap;
  gap: v.$spacing-unit * 2;
  
  .search-box {
    flex: 1;
    position: relative;
    min-width: 250px;
    
    .search-icon {
      position: absolute;
      left: v.$spacing-unit * 2;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-secondary);
    }
    
    input {
      @include m.input;
      padding-left: v.$spacing-unit * 8;
      padding-right: v.$spacing-unit * 6;
    }
    
    .clear-search {
      position: absolute;
      right: v.$spacing-unit * 2;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      
      &:hover {
        color: v.$color-danger;
      }
    }
  }
  
  .filter-toggles {
    display: flex;
    gap: v.$spacing-unit * 2;
  }
}

.status-filters {
  display: flex;
  gap: v.$spacing-unit;
  flex-wrap: wrap;
  margin-bottom: v.$spacing-unit * 3;
  
  .status-filter {
    background: transparent;
    border: 1px solid var(--color-border);
    padding: v.$spacing-unit v.$spacing-unit * 2;
    border-radius: v.$border-radius-pill;
    cursor: pointer;
    transition: all v.$transition-normal;
    font-size: 0.9rem;
    
    &:hover {
      background-color: v.$color-bg-hover;
    }
    
    &.active {
      background-color: var(--color-primary-light);
      border-color: var(--color-primary);
      color: var(--color-primary-dark);
    }
    
    &.status-active.active {
      background-color: rgba(c.$color-success, 0.1);
      border-color: c.$color-success;
      color: c.$color-success;
    }
    
    &.status-draft.active {
      background-color: rgba(c.$color-warning, 0.1);
      border-color: c.$color-warning;
      color: c.$color-warning;
    }
    
    &.status-expired.active {
      background-color: rgba(v.$color-danger, 0.1);
      border-color: v.$color-danger;
      color: v.$color-danger;
    }
    
    &.status-terminated.active {
      background-color: rgba(c.$color-secondary, 0.1);
      border-color: c.$color-secondary;
      color: c.$color-secondary;
    }
    
    &.status-renewed.active {
      background-color: rgba(c.$color-info, 0.1);
      border-color: c.$color-info;
      color: c.$color-info;
    }
  }
}

.advanced-filters {
  background-color: v.$color-bg-light;
  padding: v.$spacing-unit * 3;
  border-radius: v.$border-radius;
  margin-top: v.$spacing-unit * 2;
  
  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: v.$spacing-unit * 3;
  }
  
  .filter-group {
    label {
      display: block;
      margin-bottom: v.$spacing-unit;
      font-weight: 500;
    }
    
    input, select {
      @include m.input;
    }
    
    .date-range {
      display: flex;
      align-items: center;
      gap: v.$spacing-unit;
      
      input {
        flex: 1;
        min-width: 0;
      }
      
      span {
        color: v.$color-text-light;
      }
    }
  }
}

.stats-summary {
  display: flex;
  flex-wrap: wrap;
  gap: v.$spacing-unit * 3;
  margin-bottom: v.$spacing-unit * 3;
  
  .stat-item {
    background-color: var(--color-surface);
    padding: v.$spacing-unit * 2 v.$spacing-unit * 3;
    border-radius: v.$border-radius-md;
    box-shadow: v.$shadow-sm;
    transition: transform v.$transition-normal, box-shadow v.$transition-normal;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: v.$shadow-md;
    }
    
    .stat-label {
      color: var(--color-text-secondary);
      margin-right: v.$spacing-unit;
    }
    
    .stat-value {
      font-weight: v.$font-weight-semibold;
      font-size: 1.1rem;
      color: var(--color-text-primary);
    }
  }
}

.contracts-table-container {
  background-color: var(--color-surface);
  border-radius: v.$border-radius-md;
  flex: 1;
  box-shadow: v.$shadow-sm;
  overflow: hidden;
}

.delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  backdrop-filter: blur(2px);
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .delete-confirm-dialog {
    background-color: var(--color-surface);
    border-radius: v.$border-radius-md;
    padding: v.$spacing-unit * 4;
    width: 100%;
    max-width: 400px;
    box-shadow: v.$shadow-lg;
    animation: slideUp 0.3s ease;
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: v.$spacing-unit * 2;
      color: var(--color-text-primary);
      font-weight: v.$font-weight-semibold;
    }
    
    .warning {
      color: v.$color-danger;
      font-weight: v.$font-weight-medium;
      margin-bottom: v.$spacing-unit * 3;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: v.$spacing-unit * 2;
    }
  }
}

.btn-primary {
  @include m.button-primary;
  display: flex;
  align-items: center;
  gap: v.$spacing-unit;
  
  i {
    font-size: 0.9rem;
  }
}

.btn-secondary {
  @include m.button-outline;
}

.btn-danger {
  background-color: v.$color-danger;
  color: white;
  border: none;
  padding: v.$spacing-unit * 1.5 v.$spacing-unit * 3;
  border-radius: v.$border-radius;
  cursor: pointer;
  transition: all v.$transition-normal;
  font-weight: v.$font-weight-medium;
  
  &:hover {
    background-color: darken(v.$color-danger, 10%);
  }
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: v.$spacing-unit v.$spacing-unit * 2;
  transition: color v.$transition-fast;
  font-weight: v.$font-weight-medium;
  
  &:hover {
    text-decoration: none;
    color: c.$color-primary-dark;
  }
  
  i {
    margin-right: v.$spacing-unit;
  }
}

// Responsive
@media (max-width: v.$breakpoint-md) {
  .contracts-header {
    flex-direction: column;
    align-items: flex-start;
    gap: v.$spacing-unit * 2;
  }
  
  .filters-container {
    padding: v.$spacing-unit * 2;
  }
  
  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-grid {
    grid-template-columns: 1fr !important;
  }
  
  .status-filters {
    overflow-x: auto;
    padding-bottom: v.$spacing-unit;
    
    .status-filter {
      white-space: nowrap;
    }
  }
}
</style>