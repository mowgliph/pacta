<template>
  <div class="dashboard-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <aside class="dashboard-sidebar" :class="{ 'is-collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo-container">
          <img src="@/assets/contract_icon.png" alt="Logo" class="logo-img" width="32" height="32" />
          <span class="logo-text">PACTA</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-items">
          <router-link to="/dashboard" class="nav-item" :class="{ active: currentRoute.startsWith('/dashboard') }">
            <i class="icon fas fa-home"></i>
            <span class="item-text" v-if="!sidebarCollapsed">Menu Principal</span>
            <div class="tooltip" v-if="sidebarCollapsed">Menu Principal</div>
          </router-link>
        </div>

        <div class="nav-section">
          <div class="nav-items">
            <router-link to="/contracts" class="nav-item" :class="{ active: currentRoute.startsWith('/contracts') }">
              <i class="icon fas fa-file-contract"></i>
              <span class="item-text" v-if="!sidebarCollapsed">Contratos</span>
              <div class="tooltip" v-if="sidebarCollapsed">Contratos</div>
            </router-link>
          </div>
          <div class="nav-items">
            <router-link to="/analytics" class="nav-item" :class="{ active: currentRoute.startsWith('/analytics') }">
              <i class="icon fas fa-chart-bar"></i>
              <span class="item-text" v-if="!sidebarCollapsed">Estadisticas</span>
              <div class="tooltip" v-if="sidebarCollapsed">Estadisticas</div>
            </router-link>
          </div>
        </div>
      </nav>
    </aside>
    
    <div class="dashboard-main">
      <header class="dashboard-header">
        <div class="header-left">
          <button 
            class="menu-toggle" 
            @click="toggleSidebar" 
            aria-label="Toggle sidebar"
          >
            <i class="fas fa-bars"></i>
          </button>
        </div>
        
        <div class="header-right">
          <div class="notifications">
            <button 
              class="header-button" 
              aria-label="Notificaciones" 
              @click="toggleNotifications"
            >
              <i class="fas fa-bell"></i>
              <span class="badge" v-if="unreadNotifications > 0">{{ unreadNotifications }}</span>
            </button>
            
            <!-- Notification panel -->
            <NotificationPanel
              v-if="showNotifications"
              :onClose="() => showNotifications = false"
            />
          </div>
          
          <div class="user-menu" @click="toggleUserMenu">
            <UserAvatar :name="userData.username" />
            <div v-if="!sidebarCollapsed" class="user-info">
              <span class="username">@{{ userData.username }}</span>
            </div>
            <i class="fas fa-chevron-down" :class="{ 'rotated': isUserMenuOpen }"></i>
            
            <!-- User dropdown menu -->
            <div v-if="isUserMenuOpen" class="user-dropdown">
              <div class="user-dropdown-header">
                <UserAvatar :name="userData.username" :size="64" />
                <div class="user-info">
                  <span class="full-name">{{ userData.username }}</span>
                  <span class="role">{{ userData.role || 'Usuario' }}</span>
                </div>
              </div>
              
              <hr class="user-dropdown-divider" />
              
              <!-- License status info -->
              <div class="license-status-info" v-if="license">
                <div class="license-badge" :class="{ 'warning': licenseDays < 30 }">
                  <i class="fas fa-shield-alt"></i>
                  <span>{{ license.status }}</span>
                </div>
                <div class="license-detail">
                  <span class="expiry">Expira: {{ license.expiryDate }}</span>
                  <span class="days-left">{{ license.remainingDays }} días restantes</span>
                </div>
              </div>
              
              <div class="license-warning" v-else>
                <i class="fas fa-exclamation-triangle"></i>
                <span>Sin licencia activa</span>
              </div>
              
              <hr class="user-dropdown-divider" />
              
              <div class="user-dropdown-actions">
                <router-link to="/settings" class="dropdown-item">
                  <i class="fas fa-cog"></i>
                  <span>Configuración</span>
                </router-link>
                
                <button class="dropdown-item logout" @click.stop="logout">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main class="dashboard-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import UserAvatar from '../components/base/UserAvatar.vue';
import NotificationPanel from '../components/modules/NotificationPanel.vue';
import { dashboardService } from '../services/dashboard.service';
import { useColors } from '../types/colors';
import type { DashboardResponse } from '../services/dashboard.service';

// Stores
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const route = useRoute();
const colors = useColors();

// State
const sidebarCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true');
const isUserMenuOpen = ref(false);
const showNotifications = ref(false);
const userData = computed(() => authStore.user || { username: 'Usuario', role: 'Invitado' });

// Notifications
const unreadNotifications = computed(() => notificationStore.unreadCount);
const recentActions = ref<DashboardResponse['recentActions']>([]);
const license = ref<DashboardResponse['license'] | null>(null);
const licenseDays = computed(() => license.value?.remainingDays || 0);

// Guardar estado del sidebar en localStorage
watch(sidebarCollapsed, (newValue) => {
  localStorage.setItem('sidebarCollapsed', String(newValue));
});

// Acciones del usuario
const logout = () => {
  authStore.logout();
  router.push('/login');
};

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const toggleUserMenu = (event: Event) => {
  event.stopPropagation();
  isUserMenuOpen.value = !isUserMenuOpen.value;
  
  // Close notifications if open
  if (showNotifications.value) {
    showNotifications.value = false;
  }
};

const toggleNotifications = (event: Event) => {
  event.stopPropagation();
  showNotifications.value = !showNotifications.value;
  
  // Close user menu if open
  if (isUserMenuOpen.value) {
    isUserMenuOpen.value = false;
  }
};

// Load notification data
const fetchNotifications = async () => {
  try {
    const data = await dashboardService.getDashboardData(30);
    recentActions.value = data.recentActions || [];
    license.value = data.license;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

// Cerrar el menú si se hace clic fuera de él
const closeDropdownsOnClickOutside = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  
  // Check user menu
  if (isUserMenuOpen.value) {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && !userMenu.contains(element)) {
      isUserMenuOpen.value = false;
    }
  }
  
  // Check notifications
  if (showNotifications.value) {
    const notificationsEl = document.querySelector('.notifications');
    if (notificationsEl && !notificationsEl.contains(element)) {
      showNotifications.value = false;
    }
  }
};

// Event listeners
onMounted(() => {
  document.addEventListener('click', closeDropdownsOnClickOutside);
  fetchNotifications();
  notificationStore.fetchUnreadCount();
  
  // Refresh notifications every 5 minutes
  const notificationsInterval = setInterval(() => {
    fetchNotifications();
    notificationStore.fetchUnreadCount();
  }, 5 * 60 * 1000);
  
  onBeforeUnmount(() => {
    clearInterval(notificationsInterval);
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdownsOnClickOutside);
});

// Ruta actual simplificada para los menús activos
const currentRoute = computed(() => route.path);
</script>

<style lang="scss" scoped>
@use './dashboardLayout.scss';
</style> 