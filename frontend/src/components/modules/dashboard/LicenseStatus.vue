<template>
  <div class="license-status">
    <h3 class="license-status__title">License Status</h3>
    
    <div class="license-info" :class="statusClass">
      <div class="license-info__icon">
        <i :class="statusIcon"></i>
      </div>
      
      <div class="license-info__content">
        <p class="license-info__message">{{ licenseStore.currentLicense?.message }}</p>
        <div class="license-info__details" v-if="licenseStore.currentLicense">
          <span>Type: {{ licenseStore.currentLicense.type }}</span>
          <span>Expires: {{ formatDate(licenseStore.currentLicense.expiryDate) }}</span>
          <span v-if="licenseStore.currentLicense.customerName">
            Customer: {{ licenseStore.currentLicense.customerName }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="isExpiringSoon" class="license-action">
      <button @click="handleRenewal" class="btn-renew">
        <i class="fas fa-sync-alt"></i>
        Renew License
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useLicenseStore } from '@/stores/license';
import { format } from 'date-fns';

const licenseStore = useLicenseStore();

onMounted(async () => {
  await licenseStore.checkLicenseStatus();
});

const statusClass = computed(() => {
  const status = licenseStore.licenseStatus;
  return {
    'license-info--valid': status === 'VALID',
    'license-info--warning': status === 'EXPIRING_SOON',
    'license-info--error': ['EXPIRED', 'NO_LICENSE', 'ERROR'].includes(status)
  };
});

const statusIcon = computed(() => {
  const status = licenseStore.licenseStatus;
  const icons = {
    VALID: 'fas fa-check-circle',
    EXPIRING_SOON: 'fas fa-exclamation-triangle',
    EXPIRED: 'fas fa-times-circle',
    NO_LICENSE: 'fas fa-ban',
    ERROR: 'fas fa-exclamation-circle'
  };
  return icons[status] || icons.ERROR;
});

const isExpiringSoon = computed(() => {
  return licenseStore.licenseStatus === 'EXPIRING_SOON';
});

function formatDate(date: string) {
  return format(new Date(date), 'MMM dd, yyyy');
}

function handleRenewal() {
  // Implement license renewal logic
  console.log('License renewal requested');
}
</script>

<style lang="scss" scoped>
.license-status {
  &__title {
    color: $color-text-primary;
    margin-bottom: $spacing-unit * 3;
  }
}

.license-info {
  display: flex;
  align-items: flex-start;
  gap: $spacing-unit * 2;
  padding: $spacing-unit * 3;
  border-radius: $border-radius;
  background: rgba($color-background, 0.5);

  &--valid {
    background: rgba(#10B981, 0.1);
    .license-info__icon {
      color: #10B981;
    }
  }

  &--warning {
    background: rgba(#F59E0B, 0.1);
    .license-info__icon {
      color: #F59E0B;
    }
  }

  &--error {
    background: rgba(#EF4444, 0.1);
    .license-info__icon {
      color: #EF4444;
    }
  }

  &__icon {
    font-size: 1.5rem;
  }

  &__content {
    flex: 1;
  }

  &__message {
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-unit;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: $spacing-unit;
    font-size: 0.875rem;
    color: $color-text-secondary;
  }
}

.license-action {
  margin-top: $spacing-unit * 3;
  text-align: center;
}

.btn-renew {
  display: inline-flex;
  align-items: center;
  gap: $spacing-unit;
  padding: $spacing-unit * 1.5 $spacing-unit * 3;
  background: $color-accent;
  color: white;
  border: none;
  border-radius: $border-radius;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}
</style>