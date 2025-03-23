<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content">
      <div class="dialog-header">
        <h2>{{ contract ? 'Editar Contrato' : 'Nuevo Contrato' }}</h2>
        <button @click="handleCancel" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="contract-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="title">Título</label>
            <input 
              id="title"
              v-model="formData.title"
              type="text"
              required
              :class="{ 'error': errors.title }"
              placeholder="Ingrese el título del contrato"
            />
            <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
          </div>

          <div class="form-group">
            <label for="contractNumber">Número de Contrato</label>
            <input 
              id="contractNumber"
              v-model="formData.contractNumber"
              type="text"
              required
              :class="{ 'error': errors.contractNumber }"
              placeholder="Ej: CONT-2023-001"
            />
            <span v-if="errors.contractNumber" class="error-message">
              {{ errors.contractNumber }}
            </span>
          </div>

          <div class="form-group">
            <label for="startDate">Fecha de Inicio</label>
            <input 
              id="startDate"
              v-model="formData.startDate"
              type="date"
              required
              :class="{ 'error': errors.startDate }"
            />
            <span v-if="errors.startDate" class="error-message">{{ errors.startDate }}</span>
          </div>

          <div class="form-group">
            <label for="endDate">Fecha de Fin</label>
            <input 
              id="endDate"
              v-model="formData.endDate"
              type="date"
              required
              :min="formData.startDate"
              :class="{ 'error': errors.endDate }"
            />
            <span v-if="errors.endDate" class="error-message">{{ errors.endDate }}</span>
          </div>

          <div class="form-group">
            <label for="amount">Importe</label>
            <input 
              id="amount"
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              required
              :class="{ 'error': errors.amount }"
              placeholder="0.00"
            />
            <span v-if="errors.amount" class="error-message">{{ errors.amount }}</span>
          </div>

          <div class="form-group">
            <label for="currency">Moneda</label>
            <select 
              id="currency"
              v-model="formData.currency"
              required
            >
              <option value="CUP">CUP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div class="form-group">
            <label for="status">Estado</label>
            <select 
              id="status"
              v-model="formData.status"
              required
            >
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="expired">Vencido</option>
              <option value="terminated">Terminado</option>
              <option value="renewed">Renovado</option>
            </select>
          </div>

          <div class="form-group">
            <label for="notificationDays">Días de Notificación</label>
            <input 
              id="notificationDays"
              v-model.number="formData.notificationDays"
              type="number"
              min="1"
              max="90"
              required
              placeholder="30"
            />
            <small class="input-help">Días de antelación para notificar vencimiento</small>
          </div>

          <div class="form-group full-width">
            <label for="description">Descripción</label>
            <textarea 
              id="description"
              v-model="formData.description"
              rows="4"
              :class="{ 'error': errors.description }"
              placeholder="Describa los detalles del contrato..."
            ></textarea>
            <span v-if="errors.description" class="error-message">
              {{ errors.description }}
            </span>
          </div>

          <div class="form-group full-width document-upload">
            <label>Documento del Contrato</label>
            <div class="document-container">
              <div v-if="contract && contract.documentPath && !newDocumentFile" class="existing-document">
                <i class="fas fa-file-alt"></i>
                <span>{{ getDocumentName(contract.documentPath) }}</span>
                <button type="button" @click="downloadDocument" class="btn-text">
                  <i class="fas fa-download"></i> Descargar
                </button>
                <button type="button" @click="removeExistingDocument" class="btn-text btn-danger">
                  <i class="fas fa-trash"></i> Eliminar
                </button>
              </div>
              <div v-else class="document-upload-area">
                <input 
                  type="file" 
                  id="documentFile" 
                  ref="documentFileInput"
                  @change="handleFileChange" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  class="file-input"
                />
                <div v-if="newDocumentFile" class="selected-file">
                  <i class="fas fa-file"></i>
                  <span>{{ newDocumentFile.name }}</span>
                  <button type="button" @click="removeNewDocument" class="btn-text btn-danger">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <label v-else for="documentFile" class="file-upload-label">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <span>Seleccione un archivo o arrástrelo aquí</span>
                  <small>PDF, Word, Excel o TXT (máx. 10MB)</small>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button type="button" @click="handleCancel" class="btn-secondary">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
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

<style lang="scss" scoped>
@use './contractDialog.scss';

.document-upload {
  margin-top: 1rem;
  
  .document-container {
    margin-top: 0.5rem;
    
    .existing-document {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-secondary);
      
      i {
        font-size: 1.2rem;
        color: var(--text-secondary);
      }
      
      span {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .btn-text {
        padding: 0.25rem 0.5rem;
        color: var(--primary-color);
        
        &.btn-danger {
          color: var(--danger-color);
        }
      }
    }
    
    .document-upload-area {
      position: relative;
      
      .file-input {
        display: none;
      }
      
      .file-upload-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        border: 2px dashed var(--border-color);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        
        i {
          font-size: 2rem;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }
        
        span {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        small {
          color: var(--text-secondary);
        }
        
        &:hover {
          border-color: var(--primary-color);
          background-color: var(--bg-hover);
        }
      }
      
      .selected-file {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border: 1px solid var(--success-color);
        border-radius: 4px;
        background-color: var(--success-bg);
        
        i {
          font-size: 1.2rem;
          color: var(--success-color);
        }
        
        span {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        button {
          padding: 0.25rem 0.5rem;
          color: var(--danger-color);
        }
      }
    }
  }
}

.input-help {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h2 {
    margin: 0;
  }
  
  .close-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.25rem;
    cursor: pointer;
    
    &:hover {
      color: var(--text-primary);
    }
  }
}
</style>