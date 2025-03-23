<template>
  <div class="card card-interactive">
    <div v-if="$slots.header" class="card-header dark:border-gray-700 dark:bg-gray-900">
      <slot name="header"></slot>
    </div>
    <div class="p-5">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer dark:border-gray-700 dark:bg-gray-900">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  interactive: {
    type: Boolean,
    default: true
  }
});
</script>
