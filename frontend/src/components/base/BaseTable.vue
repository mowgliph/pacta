<template>
  <div class="w-full bg-surface rounded overflow-hidden shadow-sm">
    <table v-if="items.length" class="w-full">
      <thead>
        <tr>
          <th 
            v-for="column in columns" 
            :key="column.key"
            class="p-2 text-left text-sm font-semibold text-text-secondary border-b border-border bg-gray-50 dark:bg-surface-hover"
          >
            {{ column.label }}
          </th>
          <th 
            v-if="$slots.actions"
            class="p-2 text-left text-sm font-semibold text-text-secondary border-b border-border bg-gray-50 dark:bg-surface-hover"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="item in items" 
          :key="item.id"
          class="transition-colors hover:bg-gray-50 dark:hover:bg-surface-hover"
        >
          <td 
            v-for="column in columns" 
            :key="column.key"
            class="p-2 border-b border-border text-text-primary"
          >
            <slot :name="column.key" :item="item">
              {{ item[column.key] }}
            </slot>
          </td>
          <td 
            v-if="$slots.actions"
            class="p-2 border-b border-border"
          >
            <slot name="actions" :item="item"></slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="loading" class="p-4 text-center text-text-secondary">
      <slot name="loading">Loading...</slot>
    </div>
    <div v-else class="p-4 text-center text-text-secondary">
      <slot name="empty">No data available</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string;
  label: string;
}

defineProps<{
  columns: Column[];
  items: any[];
  loading?: boolean;
}>();
</script>