<template>
  <div class="max-w-7xl mx-auto p-6 bg-background dark:bg-gray-900">
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-text-primary dark:text-white m-0">Gestión de Notificaciones</h1>
      <div>
        <button 
          v-if="hasUnread" 
          class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-dark disabled:opacity-70 disabled:cursor-not-allowed"
          @click="markAllAsRead"
          :disabled="isLoading"
        >
          <i class="fas fa-check-double mr-2"></i>
          Marcar todo como leído
        </button>
      </div>
    </header>
    
    <div class="flex justify-between mb-6 gap-4 flex-wrap">
      <div class="flex items-center gap-2 flex-wrap">
        <label class="text-sm text-text-secondary dark:text-gray-400">Filtrar por:</label>
        <Dropdown
          v-model="filters.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
          class="w-44"
        />
        <Dropdown
          v-model="filters.type"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Tipo"
          class="w-44"
        />
      </div>
      <div>
        <span class="p-input-icon-left">
          <i class="fas fa-search"></i>
          <InputText 
            v-model="filters.search" 
            placeholder="Buscar en notificaciones" 
            class="w-72"
          />
        </span>
      </div>
    </div>
    
    <div v-if="isLoading" class="flex flex-col justify-center items-center h-75 bg-surface dark:bg-gray-800 rounded-lg shadow-sm">
      <i class="fas fa-circle-notch fa-spin text-4xl mb-4 text-text-secondary dark:text-gray-400"></i>
      <p class="text-text-secondary dark:text-gray-400">Cargando notificaciones...</p>
    </div>
    
    <div v-else-if="filteredNotifications.length === 0" class="flex justify-center items-center h-75 bg-surface dark:bg-gray-800 rounded-lg shadow-sm">
      <div class="text-center max-w-md">
        <i class="fas fa-bell-slash text-6xl text-text-secondary dark:text-gray-400 opacity-50 mb-4"></i>
        <h3 class="text-lg text-text-primary dark:text-white mb-2">No hay notificaciones</h3>
        <p v-if="hasFilters" class="text-text-secondary dark:text-gray-400 mb-4">No se encontraron notificaciones con los filtros aplicados.</p>
        <p v-else class="text-text-secondary dark:text-gray-400 mb-4">Aún no tienes notificaciones.</p>
        
        <div v-if="hasFilters" class="mt-4">
          <button class="inline-flex items-center px-4 py-2 bg-surface dark:bg-gray-700 text-text-secondary dark:text-gray-300 border border-border dark:border-gray-600 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-600" @click="clearFilters">
            <i class="fas fa-filter mr-2"></i>
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="bg-surface dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <DataTable 
        :value="filteredNotifications" 
        :paginator="true" 
        :rows="10"
        :rowsPerPageOptions="[5, 10, 25, 50]"
        :sortField="sortField"
        :sortOrder="sortOrder"
        @sort="onSort"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        responsiveLayout="scroll"
        class="p-datatable-sm"
        stripedRows
      >
        <Column field="read" header="Estado" :sortable="true" style="width: 100px">
          <template #body="{ data }">
            <Badge 
              :value="data.read ? 'Leída' : 'No leída'" 
              :severity="data.read ? 'success' : 'warning'" 
            />
          </template>
        </Column>
        
        <Column field="type" header="Tipo" :sortable="true" style="width: 120px">
          <template #body="{ data }">
            <div class="inline-flex items-center px-2 py-1 rounded-md text-sm" 
              :class="{
                'bg-info/10 text-info-dark dark:text-info-light': notificationTypeClass(data.type) === 'type-info',
                'bg-warning/10 text-warning-dark dark:text-warning-light': notificationTypeClass(data.type) === 'type-warning',
                'bg-error/10 text-error-dark dark:text-error-light': notificationTypeClass(data.type) === 'type-danger'
              }">
              <i :class="[notificationTypeIcon(data.type), 'mr-1.5']"></i>
              <span>{{ formatNotificationType(data.type) }}</span>
            </div>
          </template>
        </Column>
        
        <Column field="message" header="Mensaje" :sortable="false">
          <template #body="{ data }">
            <div class="relative">
              {{ data.message }}
              <div class="inline-flex items-center ml-2" v-if="data.Contract">
                <span class="font-medium bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded text-xs mr-1.5">{{ data.Contract.contractNumber }}</span>
                <span class="text-xs text-text-secondary dark:text-gray-400">{{ formatContractStatus(data.Contract.status) }}</span>
              </div>
            </div>
          </template>
        </Column>
        
        <Column field="createdAt" header="Fecha" :sortable="true" style="width: 150px">
          <template #body="{ data }">
            <div>
              <div class="font-medium text-sm">{{ formatDate(data.createdAt) }}</div>
              <div class="text-xs text-text-secondary dark:text-gray-400">{{ formatRelativeDate(data.createdAt) }}</div>
            </div>
          </template>
        </Column>
        
        <Column header="Acciones" style="width: 120px">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button 
                v-if="!data.read"
                icon="fas fa-check" 
                class="p-button-sm p-button-success p-button-outlined" 
                @click="markAsRead(data.id)"
                title="Marcar como leída"
              />
              <Button 
                v-if="data.contractId"
                icon="fas fa-eye" 
                class="p-button-sm p-button-info p-button-outlined" 
                @click="viewContract(data.contractId)"
                title="Ver contrato"
              />
              <Button 
                icon="fas fa-trash" 
                class="p-button-sm p-button-danger p-button-outlined" 
                @click="confirmDelete(data)"
                title="Eliminar"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    
    <!-- Diálogo de confirmación para eliminar notificación -->
    <Dialog 
      v-model:visible="deleteDialogVisible" 
      :style="{ width: '450px' }" 
      header="Confirmar eliminación" 
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="fas fa-exclamation-triangle text-4xl text-orange-500"></i>
        <span>¿Estás seguro de que deseas eliminar esta notificación?</span>
      </div>
      <template #footer>
        <Button 
          label="No" 
          icon="fas fa-times" 
          class="p-button-text" 
          @click="deleteDialogVisible = false"
        />
        <Button 
          label="Sí" 
          icon="fas fa-check" 
          class="p-button-danger" 
          @click="deleteNotification"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import { format, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToastNotificationStore } from '@/stores/toastNotification';

