<template>
  <div class="settings-view">
    <div class="page-header">
      <h1>Configuración del Sistema</h1>
    </div>

    <!-- Configuración General -->
    <div class="settings-section">
      <div class="section-header">
        <h2>Configuración General</h2>
        <button class="btn-primary">
          <i class="fas fa-save"></i>
          Guardar Cambios
        </button>
      </div>

      <div class="settings-grid">
        <div class="setting-card">
          <h3>Información de la Empresa</h3>
          <div class="form-group">
            <label>Nombre de la Empresa</label>
            <input type="text" v-model="companyName" placeholder="Ingrese el nombre de la empresa" />
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input type="text" v-model="companyAddress" placeholder="Ingrese la dirección" />
          </div>
        </div>

        <div class="setting-card">
          <h3>Configuración de Notificaciones</h3>
          <div class="form-group">
            <label>Días de Anticipación para Alertas</label>
            <input type="number" v-model="notificationDays" min="1" max="90" />
          </div>
          <div class="form-group">
            <label>Correo Electrónico para Notificaciones</label>
            <input type="email" v-model="notificationEmail" placeholder="ejemplo@empresa.com" />
          </div>
        </div>

        <div class="setting-card">
          <h3>Configuración de Licencia</h3>
          <div class="form-group">
            <label>Código de Licencia</label>
            <input type="text" v-model="licenseCode" placeholder="Ingrese el código de licencia" />
            <button class="btn-secondary">
              <i class="fas fa-check"></i>
              Validar Licencia
            </button>
          </div>
          <div class="license-info">
            <p><strong>Estado:</strong> <span :class="licenseStatus">{{ licenseStatusText }}</span></p>
            <p><strong>Tipo:</strong> {{ licenseType }}</p>
            <p><strong>Vencimiento:</strong> {{ licenseExpiration }}</p>
          </div>
        </div>

        <div class="setting-card">
          <h3>Preferencias de Interfaz</h3>
          <div class="form-group">
            <label>Tema de la Aplicación</label>
            <select v-model="theme">
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
          <div class="form-group">
            <label>Idioma</label>
            <select v-model="language">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuración de Seguridad -->
    <div class="settings-section">
      <div class="section-header">
        <h2>Seguridad</h2>
        <button class="btn-primary">
          <i class="fas fa-save"></i>
          Guardar Cambios
        </button>
      </div>

      <div class="settings-grid">
        <div class="setting-card">
          <h3>Cambio de Contraseña</h3>
          <div class="form-group">
            <label>Contraseña Actual</label>
            <input type="password" v-model="currentPassword" />
          </div>
          <div class="form-group">
            <label>Nueva Contraseña</label>
            <input type="password" v-model="newPassword" />
          </div>
          <div class="form-group">
            <label>Confirmar Nueva Contraseña</label>
            <input type="password" v-model="confirmPassword" />
          </div>
          <button class="btn-primary">
            <i class="fas fa-key"></i>
            Cambiar Contraseña
          </button>
        </div>

        <div class="setting-card">
          <h3>Configuración de Sesión</h3>
          <div class="form-group">
            <label>Tiempo de Inactividad (minutos)</label>
            <input type="number" v-model="sessionTimeout" min="5" max="120" />
          </div>
          <div class="form-group">
            <label>Inicio de Sesión Automático</label>
            <div class="toggle-switch">
              <input type="checkbox" v-model="autoLogin" />
              <span class="toggle-slider"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Configuración General
const companyName = ref('')
const companyAddress = ref('')
const notificationDays = ref(30)
const notificationEmail = ref('')
const licenseCode = ref('')
const theme = ref('light')
const language = ref('es')

// Estado de la Licencia
const licenseStatus = ref('active')
const licenseStatusText = ref('Activa')
const licenseType = ref('Completa')
const licenseExpiration = ref('31/12/2024')

// Seguridad
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const sessionTimeout = ref(30)
const autoLogin = ref(false)
</script>

<style lang="scss" scoped>
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;

.settings-view {
  .page-header {
    margin-bottom: v.$spacing-xl;

    h1 {
      @include m.heading-1;
      color: c.$color-text-primary;
      margin: 0;
    }
  }

  .settings-section {
    @include m.card-style;
    margin-bottom: v.$spacing-xl;

    .section-header {
      @include m.flex-between;
      margin-bottom: v.$spacing-lg;

      h2 {
        @include m.heading-2;
        color: c.$color-text-primary;
        margin: 0;
      }
    }
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: v.$spacing-lg;
  }

  .setting-card {
    @include m.card-style;

    h3 {
      @include m.heading-3;
      color: c.$color-text-primary;
      margin: 0 0 v.$spacing-md;
    }

    .form-group {
      margin-bottom: v.$spacing-md;

      label {
        @include m.form-label;
        color: c.$color-text-secondary;
        margin-bottom: v.$spacing-xs;
      }

      input[type="text"],
      input[type="email"],
      input[type="password"],
      input[type="number"],
      select {
        @include m.input;
        width: 100%;
        padding: v.$spacing-sm;
        border: 1px solid c.$color-border;
        border-radius: v.$border-radius-md;
        background-color: c.$color-surface;
        color: c.$color-text-primary;
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: c.$color-primary;
          box-shadow: 0 0 0 2px rgba(c.$color-primary, 0.2);
        }
      }
    }

    .license-info {
      margin-top: v.$spacing-md;
      padding: v.$spacing-md;
      background-color: c.$color-background;
      border-radius: v.$border-radius-md;

      p {
        margin: v.$spacing-xs 0;
        @include m.body-text;
        color: c.$color-text-primary;

        strong {
          color: c.$color-text-secondary;
        }

        span {
          &.active {
            @include m.status-color('active');
          }

          &.expired {
            @include m.status-color('expired');
          }

          &.pending {
            @include m.status-color('pending');
          }
        }
      }
    }
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;

    input {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .toggle-slider {
        background-color: c.$color-primary;
      }

      &:checked + .toggle-slider:before {
        transform: translateX(26px);
      }
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: c.$color-border;
      transition: .4s;
      border-radius: 24px;

      &:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: c.$color-surface;
        transition: .4s;
        border-radius: 50%;
      }
    }
  }
}

// Utility Classes
.btn-primary {
  @include m.button-theme('primary');
}

.btn-secondary {
  @include m.button-theme('secondary');
}

@media (max-width: v.$breakpoint-md) {
  .settings-view {
    .settings-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      @include m.flex-column;
      gap: v.$spacing-md;
      align-items: flex-start;
    }
  }
}
</style> 