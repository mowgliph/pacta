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
      <button @click="showStats = !showStats" class="btn-text show-stats-btn">
        <i :class="showStats ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        {{ showStats ? 'Ocultar estadísticas detalladas' : 'Ver estadísticas detalladas' }}
      </button>
    </div>

    <!-- Estadísticas detalladas -->
    <contract-stats v-if="showStats && contractStore.contracts.length > 0" />

    <!-- Tabla de contratos -->
    <div class="contracts-table-container">
      <contracts-table 
        v-if="filteredContracts.length > 0"
        :contracts="filteredContracts" 
        :loading="contractStore.loading"
        @edit="editContract"
        @delete="confirmDelete"
        @view="viewContract"
        @document="downloadDocument"
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

    <!-- Vista detallada del contrato -->
    <div v-if="showContractDetail" class="contract-detail-overlay">
      <div class="contract-detail-content">
        <div class="contract-detail-header">
          <h2>Detalles del Contrato</h2>
          <button @click="closeContractDetail" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="contractStore.loading" class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Cargando detalles del contrato...</p>
        </div>

        <div v-else-if="contractDetail" class="contract-detail-body">
          <div class="detail-header">
            <div class="contract-title">
              <h3>{{ contractDetail.title }}</h3>
              <div class="contract-number">Nº {{ contractDetail.contractNumber }}</div>
              <div :class="['contract-status', `status-${contractDetail.status}`]">
                {{ getStatusLabel(contractDetail.status) }}
              </div>
            </div>
            <div class="detail-actions">
              <button @click="editContract(contractDetail)" class="btn-outline">
                <i class="fas fa-pencil-alt"></i> Editar
              </button>
              <div class="status-dropdown">
                <button class="btn-outline status-button">
                  <i class="fas fa-sync-alt"></i> Cambiar Estado
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="status-dropdown-content">
                  <button 
                    v-for="status in ['draft', 'active', 'expired', 'terminated', 'renewed'] as const" 
                    :key="status"
                    :class="['status-option', { 'active': contractDetail.status === status }]"
                    @click="changeContractStatus(contractDetail, status)"
                  >
                    <i v-if="contractDetail.status === status" class="fas fa-check"></i>
                    {{ getStatusLabel(status) }}
                  </button>
                </div>
              </div>
              <button @click="confirmDelete(contractDetail)" class="btn-outline btn-danger">
                <i class="fas fa-trash"></i> Eliminar
              </button>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-group">
              <div class="detail-label">Descripción</div>
              <div class="detail-value description">
                {{ contractDetail.description || 'Sin descripción' }}
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-group">
                <div class="detail-label">Fecha de inicio</div>
                <div class="detail-value">{{ formatDate(contractDetail.startDate) }}</div>
              </div>
              <div class="detail-group">
                <div class="detail-label">Fecha de fin</div>
                <div class="detail-value">{{ formatDate(contractDetail.endDate) }}</div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-group">
                <div class="detail-label">Importe</div>
                <div class="detail-value">{{ formatAmount(contractDetail.amount, contractDetail.currency) }}</div>
              </div>
              <div class="detail-group">
                <div class="detail-label">Notificación</div>
                <div class="detail-value">{{ contractDetail.notificationDays }} días antes</div>
              </div>
            </div>

            <div class="detail-document" v-if="contractDetail.documentPath">
              <div class="detail-label">Documento</div>
              <div class="document-info">
                <i class="fas fa-file-alt"></i>
                <span>{{ getDocumentName(contractDetail.documentPath) }}</span>
                <button @click="downloadDocument(contractDetail)" class="btn-text">
                  <i class="fas fa-download"></i> Descargar
                </button>
              </div>
            </div>

            <div class="detail-metadata">
              <div class="metadata-item">
                <div class="metadata-label">Creado por</div>
                <div class="metadata-value">
                  {{ contractDetail.creator ? contractDetail.creator.username : 'Usuario desconocido' }}
                </div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">Última modificación</div>
                <div class="metadata-value">
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

<style lang="scss" scoped>
@use './contracts.scss';
</style>