<template>
  <div class="notifications-view">
    <header class="page-header">
      <h1 class="page-title">Gestión de Notificaciones</h1>
      <div class="page-actions">
        <button 
          v-if="hasUnread" 
          class="btn-primary" 
          @click="markAllAsRead"
          :disabled="isLoading"
        >
          <i class="fas fa-check-double"></i>
          Marcar todo como leído
        </button>
      </div>
    </header>
    
    <div class="notification-filters">
      <div class="filter-group">
        <label class="filter-label">Filtrar por:</label>
        <Dropdown
          v-model="filters.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
          class="filter-dropdown"
        />
        <Dropdown
          v-model="filters.type"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Tipo"
          class="filter-dropdown"
        />
      </div>
      <div class="search-group">
        <span class="p-input-icon-left">
          <i class="fas fa-search"></i>
          <InputText 
            v-model="filters.search" 
            placeholder="Buscar en notificaciones" 
            class="search-input"
          />
        </span>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <i class="fas fa-circle-notch fa-spin"></i>
      <p>Cargando notificaciones...</p>
    </div>
    
    <div v-else-if="filteredNotifications.length === 0" class="empty-container">
      <div class="empty-content">
        <i class="fas fa-bell-slash"></i>
        <h3>No hay notificaciones</h3>
        <p v-if="hasFilters">No se encontraron notificaciones con los filtros aplicados.</p>
        <p v-else>Aún no tienes notificaciones.</p>
        
        <div v-if="hasFilters" class="empty-actions">
          <button class="btn-secondary" @click="clearFilters">
            <i class="fas fa-filter"></i>
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="notifications-container">
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
            <div class="notification-type" :class="notificationTypeClass(data.type)">
              <i :class="notificationTypeIcon(data.type)"></i>
              <span>{{ formatNotificationType(data.type) }}</span>
            </div>
          </template>
        </Column>
        
        <Column field="message" header="Mensaje" :sortable="false">
          <template #body="{ data }">
            <div class="notification-message">
              {{ data.message }}
              <div class="notification-contract" v-if="data.Contract">
                <span class="contract-number">{{ data.Contract.contractNumber }}</span>
                <span class="contract-status">{{ formatContractStatus(data.Contract.status) }}</span>
              </div>
            </div>
          </template>
        </Column>
        
        <Column field="createdAt" header="Fecha" :sortable="true" style="width: 150px">
          <template #body="{ data }">
            <div class="notification-date">
              <div class="date-display">{{ formatDate(data.createdAt) }}</div>
              <div class="date-relative">{{ formatRelativeDate(data.createdAt) }}</div>
            </div>
          </template>
        </Column>
        
        <Column header="Acciones" style="width: 120px">
          <template #body="{ data }">
            <div class="action-buttons">
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
      <div class="confirmation-content">
        <i class="fas fa-exclamation-triangle" style="color: var(--orange-500)"></i>
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

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;

.notifications-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: v.$spacing-md;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: v.$spacing-lg;
  
  .page-title {
    font-size: v.$font-size-xl;
    font-weight: v.$font-weight-semibold;
    color: v.$color-text-primary;
    margin: 0;
  }
}

.notification-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: v.$spacing-lg;
  gap: v.$spacing-md;
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: v.$spacing-sm;
    
    .filter-label {
      font-size: v.$font-size-sm;
      color: v.$color-text-secondary;
    }
    
    .filter-dropdown {
      width: 180px;
    }
  }
  
  .search-group {
    .search-input {
      width: 300px;
    }
  }
}

.notifications-container {
  background-color: v.$color-surface;
  border-radius: v.$border-radius;
  box-shadow: v.$shadow-sm;
  overflow: hidden;
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  background-color: v.$color-surface;
  border-radius: v.$border-radius;
  box-shadow: v.$shadow-sm;
}

.loading-container {
  flex-direction: column;
  color: v.$color-text-secondary;
  
  i {
    font-size: 2rem;
    margin-bottom: v.$spacing-md;
  }
}

.empty-content {
  text-align: center;
  max-width: 400px;
  
  i {
    font-size: 3rem;
    color: v.$color-text-secondary;
    opacity: 0.5;
    margin-bottom: v.$spacing-md;
  }
  
  h3 {
    font-size: v.$font-size-lg;
    margin-bottom: v.$spacing-sm;
    color: v.$color-text-primary;
  }
  
  p {
    color: v.$color-text-secondary;
    margin-bottom: v.$spacing-md;
  }
  
  .empty-actions {
    margin-top: v.$spacing-md;
  }
}

.notification-type {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: v.$border-radius-sm;
  font-size: v.$font-size-sm;
  
  i {
    margin-right: 6px;
  }
  
  &.type-info {
    background-color: rgba(c.$color-info, 0.1);
    color: darken(c.$color-info, 10%);
  }
  
  &.type-warning {
    background-color: rgba(c.$color-warning, 0.1);
    color: darken(c.$color-warning, 10%);
  }
  
  &.type-danger {
    background-color: rgba(c.$color-error, 0.1);
    color: darken(c.$color-error, 10%);
  }
}

.notification-message {
  position: relative;
  
  .notification-contract {
    display: inline-flex;
    align-items: center;
    margin-left: v.$spacing-sm;
    
    .contract-number {
      font-weight: v.$font-weight-medium;
      background-color: rgba(v.$color-primary, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: v.$font-size-xs;
      margin-right: 6px;
    }
    
    .contract-status {
      font-size: v.$font-size-xs;
      color: v.$color-text-secondary;
    }
  }
}

.notification-date {
  .date-display {
    font-weight: v.$font-weight-medium;
    font-size: v.$font-size-sm;
  }
  
  .date-relative {
    font-size: v.$font-size-xs;
    color: v.$color-text-secondary;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: v.$spacing-md;
  
  i {
    font-size: 2rem;
  }
}

// Botones
.btn-primary {
  background-color: v.$color-primary;
  color: white;
  border: none;
  padding: v.$spacing-sm v.$spacing-md;
  border-radius: v.$border-radius;
  font-weight: v.$font-weight-medium;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  
  i {
    margin-right: v.$spacing-sm;
  }
  
  &:hover {
    background-color: darken(v.$color-primary, 5%);
  }
  
  &:disabled {
    background-color: lighten(v.$color-primary, 20%);
    cursor: not-allowed;
  }
}

.btn-secondary {
  background-color: v.$color-surface;
  color: v.$color-text-secondary;
  border: 1px solid v.$color-border;
  padding: v.$spacing-sm v.$spacing-md;
  border-radius: v.$border-radius;
  font-weight: v.$font-weight-medium;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  
  i {
    margin-right: v.$spacing-sm;
  }
  
  &:hover {
    background-color: darken(v.$color-surface, 5%);
  }
}
</style> 