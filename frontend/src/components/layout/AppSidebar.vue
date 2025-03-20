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
import Logo from '../../components/base/Logo.vue';

const menuItems = [
  { path: '/', label: 'Inicio', icon: 'fas fa-home' },
  { path: '/contracts', label: 'Contratos', icon: 'fas fa-file-contract' },
  { path: '/licenses', label: 'Licencias', icon: 'fas fa-key' },
  { path: '/users', label: 'Usuario', icon: 'fas fa-users' },
  { path: '/settings', label: 'Ajustes', icon: 'fas fa-cog' }
];
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;


.app-sidebar {
  background: c.$color-surface;
  border-right: 1px solid c.$color-border;
  
  &__nav-link {
    color: c.$color-text-primary;
    
    &:hover {
      background: c.$color-surface-hover;
    }
    
    &.active {
      color: c.$color-primary;
    }
  }
}
</style>