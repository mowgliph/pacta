<template>
  <div class="base-card">
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header"></slot>
    </div>
    <div class="base-card__body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.base-card {
  @include m.card-theme;
  overflow: hidden;

  &__header {
    padding: v.$spacing-unit * 3;
    border-bottom: 1px solid c.$color-border;
    background: c.$color-surface-hover;
  }

  &__body {
    padding: v.$spacing-unit * 3;
  }

  &__footer {
    padding: v.$spacing-unit * 3;
    border-top: 1px solid c.$color-border;
    background: c.$color-surface-hover;
  }
}
</style>
