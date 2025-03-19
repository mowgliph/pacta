<template>
  <div class="contracts-table">
    <table v-if="contracts.length">
      <thead>
        <tr>
          <th>Contract Number</th>
          <th>Title</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="contract in contracts" :key="contract.id">
          <td>{{ contract.contractNumber }}</td>
          <td>{{ contract.title }}</td>
          <td>{{ formatDate(contract.startDate) }}</td>
          <td>{{ formatDate(contract.endDate) }}</td>
          <td>
            <span class="status-badge" :class="getStatusClass(contract.status)">
              {{ contract.status }}
            </span>
          </td>
          <td>{{ formatCurrency(contract.amount, contract.currency) }}</td>
          <td class="actions">
            <button @click="$emit('edit', contract)" class="btn-icon">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="$emit('delete', contract)" class="btn-icon btn-danger">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="loading" class="loading">
      Loading contracts...
    </div>
    <div v-else class="no-data">
      No contracts found
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  contracts: any[];
  loading: boolean;
}>();

defineEmits<{
  (e: 'edit', contract: any): void;
  (e: 'delete', contract: any): void;
}>();

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function getStatusClass(status: string) {
  return {
    'status-active': status === 'active',
    'status-draft': status === 'draft',
    'status-expired': status === 'expired',
    'status-terminated': status === 'terminated'
  };
}
</script>

<style lang="scss" scoped>

.contracts-table {
  width: 100%;
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: v.$border-radius;
    box-shadow: v.$shadow-sm;
  }

  th, td {
    padding: v.$spacing-unit * 2;
    text-align: left;
    border-bottom: 1px solid c.$color-surface;
  }

  th {
    font-weight: v.$font-weight-bold;
    color: c.$color-text-secondary;
    background: rgba(c.$color-background, 0.5);
  }
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: v.$font-weight-medium;

  &.status-active {
    background: rgba(#10B981, 0.1);
    color: #10B981;
  }

  &.status-draft {
    background: rgba(#6B7280, 0.1);
    color: #6B7280;
  }

  &.status-expired {
    background: rgba(#EF4444, 0.1);
    color: #EF4444;
  }

  &.status-terminated {
    background: rgba(#7C3AED, 0.1);
    color: #7C3AED;
  }
}

.actions {
  display: flex;
  gap: v.$spacing-unit;
}

.btn-icon {
  padding: 6px;
  border: none;
  background: none;
  cursor: pointer;
  color: c.$color-text-secondary;
  border-radius: v.$border-radius;
  
  &:hover {
    background: rgba(c.$color-background, 0.5);
  }

  &.btn-danger {
    color: #EF4444;
    
    &:hover {
      background: rgba(#EF4444, 0.1);
    }
  }
}

.loading, .no-data {
  text-align: center;
  padding: v.$spacing-unit * 4;
  color: c.$color-text-secondary;
}
</style>