<template>
  <div class="bg-surface dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6" :class="{ 'opacity-70 pointer-events-none': loading }">
    <div class="flex justify-between items-center p-5 border-b border-border dark:border-gray-700">
      <h3 v-if="title" class="text-base font-semibold text-text-primary dark:text-white m-0">{{ title }}</h3>
      <div class="flex gap-2" v-if="showActions">
        <div class="relative" v-if="searchable">
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="searchPlaceholder" 
            @input="handleSearch"
            class="py-1.5 pl-3 pr-10 border border-border dark:border-gray-600 rounded-md text-sm min-w-[200px] dark:bg-gray-700 dark:text-white"
          >
          <i class="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-gray-400"></i>
        </div>
        <button v-if="exportable" class="flex items-center gap-1.5 py-1.5 px-3 bg-gray-100 dark:bg-gray-700 border-none rounded-md text-sm cursor-pointer transition-colors hover:bg-gray-200 dark:hover:bg-gray-600" @click="$emit('export')">
          <i class="fas fa-file-export"></i>
          Exportar
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="py-16 px-5 flex flex-col items-center justify-center text-center">
      <div class="w-10 h-10 border-3 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin mb-4"></div>
      <span class="text-text-secondary dark:text-gray-400">Cargando datos...</span>
    </div>
    
    <div v-else-if="error" class="py-16 px-5 flex flex-col items-center justify-center text-center">
      <i class="fas fa-exclamation-circle text-4xl mb-4 text-text-secondary dark:text-gray-400"></i>
      <p class="mb-4 text-text-secondary dark:text-gray-400">{{ error }}</p>
      <button class="py-1.5 px-4 bg-primary text-white border-none rounded-md cursor-pointer" @click="$emit('reload')">Reintentar</button>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="py-16 px-5 flex flex-col items-center justify-center text-center">
      <i class="fas fa-inbox text-4xl mb-4 text-text-secondary dark:text-gray-400"></i>
      <p class="text-text-secondary dark:text-gray-400">{{ emptyMessage }}</p>
    </div>
    
    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th 
              v-for="(column, index) in columns" 
              :key="index"
              class="py-2 px-4 text-left border-b border-border dark:border-gray-700 font-semibold text-sm text-text-primary dark:text-white bg-gray-50 dark:bg-gray-750 first:pl-5 last:pr-5 relative"
              :class="{ 
                'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700': column.sortable, 
                'bg-gray-100 dark:bg-gray-700': sortColumn === column.key
              }"
              @click="column.sortable ? handleSort(column.key) : null"
            >
              {{ column.label }}
              <i 
                v-if="column.sortable" 
                :class="getSortIconClass(column.key)"
                class="ml-1 text-xs"
              ></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, rowIndex) in paginatedData" 
            :key="rowIndex"
            @click="handleRowClick(row)"
            class="hover:bg-gray-50 dark:hover:bg-gray-750 border-b border-border dark:border-gray-700"
            :class="{ 'cursor-pointer': rowClickable }"
          >
            <td 
              v-for="(column, colIndex) in columns" 
              :key="colIndex"
              class="py-2 px-4 text-sm text-text-primary dark:text-gray-200 first:pl-5 last:pr-5"
            >
              <div v-if="column.template" v-html="column.template(row[column.key], row)"></div>
              <div v-else-if="column.format" v-html="column.format(row[column.key])"></div>
              <div v-else>{{ row[column.key] }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="flex justify-between items-center p-4 border-t border-border dark:border-gray-700 text-sm md:flex-row flex-col gap-4" v-if="showPagination && data.length > 0">
      <div class="text-text-secondary dark:text-gray-400 md:order-1 order-3">
        Mostrando {{ paginationStart }} - {{ paginationEnd }} de {{ data.length }}
      </div>
      <div class="flex items-center gap-0.5 md:order-2 order-1 w-full md:w-auto justify-center">
        <button 
          class="flex items-center justify-center w-8 h-8 bg-transparent border border-border dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-default"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <template v-for="(pageNum, idx) in displayedPages" :key="idx">
          <button 
            v-if="typeof pageNum === 'number'" 
            class="flex items-center justify-center w-8 h-8 bg-transparent border border-border dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            :class="{ 'bg-primary text-white border-primary': currentPage === pageNum }"
            @click="goToPage(pageNum)"
          >
            {{ pageNum }}
          </button>
          <span v-else class="px-1">...</span>
        </template>
        
        <button 
          class="flex items-center justify-center w-8 h-8 bg-transparent border border-border dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-default"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="flex items-center gap-2 md:order-3 order-2 w-full md:w-auto justify-center" v-if="showItemsPerPage">
        <span class="text-text-secondary dark:text-gray-400">Items por página:</span>
        <select 
          v-model="itemsPerPage" 
          @change="currentPage = 1"
          class="py-1 px-2 border border-border dark:border-gray-600 rounded-md bg-surface dark:bg-gray-700 dark:text-white"
        >
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