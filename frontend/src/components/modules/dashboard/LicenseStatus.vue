<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">License Status</h3>
    
    <div class="flex items-start gap-3 p-4 rounded-lg" :class="statusClass">
      <div class="text-2xl">
        <i :class="statusIcon"></i>
      </div>
      
      <template>
        <div class="flex-1">
          <p class="font-medium text-gray-800 dark:text-gray-200 mb-2">
            {{ licenseStore.currentLicense?.message || getLicenseMessage(licenseStore.licenseStatus) }}
          </p>
          <div class="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400" v-if="licenseStore.currentLicense">
            <span>Type: {{ licenseStore.currentLicense.type }}</span>
            <span>Expires: {{ formatDate(licenseStore.currentLicense.expiryDate) }}</span>
            <span v-if="licenseStore.currentLicense.customerName">
              Customer: {{ licenseStore.currentLicense.customerName }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <div v-if="isExpiringSoon" class="mt-4 text-center">
      <button @click="handleRenewal" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
        <i class="fas fa-sync-alt"></i>
        Renew License
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useLicenseStore } from '../../../stores/license';
import { format } from 'date-fns';

const licenseStore = useLicenseStore();

onMounted(async () => {
  await licenseStore.checkLicenseStatus();
});

const statusClass = computed(() => {
  const status = licenseStore.licenseStatus;
  return {
    'bg-success/10 text-success': status === 'VALID',
    'bg-warning/10 text-warning': status === 'EXPIRING_SOON',
    'bg-error/10 text-error': ['EXPIRED', 'NO_LICENSE', 'ERROR'].includes(status)
  };
});

const statusIcon = computed(() => {
  const status = licenseStore.licenseStatus as 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_LICENSE' | 'ERROR';
  const icons = {
    VALID: 'fas fa-check-circle',
    EXPIRING_SOON: 'fas fa-exclamation-triangle',
    EXPIRED: 'fas fa-times-circle',
    NO_LICENSE: 'fas fa-ban',
    ERROR: 'fas fa-exclamation-circle'
  } as const;
  return icons[status] || icons.ERROR;
});

function getLicenseMessage(status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_LICENSE' | 'ERROR') {
  const messages = {
    VALID: 'Your license is active and valid.',
    EXPIRING_SOON: 'Your license will expire soon. Please renew to maintain access.',
    EXPIRED: 'Your license has expired. Please renew to restore access.',
    NO_LICENSE: 'No valid license found. Please activate a license to continue.',
    ERROR: 'There was an error checking your license status.'
  } as const;
  return messages[status] || messages.ERROR;
}

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