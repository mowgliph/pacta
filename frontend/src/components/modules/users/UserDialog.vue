<template>
  <Dialog 
    v-model:visible="dialogVisible" 
    :header="user ? 'Editar Usuario' : 'Nuevo Usuario'" 
    :modal="true" 
    :dismissableMask="true"
    :closable="true"
    :style="{ width: '500px' }"
    class="user-dialog"
    :draggable="false"
    @hide="handleCancel"
  >
    <div class="p-fluid">
      <form @submit.prevent="handleSubmit" class="user-form">
        <div class="p-field mb-3">
          <label for="username" class="font-bold mb-2 block">Nombre de Usuario</label>
          <span class="p-input-icon-right w-full">
            <i class="pi pi-user" />
            <InputText 
              id="username"
              v-model="formData.username"
              :placeholder="user ? 'Nombre de usuario actual' : 'Escriba un nombre de usuario'"
              :class="{ 'p-invalid': v$.value.username.$error }"
              aria-describedby="username-help"
              :disabled="!!user"
              autocomplete="off"
            />
          </span>
          <small v-if="v$.value.username.$error" id="username-help" class="p-error">
            {{ v$.value.username.$errors[0].$message }}
          </small>
        </div>

        <div class="p-field mb-3">
          <label for="email" class="font-bold mb-2 block">Correo Electrónico</label>
          <span class="p-input-icon-right w-full">
            <i class="pi pi-envelope" />
            <InputText 
              id="email"
              v-model="formData.email"
              :placeholder="user ? 'Email actual' : 'Escriba un correo electrónico'"
              :class="{ 'p-invalid': v$.value.email.$error }"
              aria-describedby="email-help"
              autocomplete="off"
            />
          </span>
          <small v-if="v$.value.email.$error" id="email-help" class="p-error">
            {{ v$.value.email.$errors[0].$message }}
          </small>
        </div>

        <div class="p-field mb-3">
          <label for="password" class="font-bold mb-2 block">
            {{ user ? 'Nueva Contraseña (dejar vacío para mantener la actual)' : 'Contraseña' }}
          </label>
          <span class="p-input-icon-right w-full">
            <i 
              :class="passwordVisible ? 'pi pi-eye-slash cursor-pointer' : 'pi pi-eye cursor-pointer'" 
              @click="togglePasswordVisibility"
            />
            <Password 
              id="password"
              v-model="formData.password"
              :placeholder="user ? 'Nueva contraseña (opcional)' : 'Escriba una contraseña'"
              :class="{ 'p-invalid': v$.value.password.$error }"
              :feedback="true"
              :toggleMask="true"
              aria-describedby="password-help"
              autocomplete="new-password"
              :promptLabel="'Ingrese una contraseña'"
              :weakLabel="'Débil'"
              :mediumLabel="'Media'"
              :strongLabel="'Fuerte'"
              :disabled="processingForm"
            />
          </span>
          <small v-if="v$.value.password.$error" id="password-help" class="p-error">
            {{ v$.value.password.$errors[0].$message }}
          </small>
        </div>

        <div class="p-field mb-3">
          <label for="role" class="font-bold mb-2 block">Rol de Usuario</label>
          <Dropdown 
            id="role"
            v-model="formData.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione un rol"
            :class="{ 'p-invalid': v$.value.role.$error }"
            aria-describedby="role-help"
            :disabled="processingForm || (!!user && user?.username === 'admin')"
          />
          <small v-if="v$.value.role.$error" id="role-help" class="p-error">
            {{ v$.value.role.$errors[0].$message }}
          </small>
          <small v-if="user && user.username === 'admin'" class="text-xs text-color-secondary">
            No se puede cambiar el rol del administrador principal
          </small>
        </div>

        <div v-if="!user" class="p-field mb-3">
          <Checkbox id="active" v-model="formData.active" :binary="true" />
          <label for="active" class="ml-2">Usuario activo</label>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          @click="handleCancel" 
          class="p-button-text" 
          :disabled="processingForm"
        />
        <Button 
          label="Guardar" 
          icon="pi pi-check" 
          @click="handleSubmit" 
          :loading="processingForm"
          autofocus
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import type { User } from '@/types/user';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, helpers } from '@vuelidate/validators';

// Define las propiedades
const props = defineProps<{
  visible: boolean;
  user?: User | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: User): void;
}>();

// Estado local
const passwordVisible = ref(false);
const processingForm = ref(false);
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// Opciones para roles
const roleOptions = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Usuario Avanzado', value: 'advanced' },
  { label: 'Solo Lectura', value: 'readonly' }
];

// Formulario y validación
const formData = reactive({
  id: undefined as number | undefined,
  username: '',
  email: '',
  password: '',
  role: 'readonly' as 'admin' | 'advanced' | 'readonly',
  active: true,
  firstLogin: false,
  createdAt: undefined as string | undefined,
  updatedAt: undefined as string | undefined
});

// Reglas de validación
const rules = computed(() => ({
  username: {
    required: helpers.withMessage('El nombre de usuario es obligatorio', required),
    minLength: helpers.withMessage(
      'El nombre de usuario debe tener al menos 3 caracteres',
      minLength(3)
    )
  },
  email: {
    required: helpers.withMessage('El correo electrónico es obligatorio', required),
    email: helpers.withMessage('Debe ingresar un correo electrónico válido', email)
  },
  password: {
    required: helpers.withMessage(
      'La contraseña es obligatoria',
      () => !props.user || !!formData.password
    ),
    minLength: helpers.withMessage(
      'La contraseña debe tener al menos 6 caracteres',
      () => !formData.password || formData.password.length >= 6
    )
  },
  role: {
    required: helpers.withMessage('El rol es obligatorio', required)
  }
}));

const v$ = useVuelidate(rules, formData);

// Observar cambios en el usuario seleccionado
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.username = newUser.username || '';
    formData.email = newUser.email || '';
    formData.password = '';
    formData.role = newUser.role || 'readonly';
    formData.active = newUser.active !== undefined ? newUser.active : true;
  } else {
    resetForm();
  }
}, { immediate: true });

// Manejar el envío del formulario
async function handleSubmit() {
  processingForm.value = true;
  
  try {
    const result = await v$.value.$validate();
    if (!result) {
      processingForm.value = false;
      return;
    }
    
    const userData: Partial<User> = { ...formData };
    
    // Si estamos editando y no cambió la contraseña, no la enviamos
    if (props.user && !userData.password) {
      userData.password = undefined;
    }
    
    // Si estamos editando, también enviamos el ID
    if (props.user && props.user.id) {
      userData.id = props.user.id;
    }
    
    emit('save', userData as User);
    resetForm();
    emit('update:visible', false);
  } finally {
    processingForm.value = false;
  }
}

// Cancelar el formulario
function handleCancel() {
  v$.value.$reset();
  resetForm();
  emit('update:visible', false);
}

// Restablecer el formulario
function resetForm() {
  formData.username = '';
  formData.email = '';
  formData.password = '';
  formData.role = 'readonly';
  formData.active = true;
  v$.value.$reset();
}

// Alternar visibilidad de la contraseña
function togglePasswordVisibility() {
  passwordVisible.value = !passwordVisible.value;
}
</script>

<style lang="scss" scoped>
.user-dialog {
  .user-form {
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 0.5rem;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--surface-ground);
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: var(--primary-color);
      border-radius: 4px;
    }
  }
  
  :deep(.p-password-input) {
    width: 100%;
  }
  
  :deep(.p-password-panel) {
    transform-origin: top;
  }
  
  :deep(.p-dropdown) {
    width: 100%;
  }
}
</style>