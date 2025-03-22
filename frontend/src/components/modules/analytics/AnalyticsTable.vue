<template>
  <div class="analytics-table" :class="{ 'loading': loading }">
    <div class="table-header">
      <h3 v-if="title">{{ title }}</h3>
      <div class="table-actions" v-if="showActions">
        <div class="search-filter" v-if="searchable">
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="searchPlaceholder" 
            @input="handleSearch"
          >
          <i class="fas fa-search"></i>
        </div>
        <button v-if="exportable" class="btn-export" @click="$emit('export')">
          <i class="fas fa-file-export"></i>
          Exportar
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="table-loading">
      <div class="loading-spinner"></div>
      <span>Cargando datos...</span>
    </div>
    
    <div v-else-if="error" class="table-error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="$emit('reload')">Reintentar</button>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="table-empty">
      <i class="fas fa-inbox"></i>
      <p>{{ emptyMessage }}</p>
    </div>
    
    <div v-else class="table-responsive">
      <table>
        <thead>
          <tr>
            <th 
              v-for="(column, index) in columns" 
              :key="index"
              :class="{ 
                'sortable': column.sortable, 
                'sorted': sortColumn === column.key,
                'ascending': sortColumn === column.key && sortDirection === 'asc',
                'descending': sortColumn === column.key && sortDirection === 'desc'
              }"
              @click="column.sortable ? handleSort(column.key) : null"
            >
              {{ column.label }}
              <i 
                v-if="column.sortable" 
                :class="getSortIconClass(column.key)"
              ></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, rowIndex) in paginatedData" 
            :key="rowIndex"
            @click="handleRowClick(row)"
            :class="{ 'clickable': rowClickable }"
          >
            <td v-for="(column, colIndex) in columns" :key="colIndex">
              <div v-if="column.template" v-html="column.template(row[column.key], row)"></div>
              <div v-else-if="column.format" v-html="column.format(row[column.key])"></div>
              <div v-else>{{ row[column.key] }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="table-footer" v-if="showPagination && data.length > 0">
      <div class="pagination-info">
        Mostrando {{ paginationStart }} - {{ paginationEnd }} de {{ data.length }}
      </div>
      <div class="pagination-controls">
        <button 
          class="btn-page" 
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <template v-for="(pageNum, idx) in displayedPages" :key="idx">
          <button 
            v-if="typeof pageNum === 'number'" 
            class="btn-page" 
            :class="{ 'active': currentPage === pageNum }"
            @click="goToPage(pageNum)"
          >
            {{ pageNum }}
          </button>
          <span v-else class="page-ellipsis">...</span>
        </template>
        
        <button 
          class="btn-page" 
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="items-per-page" v-if="showItemsPerPage">
        <span>Items por página:</span>
        <select v-model="itemsPerPage" @change="currentPage = 1">
          <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Types
interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  template?: (value: any, row: any) => string;
  format?: (value: any) => string;
}

// Props
interface Props {
  title?: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  error?: string | null;
  searchable?: boolean;
  searchPlaceholder?: string;
  exportable?: boolean;
  showActions?: boolean;
  emptyMessage?: string;
  rowClickable?: boolean;
  showPagination?: boolean;
  showItemsPerPage?: boolean;
  defaultItemsPerPage?: number;
  itemsPerPageOptions?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  loading: false,
  error: null,
  searchable: false,
  searchPlaceholder: 'Buscar...',
  exportable: false,
  showActions: true,
  emptyMessage: 'No hay datos disponibles',
  rowClickable: false,
  showPagination: true,
  showItemsPerPage: true,
  defaultItemsPerPage: 10,
  itemsPerPageOptions: () => [5, 10, 25, 50, 100]
});

// Emits
const emit = defineEmits(['row-click', 'sort', 'search', 'export', 'reload']);

// State
const searchQuery = ref('');
const sortColumn = ref('');
const sortDirection = ref<'asc' | 'desc'>('asc');
const currentPage = ref(1);
const itemsPerPage = ref(props.defaultItemsPerPage);

// Computed Properties
const filteredData = computed(() => {
  if (!props.data) return [];
  
  let result = [...props.data];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(row => {
      return Object.keys(row).some(key => {
        const value = row[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }
  
  // Apply sorting
  if (sortColumn.value) {
    result.sort((a, b) => {
      const aValue = a[sortColumn.value];
      const bValue = b[sortColumn.value];
      
      if (aValue === bValue) return 0;
      
      let comparison = 0;
      if (aValue === null || aValue === undefined) comparison = -1;
      else if (bValue === null || bValue === undefined) comparison = 1;
      else if (typeof aValue === 'string') comparison = aValue.localeCompare(bValue);
      else comparison = aValue < bValue ? -1 : 1;
      
      return sortDirection.value === 'asc' ? comparison : -comparison;
    });
  }
  
  return result;
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredData.value.length / itemsPerPage.value));
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredData.value.slice(start, end);
});

const paginationStart = computed(() => {
  if (filteredData.value.length === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, filteredData.value.length);
});

type PageDisplay = number | string;

const displayedPages = computed((): PageDisplay[] => {
  const totalPagesNum = totalPages.value;
  const currentPageNum = currentPage.value;
  
  if (totalPagesNum <= 7) {
    // Display all pages if there are 7 or fewer
    return Array.from({ length: totalPagesNum }, (_, i) => i + 1);
  }
  
  // Show first page, last page, current page, and pages around current page
  const pages: PageDisplay[] = [1];
  
  if (currentPageNum > 3) {
    pages.push('...');
  }
  
  // Pages around current page
  const start = Math.max(2, currentPageNum - 1);
  const end = Math.min(totalPagesNum - 1, currentPageNum + 1);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  if (currentPageNum < totalPagesNum - 2) {
    pages.push('...');
  }
  
  if (totalPagesNum > 1) {
    pages.push(totalPagesNum);
  }
  
  return pages;
});

// Methods
function handleSort(column: string) {
  if (sortColumn.value === column) {
    // Toggle sort direction
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // New sort column
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  
  emit('sort', { column, direction: sortDirection.value });
}

function getSortIconClass(column: string) {
  if (sortColumn.value !== column) {
    return 'fas fa-sort';
  }
  
  return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
}

function handleSearch() {
  currentPage.value = 1;
  emit('search', searchQuery.value);
}

function handleRowClick(row: any) {
  if (props.rowClickable) {
    emit('row-click', row);
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

// Watch for props changes
watch(() => props.data, () => {
  // Reset to first page when data changes
  currentPage.value = 1;
});
</script>

<style lang="scss" scoped>
@use './AnalyticsTable.scss';
</style> 