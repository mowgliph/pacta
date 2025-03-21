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
import type { Contract } from '@/stores/contract';

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
    let valA, valB;
    
    // Manejar casos especiales para fechas
    if (currentSort.value === 'startDate' || currentSort.value === 'endDate') {
      valA = new Date(a[currentSort.value]).getTime();
      valB = new Date(b[currentSort.value]).getTime();
    } else {
      valA = a[currentSort.value];
      valB = b[currentSort.value];
    }
    
    // Ordenar strings
    if (typeof valA === 'string') {
      if (sortOrder.value === 'asc') {
        return valA.localeCompare(valB);
      } else {
        return valB.localeCompare(valA);
      }
    }
    
    // Ordenar números, fechas, etc.
    if (sortOrder.value === 'asc') {
      return valA - valB;
    } else {
      return valB - valA;
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
@use '../../../styles/variables' as v;
@use '../../../styles/colors' as c;
@use '../../../styles/mixins' as m;
@use '../../../styles/typography' as t;

.contracts-table {
  width: 100%;
  position: relative;
  
  table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--color-surface);
    border-radius: v.$border-radius-md;
    box-shadow: 0 1px 3px var(--color-border);
    margin-bottom: v.$spacing-lg;
    
    th, td {
      padding: v.$spacing-unit * 3;
      text-align: left;
      
      &:last-child {
        text-align: right;
      }
    }
    
    th {
      background-color: v.$color-bg-light;
      color: var(--color-text-secondary);
      font-weight: v.$font-weight-semibold;
      transition: background-color v.$transition-fast;
      cursor: pointer;
      white-space: nowrap;
      border-bottom: 1px solid var(--color-border);
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background-color: var(--color-primary);
        transition: width 0.2s ease, left 0.2s ease;
      }
      
      &:hover {
        background-color: darken(v.$color-bg-light, 2%);
        
        &::after {
          width: 100%;
          left: 0;
        }
      }
      
      &.active {
        color: var(--color-primary);
        
        &::after {
          width: 100%;
          left: 0;
        }
      }
      
      i {
        font-size: 0.8rem;
        margin-left: v.$spacing-unit;
        opacity: 0.7;
      }
    }
    
    tbody tr {
      border-bottom: 1px solid var(--color-border);
      transition: background-color v.$transition-fast;
      
      &:hover {
        background-color: v.$color-bg-hover;
      }
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    .contract-number {
      font-family: v.$font-mono;
      color: var(--color-primary);
      font-weight: v.$font-weight-medium;
    }
    
    .contract-title {
      font-weight: v.$font-weight-medium;
      color: var(--color-text-primary);
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: v.$spacing-unit v.$spacing-unit * 2;
      border-radius: v.$border-radius-pill;
      font-size: 0.85rem;
      font-weight: v.$font-weight-medium;
      line-height: 1;
      
      &::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        margin-right: v.$spacing-unit;
      }
      
      &.status-active {
        background-color: rgba(c.$color-success, 0.1);
        color: c.$color-success;
        
        &::before {
          background-color: c.$color-success;
        }
      }
      
      &.status-expired {
        background-color: rgba(v.$color-danger, 0.1);
        color: v.$color-danger;
        
        &::before {
          background-color: v.$color-danger;
        }
      }
      
      &.status-draft {
        background-color: rgba(c.$color-warning, 0.1);
        color: c.$color-warning;
        
        &::before {
          background-color: c.$color-warning;
        }
      }
      
      &.status-terminated {
        background-color: rgba(c.$color-secondary, 0.1);
        color: c.$color-secondary;
        
        &::before {
          background-color: c.$color-secondary;
        }
      }
      
      &.status-renewed {
        background-color: rgba(c.$color-info, 0.1);
        color: c.$color-info;
        
        &::before {
          background-color: c.$color-info;
        }
      }
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: v.$spacing-unit;
    }
  }
}

.btn-icon {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all v.$transition-fast;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: transparent;
    border-radius: 50%;
    transform: scale(0);
    transition: transform 0.2s ease, background-color 0.2s ease;
  }
  
  &.edit-btn {
    color: var(--color-primary);
    
    &:hover {
      color: darken(c.$color-primary, 10%);
      
      &::before {
        background-color: rgba(c.$color-primary, 0.1);
        transform: scale(1);
      }
    }
  }
  
  &.delete-btn {
    color: v.$color-danger;
    
    &:hover {
      color: darken(v.$color-danger, 10%);
      
      &::before {
        background-color: rgba(v.$color-danger, 0.1);
        transform: scale(1);
      }
    }
  }
  
  &.view-btn {
    color: c.$color-info;
    
    &:hover {
      color: darken(c.$color-info, 10%);
      
      &::before {
        background-color: rgba(c.$color-info, 0.1);
        transform: scale(1);
      }
    }
  }
  
  i {
    position: relative;
    z-index: 1;
  }
}