// Componentes PrimeVue
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Badge from 'primevue/badge';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';

// Setup
const router = useRouter();
const notificationStore = useNotificationStore();
const toastStore = useToastNotificationStore();
const { notifications, loading: isLoading } = storeToRefs(notificationStore);
const hasUnread = computed(() => notificationStore.hasUnread);

// Estado local
const sortField = ref('createdAt');
const sortOrder = ref(-1);
const deleteDialogVisible = ref(false);
const notificationToDelete = ref(null);

// Filtros
const filters = reactive({
  status: null, // 'read', 'unread'
  type: null,   // 'EXPIRING_SOON', 'EXPIRED'
  search: ''
});

// Opciones para los filtros
const statusOptions = [
  { label: 'Todas', value: null },
  { label: 'Leídas', value: 'read' },
  { label: 'No leídas', value: 'unread' }
];

const typeOptions = [
  { label: 'Todos los tipos', value: null },
  { label: 'Contratos a expirar', value: 'EXPIRING_SOON' },
  { label: 'Contratos expirados', value: 'EXPIRED' }
];

// Notificaciones filtradas
const filteredNotifications = computed(() => {
  let result = [...notifications.value];
  
  // Filtrar por estado
  if (filters.status === 'read') {
    result = result.filter(n => n.read);
  } else if (filters.status === 'unread') {
    result = result.filter(n => !n.read);
  }
  
  // Filtrar por tipo
  if (filters.type) {
    result = result.filter(n => n.type === filters.type);
  }
  
  // Filtrar por búsqueda
  if (filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    result = result.filter(n => 
      n.message.toLowerCase().includes(searchTerm) || 
      (n.Contract?.contractNumber.toLowerCase().includes(searchTerm))
    );
  }
  
  // Ordenar los resultados
  result.sort((a, b) => {
    const valueA = a[sortField.value];
    const valueB = b[sortField.value];
    
    if (valueA < valueB) return -1 * sortOrder.value;
    if (valueA > valueB) return 1 * sortOrder.value;
    return 0;
  });
  
  return result;
});

// Verificar si hay filtros aplicados
const hasFilters = computed(() => {
  return filters.status !== null || 
         filters.type !== null || 
         filters.search.trim() !== '';
});

// Funciones
onMounted(() => {
  loadNotifications();
});

const loadNotifications = async () => {
  await notificationStore.fetchNotifications();
};

const clearFilters = () => {
  filters.status = null;
  filters.type = null;
  filters.search = '';
};

const onSort = (event) => {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
};

const markAsRead = async (id: number) => {
  await notificationStore.markAsRead(id);
  toastStore.success('Notificación marcada como leída');
};

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

const viewContract = (contractId: number) => {
  router.push(`/contracts/${contractId}`);
};

const confirmDelete = (notification) => {
  notificationToDelete.value = notification;
  deleteDialogVisible.value = true;
};

const deleteNotification = async () => {
  if (notificationToDelete.value) {
    await notificationStore.deleteNotification(notificationToDelete.value.id);
    deleteDialogVisible.value = false;
    notificationToDelete.value = null;
  }
};

// Formateadores
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy', { locale: es });
};

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  return formatDistance(date, now, { addSuffix: true, locale: es });
};

const formatNotificationType = (type: string) => {
  switch (type) {
    case 'EXPIRING_SOON': return 'Expirando';
    case 'EXPIRED': return 'Expirado';
    default: return type;
  }
};

const formatContractStatus = (status: string) => {
  switch (status) {
    case 'draft': return 'Borrador';
    case 'active': return 'Activo';
    case 'expired': return 'Expirado';
    case 'terminated': return 'Terminado';
    case 'renewed': return 'Renovado';
    default: return status;
  }
};

const notificationTypeClass = (type: string) => {
  switch (type) {
    case 'EXPIRING_SOON': return 'type-warning';
    case 'EXPIRED': return 'type-danger';
    default: return 'type-info';
  }
};

const notificationTypeIcon = (type: string) => {
  switch (type) {
    case 'EXPIRING_SOON': return 'fas fa-clock';
    case 'EXPIRED': return 'fas fa-calendar-times';
    default: return 'fas fa-bell';
  }
};
</script> 