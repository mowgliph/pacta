<template>
  <BaseTable
    :columns="columns"
    :items="contracts"
    :loading="loading"
  >
    <template #status="{ item }">
      <StatusBadge :status="item.status" />
    </template>
    
    <template #amount="{ item }">
      {{ formatCurrency(item.amount, item.currency) }}
    </template>
    
    <template #actions="{ item }">
      <div class="action-buttons">
        <BaseButton
          variant="secondary"
          icon="edit"
          @click="$emit('edit', item)"
        />
        <BaseButton
          variant="danger"
          icon="trash"
          @click="$emit('delete', item)"
        />
      </div>
    </template>
  </BaseTable>
</template>

<style lang="scss" scoped>
@use './contractList.scss';
</style>

<script setup lang="ts">
import BaseTable from '../../../components/base/BaseTable.vue';
import BaseButton from '../../../components/base/BaseButton.vue';
import StatusBadge from '../../../components/shared/StatusBadge.vue';
import type { Contract } from '../../../types/contract';

interface Props {
  contracts: Contract[];
  loading?: boolean;
}

defineProps<Props>();

defineEmits<{
  (e: 'edit', contract: Contract): void;
  (e: 'delete', contract: Contract): void;
}>();

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const columns = [
  { key: 'contractNumber', label: 'Contract Number' },
  { key: 'title', label: 'Title' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' }
];
</script>