.loading-indicator {
  padding: v.$spacing-unit * 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  
  i {
    font-size: 2rem;
    margin-bottom: v.$spacing-unit * 2;
    color: var(--color-primary);
    animation: spin 1.5s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

.no-data {
  padding: v.$spacing-unit * 10;
  text-align: center;
  color: var(--color-text-secondary);
  
  .no-data-icon {
    font-size: 3rem;
    margin-bottom: v.$spacing-unit * 3;
    opacity: 0.5;
    color: var(--color-primary);
  }
  
  h3 {
    margin-bottom: v.$spacing-unit;
    color: var(--color-text-primary);
  }
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: v.$spacing-unit * 3;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
  border-radius: 0 0 v.$border-radius-md v.$border-radius-md;
  
  .page-info {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }
  
  .page-controls {
    display: flex;
    align-items: center;
    gap: v.$spacing-unit;
  }
  
  .page-numbers {
    display: flex;
    gap: v.$spacing-unit;
  }
  
  .page-btn, .page-number {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: v.$border-radius;
    border: 1px solid var(--color-border);
    background: transparent;
    cursor: pointer;
    transition: all v.$transition-fast;
    font-size: 0.9rem;
    
    &:hover:not(:disabled) {
      background-color: v.$color-bg-hover;
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &.active {
      background-color: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
      font-weight: v.$font-weight-medium;
    }
  }
  
  .items-per-page {
    select {
      padding: v.$spacing-unit * 1.5 v.$spacing-unit * 2;
      border: 1px solid var(--color-border);
      border-radius: v.$border-radius;
      background: var(--color-surface);
      font-size: 0.9rem;
      color: var(--color-text-primary);
      cursor: pointer;
      transition: border-color v.$transition-fast;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='6' fill='none'%3E%3Cpath stroke='%23666' d='M7 1.5 4 4.5 1 1.5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      padding-right: 30px;
      
      &:hover, &:focus {
        border-color: var(--color-primary);
        outline: none;
      }
    }
  }
}

// Estilos para el modal de detalles
.contract-details-overlay {
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
}

.contract-details-modal {
  background-color: var(--color-surface);
  border-radius: v.$border-radius-md;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: v.$shadow-lg;
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .details-header {
    padding: v.$spacing-unit * 4;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-border);
    
    h2 {
      margin: 0;
      color: var(--color-text-primary);
      font-weight: v.$font-weight-semibold;
    }
    
    .close-btn {
      background: none;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color v.$transition-fast;
      
      &:hover {
        background-color: v.$color-bg-hover;
        color: var(--color-primary);
      }
    }
  }
  
  .details-content {
    padding: v.$spacing-unit * 4;
    overflow-y: auto;
    max-height: calc(90vh - 200px);
    
    .detail-section {
      margin-bottom: v.$spacing-unit * 4;
      
      h3 {
        margin-top: 0;
        margin-bottom: v.$spacing-unit * 3;
        padding-bottom: v.$spacing-unit * 2;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-primary);
        font-weight: v.$font-weight-medium;
      }
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: v.$spacing-unit * 4;
    }
    
    .detail-item {
      .detail-label {
        display: block;
        color: var(--color-text-secondary);
        margin-bottom: v.$spacing-unit;
        font-size: 0.9rem;
      }
      
      .detail-value {
        font-weight: v.$font-weight-medium;
        color: var(--color-text-primary);
      }
    }
    
    .contract-description {
      white-space: pre-line;
      line-height: 1.6;
      color: var(--color-text-primary);
    }
    
    .document-link {
      display: flex;
      align-items: center;
      gap: v.$spacing-unit * 2;
      margin-top: v.$spacing-unit * 2;
      
      i {
        color: v.$color-danger;
        font-size: 1.2rem;
      }
      
      a {
        color: var(--color-primary);
        text-decoration: none;
        transition: color v.$transition-fast;
        
        &:hover {
          text-decoration: underline;
          color: c.$color-primary-dark;
        }
      }
    }
  }
  
  .details-actions {
    padding: v.$spacing-unit * 4;
    display: flex;
    justify-content: flex-end;
    gap: v.$spacing-unit * 2;
    border-top: 1px solid var(--color-border);
    background-color: v.$color-bg-light;
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
  display: flex;
  align-items: center;
  gap: v.$spacing-unit;
  font-weight: v.$font-weight-medium;
  
  i {
    font-size: 0.9rem;
  }
  
  &:hover {
    background-color: darken(v.$color-danger, 10%);
  }
}

// Responsive
@media (max-width: v.$breakpoint-md) {
  table {
    thead {
      display: none;
    }
    
    tbody tr {
      display: block;
      margin-bottom: v.$spacing-unit * 3;
      border: 1px solid var(--color-border);
      border-radius: v.$border-radius;
      padding: v.$spacing-unit * 2;
      
      td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: v.$spacing-unit * 1.5;
        text-align: right;
        border-bottom: 1px dashed var(--color-border);
        
        &:last-child {
          border-bottom: none;
          justify-content: flex-end;
        }
        
        &::before {
          content: attr(data-label);
          font-weight: v.$font-weight-medium;
          text-align: left;
          color: var(--color-text-secondary);
        }
      }
    }
  }
  
  .pagination {
    flex-direction: column;
    gap: v.$spacing-unit * 2;
    
    .page-info, .items-per-page {
      order: 3;
    }
    
    .page-controls {
      order: 2;
    }
  }
  
  .contract-details-modal {
    width: 95%;
    max-height: 95vh;
    
    .detail-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>