<template>
  <header class="app-header">
    <div class="app-header__left">
      <button class="menu-toggle">
        <i class="fas fa-bars"></i>
      </button>
    </div>
    
    <div class="app-header__right">
      <div class="notifications">
        <i class="fas fa-bell"></i>
      </div>
      <div class="user-menu">
        <img src="@/assets/avatar-placeholder.png" alt="User avatar" class="avatar" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Component logic will be added here
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-unit * 2 $spacing-unit * 3;
  background: white;
  box-shadow: $shadow-sm;

  &__left {
    display: flex;
    align-items: center;
    gap: $spacing-unit * 2;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $spacing-unit * 3;
  }
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: $color-text-secondary;
  cursor: pointer;
  padding: $spacing-unit;
  border-radius: $border-radius;

  &:hover {
    background: $color-surface-hover;
  }
}

.notifications {
  color: $color-text-secondary;
  cursor: pointer;
  padding: $spacing-unit;
  border-radius: $border-radius;

  &:hover {
    background: $color-surface-hover;
  }
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
}
</style>