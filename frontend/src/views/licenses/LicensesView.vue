<template>
  <div class="p-6 bg-background dark:bg-gray-900">
    <header class="flex justify-between items-center mb-8 pb-4 border-b border-border dark:border-gray-700">
      <h1 class="text-2xl font-bold text-text-primary dark:text-white">License Management</h1>
      <BaseButton 
        variant="primary"
        icon="fas fa-plus"
        @click="handleUploadClick"
      >
        Upload License
      </BaseButton>
    </header>

    <div class="grid gap-8">
      <LicenseStatus class="w-full" />
      
      <div class="bg-surface dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold mb-6 text-text-primary dark:text-white">License History</h2>
        <table v-if="licenses.length" class="w-full border-collapse">
          <thead>
            <tr>
              <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">License Key</th>
              <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">Type</th>
              <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">Start Date</th>
              <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">Expiry Date</th>
              <th class="p-4 text-left font-semibold text-text-secondary dark:text-gray-400 border-b border-border dark:border-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="license in licenses" :key="license.id" class="hover:bg-gray-50 dark:hover:bg-gray-750">
              <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">{{ license.licenseKey }}</td>
              <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">{{ license.type }}</td>
              <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">{{ formatDate(license.startDate) }}</td>
              <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">{{ formatDate(license.expiryDate) }}</td>
              <td class="p-4 text-text-primary dark:text-white border-b border-border dark:border-gray-700">
                <StatusBadge :status="getLicenseStatus(license)" />
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-center text-text-secondary dark:text-gray-400 py-8">No license history available</p>
      </div>
    </div>

    <input 
      type="file" 
      ref="fileInput"
      accept=".json"
      class="hidden"
      @change="handleFileUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { format } from 'date-fns';
import { useLicenseStore } from '../../stores/license';
import { useNotification } from '../../types/useNotification';
import BaseButton from '../../components/base/BaseButton.vue';
import StatusBadge from '../../components/base/StatusBadge.vue';
import LicenseStatus from '../../components/modules/dashboard/LicenseStatus.vue';
import type { License } from '../../types/license';

const licenseStore = useLicenseStore();
const notification = useNotification();
const fileInput = ref<HTMLInputElement | null>(null);
const licenses = ref<License[]>([]);

onMounted(async () => {
  try {
    const response = await fetch('/api/licenses/history');
    if (!response.ok) {
      throw new Error('Failed to fetch license history');
    }
    licenses.value = await response.json();
  } catch (error) {
    notification.error(error instanceof Error ? error.message : 'Failed to load license history');
  }
});

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
    const response = await fetch('/api/licenses/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload license');
    }
    
    await licenseStore.checkLicenseStatus();
    await fetchLicenseHistory();
    notification.success('License uploaded successfully');
  } catch (error) {
    notification.error(error instanceof Error ? error.message : 'Failed to upload license');
  } finally {
    if (target) target.value = '';
  }
}

async function fetchLicenseHistory() {
  try {
    const response = await fetch('/api/licenses/history');
    if (!response.ok) {
      throw new Error('Failed to fetch license history');
    }
    licenses.value = await response.json();
  } catch (error) {
    notification.error(error instanceof Error ? error.message : 'Failed to load license history');
  }
}
</script>