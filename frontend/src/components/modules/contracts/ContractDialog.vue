<template>
  <div v-if="visible" 
       class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div class="bg-white dark:bg-surface rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-text-primary">{{ contract ? 'Editar Contrato' : 'Nuevo Contrato' }}</h2>
        <button @click="handleCancel" class="text-xl text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div>
            <label for="title" class="block mb-2 font-medium">Título</label>
            <input 
              id="title"
              v-model="formData.title"
              type="text"
              required
              :class="['w-full p-3 border rounded-md focus:outline-none focus:border-primary', 
                     {'border-error': errors.title, 'border-border': !errors.title}]"
              placeholder="Ingrese el título del contrato"
            />
            <span v-if="errors.title" class="text-error text-sm mt-1 block">{{ errors.title }}</span>
          </div>

          <div>
            <label for="contractNumber" class="block mb-2 font-medium">Número de Contrato</label>
            <input 
              id="contractNumber"
              v-model="formData.contractNumber"
              type="text"
              required
              :class="['w-full p-3 border rounded-md focus:outline-none focus:border-primary', 
                     {'border-error': errors.contractNumber, 'border-border': !errors.contractNumber}]"
              placeholder="Ej: CONT-2023-001"
            />
            <span v-if="errors.contractNumber" class="text-error text-sm mt-1 block">
              {{ errors.contractNumber }}
            </span>
          </div>

          <div>
            <label for="startDate" class="block mb-2 font-medium">Fecha de Inicio</label>
            <input 
              id="startDate"
              v-model="formData.startDate"
              type="date"
              required
              :class="['w-full p-3 border rounded-md focus:outline-none focus:border-primary', 
                     {'border-error': errors.startDate, 'border-border': !errors.startDate}]"
            />
            <span v-if="errors.startDate" class="text-error text-sm mt-1 block">{{ errors.startDate }}</span>
          </div>

          <div>
            <label for="endDate" class="block mb-2 font-medium">Fecha de Fin</label>
            <input 
              id="endDate"
              v-model="formData.endDate"
              type="date"
              required
              :min="formData.startDate"
              :class="['w-full p-3 border rounded-md focus:outline-none focus:border-primary', 
                     {'border-error': errors.endDate, 'border-border': !errors.endDate}]"
            />
            <span v-if="errors.endDate" class="text-error text-sm mt-1 block">{{ errors.endDate }}</span>
          </div>

          <div>
            <label for="amount" class="block mb-2 font-medium">Importe</label>
            <input 
              id="amount"
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              required
              :class="['w-full p-3 border rounded-md focus:outline-none focus:border-primary', 
                     {'border-error': errors.amount, 'border-border': !errors.amount}]"
              placeholder="0.00"
            />
            <span v-if="errors.amount" class="text-error text-sm mt-1 block">{{ errors.amount }}</span>
          </div>

          <div>
            <label for="currency" class="block mb-2 font-medium">Moneda</label>
            <select 
              id="currency"
              v-model="formData.currency"
              required
              class="w-full p-3 border border-border rounded-md focus:outline-none focus:border-primary"
            >
              <option value="CUP">CUP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div>
            <label for="status" class="block mb-2 font-medium">Estado</label>
            <select 
              id="status"
              v-model="formData.status"
              required
              class="w-full p-3 border border-border rounded-md focus:outline-none focus:border-primary"
            >
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="expired">Vencido</option>
              <option value="terminated">Terminado</option>
              <option value="renewed">Renovado</option>
            </select>
          </div>

          <div>
            <label for="notificationDays" class="block mb-2 font-medium">Días de Notificación</label>
            <input 
              id="notificationDays"
              v-model.number="formData.notificationDays"
              type="number"
              min="1"
              max="90"
              required
              placeholder="30"
              class="w-full p-3 border border-border rounded-md focus:outline-none focus:border-primary"
            />
            <span class="text-xs text-text-secondary mt-1 block">Días de antelación para notificar vencimiento</span>
          </div>

          <div class="col-span-1 md:col-span-2">
            <label for="description" class="block mb-2 font-medium">Descripción</label>
            <textarea 
              id="description"
              v-model="formData.description"
              rows="4"
              :class="['w-full p-3 border rounded-md focus:outline-none focus:border-primary', 
                     {'border-error': errors.description, 'border-border': !errors.description}]"
              placeholder="Describa los detalles del contrato..."
            ></textarea>
            <span v-if="errors.description" class="text-error text-sm mt-1 block">
              {{ errors.description }}
            </span>
          </div>

          <div class="col-span-1 md:col-span-2 mt-4">
            <label class="block mb-2 font-medium">Documento del Contrato</label>
            <div class="mt-2">
              <div v-if="contract && contract.documentPath && !newDocumentFile" 
                  class="flex items-center gap-2 p-2 border border-border rounded-md bg-gray-50 dark:bg-surface-hover">
                <i class="fas fa-file-alt text-text-secondary text-lg"></i>
                <span class="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{{ getDocumentName(contract.documentPath) }}</span>
                <button type="button" @click="downloadDocument" 
                        class="px-2 py-1 text-primary hover:underline">
                  <i class="fas fa-download"></i> Descargar
                </button>
                <button type="button" @click="removeExistingDocument" 
                        class="px-2 py-1 text-error hover:underline">
                  <i class="fas fa-trash"></i> Eliminar
                </button>
              </div>
              <div v-else class="relative">
                <input 
                  type="file" 
                  id="documentFile" 
                  ref="documentFileInput"
                  @change="handleFileChange" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  class="hidden"
                />
                <div v-if="newDocumentFile" 
                    class="flex items-center gap-2 p-3 border border-success rounded-md bg-success/10">
                  <i class="fas fa-file text-success text-lg"></i>
                  <span class="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{{ newDocumentFile.name }}</span>
                  <button type="button" @click="removeNewDocument" 
                          class="px-2 py-1 text-error">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <label v-else for="documentFile" 
                      class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-md cursor-pointer transition-all hover:border-primary hover:bg-gray-50 dark:hover:bg-surface-hover">
                  <i class="fas fa-cloud-upload-alt text-3xl text-primary mb-2"></i>
                  <span class="font-medium mb-1">Seleccione un archivo o arrástrelo aquí</span>
                  <small class="text-text-secondary">PDF, Word, Excel o TXT (máx. 10MB)</small>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-8">
          <button type="button" @click="handleCancel" 
                  class="py-2 px-4 border border-border bg-white dark:bg-surface rounded-md hover:bg-gray-50 dark:hover:bg-surface-hover flex items-center gap-1">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button type="submit" :disabled="isSubmitting"
                  class="py-2 px-4 bg-primary text-white border-none rounded-md hover:bg-primary-dark transition-colors flex items-center gap-1 disabled:opacity-70">
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ contract ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useContractStore } from '@/stores/contract';
import { contractService } from '@/services/contract.service';
import { useNotification } from '@/types/useNotification';

