<template>
  <div class="licenses">
    <header class="licenses__header">
      <h1>License Management</h1>
      <BaseButton 
        variant="primary"
        icon="fas fa-plus"
        @click="handleUploadClick"
      >
        Upload License
      </BaseButton>
    </header>

    <div class="licenses__content">
      <LicenseStatus class="licenses__status" />
      
      <div class="licenses__history">
        <h2>License History</h2>
        <table v-if="licenses.length">
          <thead>
            <tr>
              <th>License Key</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="license in licenses" :key="license.id">
              <td>{{ license.licenseKey }}</td>
              <td>{{ license.type }}</td>
              <td>{{ formatDate(license.startDate) }}</td>
              <td>{{ formatDate(license.expiryDate) }}</td>
              <td>
                <StatusBadge :status="getLicenseStatus(license)" />
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="no-data">No license history available</p>
      </div>
    </div>

    <input 
      type="file" 
      ref="fileInput"
      accept=".json"
      style="display: none"
      @change="handleFileUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { format } from 'date-fns';
import { useLicenseStore } from '../../stores/license';
import { useToast } from '../../types/useToast';
import BaseButton from '../../components/base/BaseButton.vue';
import StatusBadge from '../../components/base/StatusBadge.vue';
import LicenseStatus from '../../components/modules/dashboard/LicenseStatus.vue';
import type { License } from '../../types/license';

const licenseStore = useLicenseStore();
const toast = useToast();
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
    toast.error(error instanceof Error ? error.message : 'Failed to load license history');
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
    toast.success('License uploaded successfully');
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to upload license');
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
    toast.error(error instanceof Error ? error.message : 'Failed to load license history');
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/main.scss';

.licenses {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-unit * 4;
  }

  &__content {
    display: grid;
    gap: $spacing-unit * 4;
  }

  &__history {
    background: white;
    border-radius: $border-radius;
    padding: $spacing-unit * 3;
    box-shadow: $shadow-sm;

    h2 {
      margin-bottom: $spacing-unit * 3;
    }

    table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: $spacing-unit * 2;
        text-align: left;
        border-bottom: 1px solid $color-border;
      }

      th {
        font-weight: $font-weight-bold;
        color: $color-text-secondary;
      }
    }
  }
}

.no-data {
  text-align: center;
  color: $color-text-secondary;
  padding: $spacing-unit * 4;
}
</style>