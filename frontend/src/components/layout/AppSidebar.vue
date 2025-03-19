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
@import '../../assets/main.scss';

.app-sidebar {
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  
  &__nav-link {
    color: var(--color-text-primary);
    
    &:hover {
      background: var(--color-surface-hover);
    }
    
    &.active {
      color: var(--color-primary);
    }
  }
}
</style>