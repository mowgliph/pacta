<template>
  <div class="bg-surface dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-text-primary dark:text-white">License Status</h3>
      <StatusBadge :status="mapLicenseStatusToBadge(licenseStore.licenseStatus)" />
    </div>
    
    <div class="flex items-start gap-4 p-5 rounded-lg bg-background dark:bg-gray-750" :class="statusClass">
      <div class="text-2xl flex-shrink-0" :class="statusIconColor">
        <i :class="statusIcon" class="transition-all duration-300"></i>
      </div>
      
      <div class="flex-1 space-y-3">
        <p class="font-medium text-text-primary dark:text-gray-200">
          {{ licenseStore.currentLicense?.message || getLicenseMessage(licenseStore.licenseStatus) }}
        </p>
        
        <div v-if="licenseStore.currentLicense" 
             class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-text-secondary dark:text-gray-400">
          <div class="flex items-center gap-2">
            <i class="fas fa-tag text-xs"></i>
            <span>{{ licenseStore.currentLicense.type }}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-calendar text-xs"></i>
            <span>{{ formatDate(licenseStore.currentLicense.expiryDate) }}</span>
          </div>
          <div v-if="licenseStore.currentLicense.customerName" class="flex items-center gap-2 sm:col-span-2">
            <i class="fas fa-user text-xs"></i>
            <span>{{ licenseStore.currentLicense.customerName }}</span>
          </div>
          <div v-if="daysRemaining !== null" class="flex items-center gap-2 sm:col-span-2">
            <i class="fas fa-clock text-xs"></i>
            <span>{{ daysRemaining }} days remaining</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showActions" class="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
      <BaseButton
        v-if="isExpiringSoon"
        variant="primary"
        icon="fas fa-sync-alt"
        @click="handleRenewal"
      >
        Renew License
      </BaseButton>
      <BaseButton
        v-if="!licenseStore.currentLicense"
        variant="secondary"
        icon="fas fa-key"
        @click="$emit('activate')"
      >
        Activate License
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useLicenseStore } from '@/stores/license';
import { format, differenceInDays } from 'date-fns';
import BaseButton from '@/components/base/BaseButton.vue';
import StatusBadge from '@/components/base/StatusBadge.vue';

const props = defineProps<{
  showActions?: boolean
}>();

const emit = defineEmits<{
  (e: 'activate'): void
  (e: 'renew'): void
}>();

const licenseStore = useLicenseStore();

onMounted(async () => {
  await licenseStore.checkLicenseStatus();
});

const statusClass = computed(() => ({
  'bg-success/5 border border-success/10': licenseStore.licenseStatus === 'VALID',
  'bg-warning/5 border border-warning/10': licenseStore.licenseStatus === 'EXPIRING_SOON',
  'bg-error/5 border border-error/10': ['EXPIRED', 'NO_LICENSE', 'ERROR'].includes(licenseStore.licenseStatus)
}));

const statusIconColor = computed(() => ({
  'text-success': licenseStore.licenseStatus === 'VALID',
  'text-warning': licenseStore.licenseStatus === 'EXPIRING_SOON',
  'text-error': ['EXPIRED', 'NO_LICENSE', 'ERROR'].includes(licenseStore.licenseStatus)
}));

const statusIcon = computed(() => ({
  VALID: 'fas fa-check-circle',
  EXPIRING_SOON: 'fas fa-exclamation-triangle',
  EXPIRED: 'fas fa-times-circle',
  NO_LICENSE: 'fas fa-ban',
  ERROR: 'fas fa-exclamation-circle'
}[licenseStore.licenseStatus] || 'fas fa-exclamation-circle'));

const daysRemaining = computed(() => {
  if (!licenseStore.currentLicense?.expiryDate) return null;
  return differenceInDays(new Date(licenseStore.currentLicense.expiryDate), new Date());
});

const isExpiringSoon = computed(() => licenseStore.licenseStatus === 'EXPIRING_SOON');

function getLicenseMessage(status: string) {
  return {
    VALID: 'Your license is active and valid.',
    EXPIRING_SOON: 'Your license will expire soon. Please renew to maintain access.',
    EXPIRED: 'Your license has expired. Please renew to restore access.',
    NO_LICENSE: 'No valid license found. Please activate a license to continue.',
    ERROR: 'There was an error checking your license status.'
  }[status] || 'Unknown license status';
}

function formatDate(date: string) {
  return format(new Date(date), 'MMM dd, yyyy');
}

function handleRenewal() {
  emit('renew');
}

function mapLicenseStatusToBadge(status: string): 'active' | 'inactive' | 'expired' | 'pending' | 'draft' | 'terminated' | 'renewed' {
  const statusMap = {
    'VALID': 'active',
    'EXPIRING_SOON': 'pending',
    'EXPIRED': 'expired',
    'NO_LICENSE': 'inactive',
    'ERROR': 'terminated'
  } as const;
  
  return statusMap[status as keyof typeof statusMap] || 'inactive';
}
</script>