<template>
  <div class="contracts-table">
    <div v-if="loading" class="loading-indicator">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Cargando contratos...</span>
    </div>
    
    <div v-else-if="!contracts || contracts.length === 0" class="no-data">
      <i class="fas fa-file-contract no-data-icon"></i>
      <h3>No hay contratos disponibles</h3>
      <p>No se encontraron contratos que coincidan con los criterios de búsqueda.</p>
    </div>
    
    <template v-else>
      <table>
        <thead>
          <tr>
            <th @click="sortBy('contractNumber')" :class="{ active: currentSort === 'contractNumber' }">
              Número 
              <i :class="getSortIconClass('contractNumber')"></i>
            </th>
            <th @click="sortBy('title')" :class="{ active: currentSort === 'title' }">
              Título
              <i :class="getSortIconClass('title')"></i>
            </th>
            <th @click="sortBy('startDate')" :class="{ active: currentSort === 'startDate' }">
              Fecha Inicio
              <i :class="getSortIconClass('startDate')"></i>
            </th>
            <th @click="sortBy('endDate')" :class="{ active: currentSort === 'endDate' }">
              Fecha Fin
              <i :class="getSortIconClass('endDate')"></i>
            </th>
            <th @click="sortBy('status')" :class="{ active: currentSort === 'status' }">
              Estado
              <i :class="getSortIconClass('status')"></i>
            </th>
            <th @click="sortBy('amount')" :class="{ active: currentSort === 'amount' }">
              Importe
              <i :class="getSortIconClass('amount')"></i>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in displayedContracts" :key="contract.id">
            <td class="contract-number">{{ contract.contractNumber }}</td>
            <td class="contract-title">{{ contract.title }}</td>
            <td>{{ formatDate(contract.startDate) }}</td>
            <td>{{ formatDate(contract.endDate) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(contract.status)]">
                {{ getStatusText(contract.status) }}
              </span>
            </td>
            <td>{{ formatCurrency(contract.amount, contract.currency) }}</td>
            <td class="actions">
              <button @click="$emit('edit', contract)" class="btn-icon edit-btn">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="$emit('delete', contract)" class="btn-icon delete-btn">
                <i class="fas fa-trash-alt"></i>
              </button>
              <button @click="showContractDetails(contract)" class="btn-icon view-btn">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Paginación -->
      <div class="pagination">
        <div class="page-info">
          Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredContracts.length) }} de {{ filteredContracts.length }} contratos
        </div>
        <div class="page-controls">
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            <i class="fas fa-angle-left"></i>
          </button>
          
          <div class="page-numbers">
            <span v-for="page in displayedPages" :key="page">
              <button 
                @click="currentPage = page" 
                :class="['page-number', { active: currentPage === page }]"
              >
                {{ page }}
              </button>
            </span>
          </div>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            <i class="fas fa-angle-right"></i>
          </button>
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
        <div class="items-per-page">
          <select v-model="itemsPerPage">
            <option :value="5">5 por página</option>
            <option :value="10">10 por página</option>
            <option :value="20">20 por página</option>
            <option :value="50">50 por página</option>
          </select>
        </div>
      </div>
    </template>
    
    <!-- Modal de detalles del contrato -->
    <div v-if="selectedContract" class="contract-details-overlay">
      <div class="contract-details-modal">
        <div class="details-header">
          <h2>Detalles del Contrato</h2>
          <button @click="selectedContract = null" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="details-content">
          <div class="detail-section">
            <h3>Información General</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Número de Contrato:</span>
                <span class="detail-value">{{ selectedContract.contractNumber }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Título:</span>
                <span class="detail-value">{{ selectedContract.title }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Estado:</span>
                <span :class="['status-badge', getStatusClass(selectedContract.status)]">
                  {{ getStatusText(selectedContract.status) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fecha de Inicio:</span>
                <span class="detail-value">{{ formatDate(selectedContract.startDate) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fecha de Fin:</span>
                <span class="detail-value">{{ formatDate(selectedContract.endDate) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Importe:</span>
                <span class="detail-value">{{ formatCurrency(selectedContract.amount, selectedContract.currency) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Días de Notificación:</span>
                <span class="detail-value">{{ selectedContract.notificationDays }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Descripción</h3>
            <p class="contract-description">{{ selectedContract.description || 'Sin descripción' }}</p>
          </div>
          
          <div class="detail-section">
            <h3>Documentos</h3>
            <div v-if="selectedContract.documentPath" class="document-link">
              <i class="fas fa-file-pdf"></i>
              <a :href="selectedContract.documentPath" target="_blank">Ver documento adjunto</a>
            </div>
            <p v-else>No hay documentos adjuntos</p>
          </div>
        </div>
        
        <div class="details-actions">
          <button @click="$emit('edit', selectedContract); selectedContract = null" class="btn-primary">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button @click="$emit('delete', selectedContract); selectedContract = null" class="btn-danger">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
          <button @click="selectedContract = null" class="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Contract } from '../../../types/contract';

// Props
const props = defineProps<{
  contracts: Contract[];
  loading: boolean;
}>();

// Emits
defineEmits<{
  (e: 'edit', contract: Contract): void;
  (e: 'delete', contract: Contract): void;
}>();

// Referencias reactivas
const currentSort = ref('contractNumber');
const sortOrder = ref<'asc' | 'desc'>('asc');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const selectedContract = ref<Contract | null>(null);

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
  if (!props.contracts) return [];
  
  return [...props.contracts].sort((a, b) => {
    let valA: any, valB: any;
    
    // Manejar casos especiales para fechas
    if (currentSort.value === 'startDate' || currentSort.value === 'endDate') {
      valA = new Date(a[currentSort.value]).getTime();
      valB = new Date(b[currentSort.value]).getTime();
    } else {
      valA = a[currentSort.value as keyof Contract];
      valB = b[currentSort.value as keyof Contract];
    }
    
    // Ordenar strings
    if (typeof valA === 'string' && typeof valB === 'string') {
      if (sortOrder.value === 'asc') {
        return valA.localeCompare(valB);
      } else {
        return valB.localeCompare(valA);
      }
    }
    
    // Ordenar números, fechas, etc.
    if (sortOrder.value === 'asc') {
      return Number(valA) - Number(valB);
    } else {
      return Number(valB) - Number(valA);
    }
  });
});

// Aplicar filtro si es necesario
const filteredContracts = computed(() => {
  return sortedContracts.value;
});

// Calcular número total de páginas
const totalPages = computed(() => {
  return Math.ceil(filteredContracts.value.length / itemsPerPage.value);
});

// Páginas a mostrar en la paginación
const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5; // Máximo de botones de página a mostrar
  
  if (totalPages.value <= maxPages) {
    // Mostrar todas las páginas si hay menos que el máximo
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Mostrar un subconjunto centrado en la página actual
    let startPage = Math.max(currentPage.value - Math.floor(maxPages / 2), 1);
    let endPage = startPage + maxPages - 1;
    
    // Ajustar si excedemos el número total de páginas
    if (endPage > totalPages.value) {
      endPage = totalPages.value;
      startPage = Math.max(endPage - maxPages + 1, 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});

// Contratos a mostrar en la página actual
const displayedContracts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredContracts.value.slice(start, end);
});

// Restablecer a la primera página cuando cambian los contratos o el tamaño de la página
watch([() => props.contracts, itemsPerPage], () => {
  currentPage.value = 1;
});

// Funciones utilitarias
function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: currency || 'CUP'
  }).format(amount);
}

function getStatusClass(status: string) {
  switch (status) {
    case 'active': return 'status-active';
    case 'expired': return 'status-expired';
    case 'draft': return 'status-draft';
    case 'terminated': return 'status-terminated';
    case 'renewed': return 'status-renewed';
    default: return '';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'active': return 'Activo';
    case 'expired': return 'Vencido';
    case 'draft': return 'Borrador';
    case 'terminated': return 'Terminado';
    case 'renewed': return 'Renovado';
    default: return status;
  }
}

function showContractDetails(contract: Contract) {
  selectedContract.value = contract;
}
</script>

<style lang="scss" scoped>
@use './contractTable.scss';
</style>