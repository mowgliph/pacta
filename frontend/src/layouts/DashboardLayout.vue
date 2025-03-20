<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="dashboard-sidebar" :class="{ 'is-collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <Logo class="logo" :variant="isDark ? 'light' : 'dark'" />
        <h1 v-if="!isSidebarCollapsed">Admin Panel</h1>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <li v-for="item in menuItems" :key="item.path">
            <router-link 
              :to="item.path" 
              class="nav-item"
              :class="{ 'is-active': $route.path === item.path }"
            >
              <i :class="item.icon"></i>
              <span v-if="!isSidebarCollapsed">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="collapse-btn" @click="toggleSidebar">
          <i :class="isSidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="dashboard-main">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-left">
          <button class="menu-toggle" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
        </div>
        
        <div class="header-right">
          <div class="user-menu">
            <UserAvatar :name="userName" />
            <span class="user-name">{{ userName }}</span>
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="dashboard-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Logo from '../components/base/Logo.vue'
import UserAvatar from '../components/base/UserAvatar.vue'

const isSidebarCollapsed = ref(false)
const userName = ref('Admin User')
const isDark = ref(false) // Por defecto en modo claro

const menuItems = [
  { path: '/dashboard', label: 'Inicio', icon: 'fas fa-home' },
  { path: '/analytics', label: 'Estadisticas', icon: 'fas fa-chart-bar' },
  { path: '/users', label: 'Usuarios', icon: 'fas fa-users' },
  { path: '/settings', label: 'Ajustes', icon: 'fas fa-cog' },
]

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;

.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--background-color);
}

.dashboard-sidebar {
  width: 260px;
  background-color: var(--surface-color);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;

  &.is-collapsed {
    width: 70px;
  }

  .sidebar-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid var(--border-color);

    .logo {
      width: 32px;
      height: 32px;
    }

    h1 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
    overflow-y: auto;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s ease;
      gap: 1rem;

      &:hover {
        background-color: var(--hover-color);
        color: var(--text-primary);
      }

      &.is-active {
        background-color: var(--primary-color-light);
        color: var(--primary-color);
      }

      i {
        width: 20px;
        text-align: center;
      }
    }
  }

  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);

    .collapse-btn {
      width: 100%;
      padding: 0.5rem;
      border: none;
      background: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--hover-color);
        color: var(--text-primary);
      }
    }
  }
}

.dashboard-main {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;

  .dashboard-sidebar.is-collapsed + & {
    margin-left: 70px;
  }
}

.dashboard-header {
  height: 64px;
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 90;

  .menu-toggle {
    display: none;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--hover-color);
      color: var(--text-primary);
    }
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--hover-color);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .user-name {
      color: var(--text-primary);
      font-weight: 500;
    }

    i {
      color: var(--text-secondary);
    }
  }
}

.dashboard-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .dashboard-sidebar {
    transform: translateX(-100%);
    
    &.is-collapsed {
      transform: translateX(0);
    }
  }

  .dashboard-main {
    margin-left: 0;
  }

  .dashboard-header .menu-toggle {
    display: block;
  }
}
</style> 