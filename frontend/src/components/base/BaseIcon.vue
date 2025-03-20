<template>
  <svg
    :class="['base-icon', `base-icon--${size}`]"
    :width="iconSize"
    :height="iconSize"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <component :is="icons[name]" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { h } from 'vue';

// Icon size mapping
const sizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48
} as const;

// Icon components
const icons = {
  checkCircle: () => h('path', {
    d: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z",
    fill: "currentColor"
  }),
  alertCircle: () => h('path', {
    d: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z",
    fill: "currentColor"
  }),
  edit: () => h('path', {
    d: "M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z",
    fill: "currentColor"
  }),
  closeCircle: () => h('path', {
    d: "M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM17 15.59L15.59 17L12 13.41L8.41 17L7 15.59L10.59 12L7 8.41L8.41 7L12 10.59L15.59 7L17 8.41L13.41 12L17 15.59Z",
    fill: "currentColor"
  }),
  refresh: () => h('path', {
    d: "M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z",
    fill: "currentColor"
  })
} as const;

const props = withDefaults(defineProps<{
  name: keyof typeof icons;
  size?: keyof typeof sizes;
}>(), {
  size: 'md'
});

const iconSize = computed(() => sizes[props.size]);
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;
@use '../../styles/typography' as t;

.base-icon {
  display: inline-block;
  vertical-align: middle;
  color: currentColor;

  &--sm { width: 16px; height: 16px; }
  &--md { width: 24px; height: 24px; }
  &--lg { width: 32px; height: 32px; }
  &--xl { width: 48px; height: 48px; }
}
</style>