const contractStore = useContractStore();
const notification = useNotification();

const props = defineProps<{
  visible: boolean;
  contract?: any;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: any): void;
}>();

const formData = ref({
  title: '',
  contractNumber: '',
  description: '',
  startDate: '',
  endDate: '',
  amount: 0,
  currency: 'CUP',
  notificationDays: 30,
  status: 'draft'
});

const errors = ref({
  title: '',
  contractNumber: '',
  description: '',
  startDate: '',
  endDate: '',
  amount: ''
});

const documentFileInput = ref<HTMLInputElement | null>(null);
const newDocumentFile = ref<File | null>(null);
const removeDocument = ref(false);
const isSubmitting = ref(false);

watch(() => props.contract, (newContract) => {
  if (newContract) {
    Object.assign(formData.value, {
      ...newContract,
      startDate: formatDateForInput(newContract.startDate),
      endDate: formatDateForInput(newContract.endDate)
    });
    newDocumentFile.value = null;
    removeDocument.value = false;
  } else {
    resetForm();
  }
}, { immediate: true });

function formatDateForInput(date: string) {
  return new Date(date).toISOString().split('T')[0];
}

function resetForm() {
  formData.value = {
    title: '',
    contractNumber: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: 0,
    currency: 'CUP',
    notificationDays: 30,
    status: 'draft'
  };
  errors.value = {
    title: '',
    contractNumber: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: ''
  };
  newDocumentFile.value = null;
  removeDocument.value = false;
}

function validateForm() {
  let isValid = true;
  errors.value = {
    title: '',
    contractNumber: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: ''
  };

  if (!formData.value.title || formData.value.title.length < 3) {
    errors.value.title = 'El título debe tener al menos 3 caracteres';
    isValid = false;
  }

  if (!formData.value.contractNumber) {
    errors.value.contractNumber = 'El número de contrato es obligatorio';
    isValid = false;
  }

  if (formData.value.description && formData.value.description.length > 1000) {
    errors.value.description = 'La descripción no debe exceder los 1000 caracteres';
    isValid = false;
  }

  if (!formData.value.startDate) {
    errors.value.startDate = 'La fecha de inicio es obligatoria';
    isValid = false;
  }

  if (!formData.value.endDate) {
    errors.value.endDate = 'La fecha de fin es obligatoria';
    isValid = false;
  } else if (new Date(formData.value.endDate) <= new Date(formData.value.startDate)) {
    errors.value.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    isValid = false;
  }

  if (formData.value.amount <= 0) {
    errors.value.amount = 'El importe debe ser mayor que 0';
    isValid = false;
  }

  return isValid;
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) { // 10MB
      notification.error('El archivo es demasiado grande. El tamaño máximo es de 10MB.');
      if (documentFileInput.value) {
        documentFileInput.value.value = '';
      }
      return;
    }
    newDocumentFile.value = file;
    removeDocument.value = false;
  }
}

function removeNewDocument() {
  newDocumentFile.value = null;
  if (documentFileInput.value) {
    documentFileInput.value.value = '';
  }
}

function removeExistingDocument() {
  removeDocument.value = true;
}

function getDocumentName(path: string) {
  if (!path) return '';
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function downloadDocument() {
  if (props.contract && props.contract.id) {
    contractStore.downloadContractDocument(props.contract.id);
  }
}

async function handleSubmit() {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  
  try {
    const formDataToSave = { ...formData.value };
    
    // Convertir fechas a objetos Date para que se manejen correctamente en el backend
    if (formDataToSave.startDate) {
      formDataToSave.startDate = new Date(formDataToSave.startDate).toISOString();
    }
    
    if (formDataToSave.endDate) {
      formDataToSave.endDate = new Date(formDataToSave.endDate).toISOString();
    }
    
    // Si hay un contrato existente, actualizarlo
    if (props.contract) {
      // Solo pasar el documento si hay uno nuevo o si se quiere eliminar el existente
      emit('save', { 
        formData: formDataToSave, 
        documentFile: newDocumentFile.value,
        removeDocument: removeDocument.value 
      });
    } else {
      // Nuevo contrato
      emit('save', { 
        formData: formDataToSave, 
        documentFile: newDocumentFile.value 
      });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    notification.error('Ha ocurrido un error al guardar el contrato');
  } finally {
    isSubmitting.value = false;
  }
}

function handleCancel() {
  emit('update:visible', false);
  resetForm();
}
</script>