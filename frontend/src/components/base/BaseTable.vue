<template>
  <div class="table-container">
    <table v-if="items.length" class="table">
      <thead>
        <tr>
          <th 
            v-for="column in columns" 
            :key="column.key"
          >
            {{ column.label }}
          </th>
          <th v-if="$slots.actions">
            {{ actionsLabel }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="item in items" 
          :key="item.id"
        >
          <td 
            v-for="column in columns" 
            :key="column.key"
          >
            <slot :name="column.key" :item="item">
              {{ item[column.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions">
            <slot name="actions" :item="item"></slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="loading" class="p-6 text-center text-text-secondary dark:text-gray-400">
      <div class="flex items-center justify-center flex-col gap-2">
        <div class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <slot name="loading">Cargando...</slot>
      </div>
    </div>
    <div v-else class="p-6 text-center text-text-secondary dark:text-gray-400">
      <div class="flex items-center justify-center flex-col gap-2">
        <i v-if="emptyIcon" :class="['text-2xl', emptyIcon]"></i>
        <slot name="empty">No hay datos disponibles</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string;
  label: string;
}

interface TableItem {
  id: string | number;
  [key: string]: any;
}

const props = defineProps({
  columns: {
    type: Array as () => Column[],
    required: true
  },
  items: {
    type: Array as () => TableItem[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  actionsLabel: {
    type: String,
    default: 'Acciones'
  },
  emptyIcon: {
    type: String,
    default: 'fas fa-inbox'
  }
});
</script>