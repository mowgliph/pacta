<template>
  <div class="bg-surface rounded shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
    <div v-if="$slots.header" class="p-3 border-b border-border bg-gray-50 dark:bg-surface-hover">
      <slot name="header"></slot>
    </div>
    <div class="p-3">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="p-3 border-t border-border bg-gray-50 dark:bg-surface-hover">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
