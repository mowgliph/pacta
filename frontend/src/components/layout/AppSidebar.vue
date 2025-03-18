<template>
  <aside class="app-sidebar">
    <div class="app-sidebar__header">
      <Logo variant="dark" />
    </div>
    
    <nav class="app-sidebar__nav">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path"
        class="nav-item"
        v-slot="{ isActive }"
      >
        <i :class="[item.icon, { active: isActive }]"></i>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import Logo from '@/components/base/Logo.vue';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: 'fas fa-home' },
  { path: '/contracts', label: 'Contracts', icon: 'fas fa-file-contract' },
  { path: '/licenses', label: 'Licenses', icon: 'fas fa-key' },
  { path: '/users', label: 'Users', icon: 'fas fa-users' },
  { path: '/settings', label: 'Settings', icon: 'fas fa-cog' }
];
</script>

<style lang="scss" scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $color-surface;

  &__header {
    padding: $spacing-unit * 3;
    border-bottom: 1px solid $color-border;
  }

  &__nav {
    padding: $spacing-unit * 2;
    display: flex;
    flex-direction: column;
    gap: $spacing-unit;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $spacing-unit * 2;
  padding: $spacing-unit * 2;
  color: $color-text-secondary;
  text-decoration: none;
  border-radius: $border-radius;
  transition: all 0.2s ease;

  i {
    width: 20px;
    text-align: center;
    
    &.active {
      color: $color-primary;
    }
  }

  &:hover {
    background: $color-surface-hover;
    color: $color-text-primary;
  }

  &.router-link-active {
    background: rgba($color-primary, 0.1);
    color: $color-primary;
  }
}
</style>