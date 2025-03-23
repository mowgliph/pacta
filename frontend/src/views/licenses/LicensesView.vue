<template>
  <div class="p-6 bg-background dark:bg-gray-900">
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-border dark:border-gray-700">
      <div>
        <h1 class="text-2xl font-bold text-text-primary dark:text-white mb-1">License Management</h1>
        <p class="text-text-secondary dark:text-gray-400 text-sm">Manage and monitor your software licenses</p>
      </div>
      <div class="flex gap-3">
        <BaseButton 
          variant="secondary"
          icon="fas fa-key"
          @click="showActivationModal = true"
        >
          Activate License
        </BaseButton>
        <BaseButton 
          variant="primary"
          icon="fas fa-upload"
          @click="handleUploadClick"
        >
          Upload License
        </BaseButton>
      </div>
    </header>

    <div class="grid gap-8">
      <LicenseStatus 
        class="w-full" 
        :show-actions="true"
        @activate="showActivationModal = true"
        @renew="handleRenewal"
      />
      
      <div class="bg-surface dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 class="text-xl font-semibold text-text-primary dark:text-white">License History</h2>
          <div class="flex items-center gap-2">
            <BaseInput
              v-model="searchQuery"
              placeholder="Search licenses..."
              class="w-64"
              icon="fas fa-search"
              id="license-search"
            />
            <BaseSelect
              v-model="filterStatus"
              :options="statusOptions"
              class="w-40"
              id="status-filter"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table v-if="filteredLicenses.length" class="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">
                  License Key
                </th>
                <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">
                  Type
                </th>
                <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">
                  Start Date
                </th>
                <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">
                  Expiry Date
                </th>
                <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">
                  Status
                </th>
                <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="license in filteredLicenses" 
                  :key="license.id" 
                  class="hover:bg-background dark:hover:bg-gray-750 transition-colors">
                <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-key text-xs text-text-secondary"></i>
                    {{ license.licenseKey }}
                  </div>
                </td>
                <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">
                  <Badge :type="license.type.toLowerCase()" />
                </td>
                <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">
                  {{ formatDate(license.startDate) }}
                </td>
                <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">
                  {{ formatDate(license.expiryDate) }}
                </td>
                <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">
                  <StatusBadge :status="getLicenseStatus(license)" />
                </td>
                <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">
                  <div class="flex items-center gap-2">
                    <button 
                      class="text-text-secondary hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                      @click="viewLicenseDetails(license)"
                      title="View Details"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      v-if="isExpired(license)"
                      class="text-text-secondary hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                      @click="handleRenewal(license)"
                      title="Renew License"
                    >
                      <i class="fas fa-sync-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else-if="loading" class="py-8">
            <LoadingSpinner />
          </div>
          <p v-else class="text-center text-text-secondary dark:text-gray-400 py-8">
            {{ searchQuery ? 'No licenses match your search' : 'No license history available' }}
          </p>
        </div>
      </div>
    </div>

    <input 
      type="file" 
      ref="fileInput"
      accept=".json"
      class="hidden"
      @change="handleFileUpload"
    />

    <!-- License Activation Modal -->
    <BaseDialog
      v-model="showActivationModal"
      title="Activate License"
      size="sm"
    >
      <div class="space-y-4">
        <BaseInput
          v-model="activationCode"
          label="License Code"
          placeholder="Enter your license code"
          :error="activationError"
          id="activation-code"
        />
        <p class="text-sm text-text-secondary dark:text-gray-400">
          Enter your license code to activate. If you don't have one, please contact support.
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton
            variant="secondary"
            @click="showActivationModal = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            :loading="activating"
            @click="handleActivation"
          >
            Activate
          </BaseButton>
        </div>
      </template>
    </BaseDialog>

    <!-- License Details Modal -->
    <BaseDialog
      v-model="showDetailsModal"
      title="License Details"
      size="md"
    >
      <div v-if="selectedLicense" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-text-secondary">License Key</label>
            <p class="text-text-primary dark:text-white">{{ selectedLicense.licenseKey }}</p>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-text-secondary">Type</label>
            <Badge :type="selectedLicense.type.toLowerCase()" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-text-secondary">Start Date</label>
            <p class="text-text-primary dark:text-white">{{ formatDate(selectedLicense.startDate) }}</p>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-text-secondary">Expiry Date</label>
            <p class="text-text-primary dark:text-white">{{ formatDate(selectedLicense.expiryDate) }}</p>
          </div>
          <div class="col-span-2 space-y-2">
            <label class="text-sm font-medium text-text-secondary">Features</label>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="(value, key) in selectedLicense.features" :key="key" 
                   class="flex items-center gap-2 text-sm text-text-primary dark:text-white">
                <i class="fas fa-check text-success text-xs"></i>
                {{ formatFeatureName(key) }}: {{ value }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { format } from 'date-fns';
import { useLicenseStore } from '@/stores/license';
import useNotification from '@/composables/useNotification.ts';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseDialog from '@/components/base/BaseDialog.vue';
import StatusBadge from '@/components/base/StatusBadge.vue';
import Badge from '@/components/base/Badge.vue';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import LicenseStatus from '@/components/modules/dashboard/LicenseStatus.vue';
import type { License } from '@/types/license';

const licenseStore = useLicenseStore();
const notification = useNotification();
const fileInput = ref<HTMLInputElement | null>(null);
const licenses = ref<License[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const filterStatus = ref('all');
const showActivationModal = ref(false);
const showDetailsModal = ref(false);
const selectedLicense = ref<License | null>(null);
const activationCode = ref('');
const activationError = ref('');
const activating = ref(false);

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  { label: 'Inactive', value: 'inactive' }
];

const filteredLicenses = computed(() => {
  let result = [...licenses.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(license => 
      license.licenseKey.toLowerCase().includes(query) ||
      license.type.toLowerCase().includes(query)
    );
  }
  
  if (filterStatus.value !== 'all') {
    result = result.filter(license => getLicenseStatus(license) === filterStatus.value);
  }
  
  return result;
});

onMounted(async () => {
  await fetchLicenseHistory();
  await notification.fetchNotifications({ category: 'LICENSE' });
  await notification.getUnreadCount('LICENSE');
});

async function fetchLicenseHistory() {
  loading.value = true;
  try {
    const response = await fetch('/api/v1/licenses/history');
    if (!response.ok) {
      throw new Error('Failed to fetch license history');
    }
    licenses.value = await response.json();
  } catch (error) {
    notification.error(error instanceof Error ? error.message : 'Failed to load license history', {
      category: 'LICENSE',
      metadata: { action: 'fetchHistory' }
    });
  } finally {
    loading.value = false;
  }
}

function formatDate(date: string) {
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
}

function getLicenseStatus(license: License): 'active' | 'inactive' | 'expired' {
  const now = new Date();
  const expiryDate = new Date(license.expiryDate);
  
  if (!license.active) return 'inactive';
  if (now > expiryDate) return 'expired';
  return 'active';
}

function isExpired(license: License): boolean {
  return getLicenseStatus(license) === 'expired';
}

function handleUploadClick() {
  fileInput.value?.click();
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  const formData = new FormData();
  formData.append('license', file);

  try {
    const response = await fetch('/api/v1/licenses/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload license');
    }
    
    await licenseStore.checkLicenseStatus();
    await fetchLicenseHistory();
    notification.success('License uploaded successfully', {
      category: 'LICENSE',
      metadata: { action: 'upload' }
    });
  } catch (error) {
    notification.error(error instanceof Error ? error.message : 'Failed to upload license', {
      category: 'LICENSE',
      metadata: { action: 'upload' }
    });
  } finally {
    if (target) target.value = '';
  }
}

