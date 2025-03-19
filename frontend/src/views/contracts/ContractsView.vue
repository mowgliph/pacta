<template>
  <div class="contracts">
    <header class="contracts__header">
      <h1>Contract Management</h1>
      <BaseButton 
        variant="primary"
        icon="fas fa-plus"
        @click="showCreateDialog"
      >
        New Contract
      </BaseButton>
    </header>

    <div class="contracts__filters">
      <BaseInput
        v-model="filters.search"
        placeholder="Search contracts..."
        @input="handleSearch"
        class="search-box"
        id="contract-search"
      />
      
      <BaseSelect
        v-model="filters.status"
        :options="statusOptions"
        class="filter-group"
        id="status-filter"
      />
    </div>

    <ContractsTable 
      :contracts="filteredContracts"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <ContractDialog
      v-model:visible="dialogVisible"
      :contract="selectedContract"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useContractStore } from '../../stores/contract';
import BaseButton from '../../components/base/BaseButton.vue';
import BaseInput from '../../components/base/BaseInput.vue';
import BaseSelect from '../../components/base/BaseSelect.vue';
import ContractsTable from '../../components/modules/contracts/ContractsTable.vue';
import ContractDialog from '../../components/modules/contracts/ContractDialog.vue';
import type { Contract } from '../../stores/contract';

const contractStore = useContractStore();
const loading = ref(false);
const dialogVisible = ref(false);
const selectedContract = ref<Contract | null>(null);

// Add status options
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'draft', label: 'Draft' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'renewed', label: 'Renewed' }
];

const filters = ref({
  search: '',
  status: ''
});

const filteredContracts = computed(() => {
  let contracts = contractStore.contracts;
  
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    contracts = contracts.filter(contract => 
      contract.title.toLowerCase().includes(searchTerm) ||
      contract.contractNumber.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.value.status) {
    contracts = contracts.filter(contract => 
      contract.status === filters.value.status
    );
  }

  return contracts;
});

onMounted(async () => {
  loading.value = true;
  try {
    await contractStore.fetchContracts();
  } finally {
    loading.value = false;
  }
});

function showCreateDialog() {
  selectedContract.value = null;
  dialogVisible.value = true;
}

function handleEdit(contract: Contract) {
  selectedContract.value = contract;
  dialogVisible.value = true;
}

async function handleDelete(contract: Contract) {
  if (confirm('Are you sure you want to delete this contract?')) {
    await contractStore.deleteContract(contract.id);
  }
}

async function handleSave(contractData: Partial<Contract>) {
  try {
    if (selectedContract.value) {
      await contractStore.updateContract(selectedContract.value.id, contractData);
    } else {
      await contractStore.createContract(contractData);
    }
    dialogVisible.value = false;
  } catch (error) {
    console.error('Error saving contract:', error);
  }
}

function handleSearch() {
  // Debounce implementation could be added here
}
</script>

<style lang="scss" scoped>

.contracts {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: v.$spacing-unit * 4;
  }

  &__filters {
    display: flex;
    gap: v.$spacing-unit * 2;
    margin-bottom: v.$spacing-unit * 3;
  }
}

.search-box {
  flex: 1;
  
  input {
    width: 100%;
    padding: v.$spacing-unit * 1.5;
    border: 1px solid c.$color-surface;
    border-radius: v.$border-radius;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: c.$color-accent;
    }
  }
}

.filter-group {
  select {
    padding: v.$spacing-unit * 1.5;
    border: 1px solid c.$color-surface;
    border-radius: v.$border-radius;
    background: white;
    font-size: 1rem;
    min-width: 150px;
    
    &:focus {
      outline: none;
      border-color: c.$color-accent;
    }
  }
}

.btn-primary {
  background: c.$color-accent;
  color: white;
  padding: v.$spacing-unit * 1.5 v.$spacing-unit * 3;
  border: none;
  border-radius: v.$border-radius;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: v.$spacing-unit;
  
  &:hover {
    opacity: 0.9;
  }
}
</style>