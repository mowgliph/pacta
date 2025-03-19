<template>
  <div class="base-table">
    <table v-if="items.length">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
          <th v-if="$slots.actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td v-for="column in columns" :key="column.key">
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
    <div v-else-if="loading" class="base-table__loading">
      <slot name="loading">Loading...</slot>
    </div>
    <div v-else class="base-table__empty">
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

<style lang="scss" scoped>
.base-table {
  width: 100%;
  border-collapse: collapse;
  background: c.$color-surface;
  border-radius: v.$border-radius;
  overflow: hidden;
  box-shadow: v.$shadow-sm;

  table {
    width: 100%;
  }

  th {
    @include m.table-header;
    padding: v.$spacing-unit * 2;
    text-align: left;
    border-bottom: 1px solid c.$color-border;
  }

  td {
    padding: v.$spacing-unit * 2;
    border-bottom: 1px solid c.$color-border;
    color: c.$color-text-primary;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: c.$color-surface-hover;
    }
  }
  
  &__loading,
  &__empty {
    padding: v.$spacing-unit * 4;
    text-align: center;
    color: c.$color-text-secondary;
  }
}
</style>