async function handleActivation() {
  if (!activationCode.value.trim()) {
    activationError.value = 'Please enter a license code';
    return;
  }

  activating.value = true;
  try {
    await licenseStore.activateLicense(activationCode.value.trim());
    await fetchLicenseHistory();
    showActivationModal.value = false;
    notification.success('License activated successfully', {
      category: 'LICENSE',
      metadata: { action: 'activate' }
    });
  } catch (error) {
    activationError.value = error instanceof Error ? error.message : 'Failed to activate license';
    notification.error(activationError.value, {
      category: 'LICENSE',
      metadata: { action: 'activate' }
    });
  } finally {
    activating.value = false;
  }
}

async function handleRenewal(license?: License) {
  if (!license) return;
  
  try {
    const response = await fetch(`/api/v1/licenses/${license.licenseKey}/renew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ period: 12 }) // 12 meses por defecto
    });

    if (!response.ok) {
      throw new Error('Failed to renew license');
    }

    await fetchLicenseHistory();
    notification.success('License renewed successfully', {
      category: 'LICENSE',
      metadata: { 
        action: 'renew',
        licenseKey: license.licenseKey
      }
    });
  } catch (error) {
    notification.error(error instanceof Error ? error.message : 'Failed to renew license', {
      category: 'LICENSE',
      metadata: { 
        action: 'renew',
        licenseKey: license.licenseKey
      }
    });
  }
}

function viewLicenseDetails(license: License) {
  selectedLicense.value = license;
  showDetailsModal.value = true;
}

function formatFeatureName(key: string): string {
  return key
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
</script>