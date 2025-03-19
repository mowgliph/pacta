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
@import '../../assets/main.scss';

.base-card {
  @include card-theme;
  overflow: hidden;

  &__header {
    padding: $spacing-unit * 3;
    border-bottom: 1px solid $color-border;
    background: $color-surface-hover;
  }

  &__body {
    padding: $spacing-unit * 3;
  }

  &__footer {
    padding: $spacing-unit * 3;
    border-top: 1px solid $color-border;
    background: $color-surface-hover;
  }
}
</style>