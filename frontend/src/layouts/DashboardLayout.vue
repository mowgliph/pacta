<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="dashboard-sidebar" :class="{ 'is-collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <Logo class="logo" :variant="isDark ? 'light' : 'dark'" />
        <span v-if="!isSidebarCollapsed" class="logo-text">PACTA</span>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <li v-for="(item, index) in menuItems" :key="item.path" :style="{'--item-index': index}">
            <router-link 
              :to="item.path" 
              class="nav-item"
              :class="{ 'is-active': $route.path === item.path }"
              v-tooltip="isSidebarCollapsed ? item.label : ''"
            >
              <i :class="item.icon"></i>
              <span v-if="!isSidebarCollapsed" class="nav-label">{{ item.label }}</span>
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
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>
        
        <div class="header-right">
          <div class="theme-toggle">
            <button @click="toggleTheme" class="icon-btn">
              <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>
          </div>
          <div class="user-menu">
            <UserAvatar :name="userName" />
            <span class="user-name">{{ userName }}</span>
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="dashboard-content">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Logo from '../components/base/Logo.vue'
import UserAvatar from '../components/base/UserAvatar.vue'

const route = useRoute()
const isSidebarCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')
const userName = ref('Admin User')
const isDark = ref(localStorage.getItem('theme') === 'dark')

const menuItems = [
  { path: '/dashboard', label: 'Inicio', icon: 'fas fa-home' },
  { path: '/analytics', label: 'Estadisticas', icon: 'fas fa-chart-bar' },
  { path: '/contracts', label: 'Contratos', icon: 'fas fa-file-contract' },
  { path: '/users', label: 'Usuarios', icon: 'fas fa-users' },
  { path: '/settings', label: 'Ajustes', icon: 'fas fa-cog' },
]

const pageTitle = computed(() => {
  const currentRoute = menuItems.find(item => route.path.startsWith(item.path))
  return currentRoute ? currentRoute.label : 'Dashboard'
})

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('sidebar-collapsed', isSidebarCollapsed.value.toString())
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark-theme', isDark.value)
}

// Gestionar el indicador de desplazamiento
const updateScrollProgress = () => {
  const content = document.querySelector('.dashboard-content')
  if (!content) return

  const scrollPosition = content.scrollTop
  const scrollHeight = content.scrollHeight - content.clientHeight
  const scrollPercent = scrollPosition / (scrollHeight || 1)
  
  document.documentElement.style.setProperty('--scroll-percent', scrollPercent.toString())
}

onMounted(() => {
  // Aplicar tema al montar
  document.documentElement.classList.toggle('dark-theme', isDark.value)

  // Configurar oyente de desplazamiento
  const content = document.querySelector('.dashboard-content')
  if (content) {
    content.addEventListener('scroll', updateScrollProgress)
    content.addEventListener('resize', updateScrollProgress)
  }

  // Inicializar estado de desplazamiento
  nextTick(() => {
    updateScrollProgress()
  })
})

onUnmounted(() => {
  // Limpiar oyente de desplazamiento
  const content = document.querySelector('.dashboard-content')
  if (content) {
    content.removeEventListener('scroll', updateScrollProgress)
    content.removeEventListener('resize', updateScrollProgress)
  }
})

watch(
  () => route.path,
  () => {
    // Cerrar sidebar en cambio de ruta en vista móvil
    if (window.innerWidth <= 768) {
      isSidebarCollapsed.value = true
    }
    
    // Restablecer posición de desplazamiento
    nextTick(() => {
      const content = document.querySelector('.dashboard-content')
      if (content) {
        content.scrollTo(0, 0)
        updateScrollProgress()
      }
    })
  }
)
</script>

<style lang="scss" scoped>
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;

// Animaciones
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background);
  position: relative;
  overflow-x: hidden;
  color: var(--color-text-primary);
}

.dashboard-sidebar {
  width: 260px;
  background-color: var(--color-surface);
  box-shadow: v.$shadow-md;
  transition: all v.$transition-normal;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(c.$color-primary, 0.3);
    border-radius: v.$border-radius-pill;
  }

  &.is-collapsed {
    width: 70px;
    .sidebar-header {
      padding: 1.5rem 0.5rem;
      justify-content: center;
    }
    .nav-item {
      padding: 0.75rem;
      justify-content: center;
    }
    .collapse-btn {
      justify-content: center;
      i {
        transform: rotate(180deg);
      }
    }
  }

  .sidebar-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid var(--color-border);
    transition: padding v.$transition-normal;

    .logo {
      width: 32px;
      height: 32px;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: rotate(10deg) scale(1.1);
      }
    }

    .logo-text {
      font-size: v.$font-size-lg;
      font-weight: v.$font-weight-bold;
      color: var(--color-primary);
      white-space: nowrap;
      background: linear-gradient(45deg, var(--color-primary), c.$color-accent);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      transition: all 0.3s ease;
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

    li {
      animation: fadeIn 0.3s ease forwards;
      animation-delay: calc(var(--item-index, 0) * 0.05s);
      opacity: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all v.$transition-fast;
      gap: 1rem;
      border-radius: v.$border-radius;
      margin: 0.25rem 0.5rem;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 0;
        background-color: var(--color-primary);
        opacity: 0.1;
        transition: width v.$transition-fast;
      }

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(to right, var(--color-primary), transparent);
        transition: width 0.3s ease;
      }

      &:hover {
        color: var(--color-primary);
        background-color: rgba(c.$color-primary, 0.05);
        transform: translateX(4px);
        
        &::before {
          width: 4px;
        }
        
        &::after {
          width: 100%;
        }
      }

      &.is-active {
        color: var(--color-primary);
        background-color: rgba(c.$color-primary, 0.1);
        font-weight: v.$font-weight-medium;
        
        &::before {
          width: 4px;
        }
        
        i {
          animation: pulse 2s infinite ease-in-out;
        }
      }

      i {
        width: 20px;
        text-align: center;
        font-size: 1.1rem;
        transition: transform 0.2s ease;
      }

      .nav-label {
        white-space: nowrap;
        transition: opacity v.$transition-fast, transform 0.2s ease;
      }
    }
  }

  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid var(--color-border);

    .collapse-btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      background-color: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      border-radius: v.$border-radius;
      transition: all v.$transition-fast;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      &:hover {
        background-color: rgba(c.$color-primary, 0.05);
        color: var(--color-primary);
      }

      i {
        transition: transform v.$transition-normal;
      }
    }
  }
}

.dashboard-main {
  flex: 1;
  margin-left: 260px;
  transition: margin-left v.$transition-normal;
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .dashboard-sidebar.is-collapsed + & {
    margin-left: 70px;
  }
}

.dashboard-header {
  height: 70px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 90;
  box-shadow: v.$shadow-sm;
  transition: box-shadow 0.3s ease, background-color 0.3s ease, transform 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.9);

  &:hover {
    box-shadow: v.$shadow-md;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;

    .page-title {
      font-size: v.$font-size-lg;
      font-weight: v.$font-weight-medium;
      color: var(--color-text-primary);
      margin: 0;
      animation: slideInLeft 0.3s ease-out;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .theme-toggle {
    .icon-btn {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(c.$color-primary, 0);
        border-radius: 50%;
        transform: scale(0);
        transition: transform 0.3s ease, background-color 0.3s ease;
      }

      &:hover {
        color: var(--color-primary);
        transform: rotate(15deg);
        
        &::before {
          transform: scale(1);
          background-color: rgba(c.$color-primary, 0.1);
        }
      }

      i {
        position: relative;
        z-index: 1;
      }
    }
  }

  .menu-toggle {
    display: none;
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all v.$transition-fast;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: rgba(c.$color-primary, 0.1);
      color: var(--color-primary);
      transform: rotate(90deg);
    }
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    border-radius: v.$border-radius;
    transition: all v.$transition-fast;
    background-color: transparent;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background-color: var(--color-primary);
      transition: width 0.3s ease, left 0.3s ease;
    }

    &:hover {
      background-color: rgba(c.$color-primary, 0.05);
      
      &::after {
        width: 100%;
        left: 0;
      }
      
      .user-avatar {
        transform: scale(1.1);
        box-shadow: 0 0 0 3px rgba(c.$color-primary, 0.2);
      }
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(c.$color-primary, 0.1);
      transition: all 0.3s ease;
    }

    .user-name {
      color: var(--color-text-primary);
      font-weight: v.$font-weight-medium;
      font-size: v.$font-size-sm;
      transition: color 0.3s ease;
    }

    i {
      color: var(--color-text-secondary);
      font-size: 0.8rem;
      transition: transform v.$transition-fast;
    }

    &:hover i {
      transform: translateY(2px);
      color: var(--color-primary);
    }
  }
}

.dashboard-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background-color: var(--color-background);
  transition: background-color v.$transition-normal;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(c.$color-primary, 0.2);
    border-radius: v.$border-radius-pill;
    
    &:hover {
      background-color: rgba(c.$color-primary, 0.4);
    }
  }
}

// Transition effects
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// Custom tooltip directive
[v-tooltip] {
  position: relative;
}

[v-tooltip]:hover::after {
  content: attr(v-tooltip);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: v.$border-radius;
  font-size: v.$font-size-xs;
  white-space: nowrap;
  z-index: 10;
  margin-left: 10px;
  pointer-events: none;
  animation: fadeIn 0.2s ease-out;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

// Layout responsivo
@media (max-width: 768px) {
  .dashboard-sidebar {
    transform: translateX(-100%);
    box-shadow: v.$shadow-lg;
    
    &.is-collapsed {
      transform: translateX(-100%);
    }
    
    &:not(.is-collapsed) {
      transform: translateX(0);
      width: 260px;
    }
  }

  .dashboard-main {
    margin-left: 0 !important;
  }

  .dashboard-header {
    padding: 0 1rem;
    
    .menu-toggle {
      display: flex;
    }
    
    .page-title {
      font-size: v.$font-size-md;
    }
    
    .user-name {
      display: none;
    }
  }
}

// Mini scroll progress indicator
.dashboard-header::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  background: linear-gradient(to right, var(--color-primary), c.$color-accent);
  width: calc(var(--scroll-percent, 0) * 100%);
  transition: width 0.1s ease;
  z-index: 1;
}

// Animación de carga
@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

.is-loading {
  background: linear-gradient(to right, rgba(c.$color-primary, 0.05) 8%, rgba(c.$color-primary, 0.15) 18%, rgba(c.$color-primary, 0.05) 33%);
  background-size: 800px 104px;
  animation: shimmer 1.5s infinite linear;
  border-radius: v.$border-radius;
}
</style> 