<template>
  <div class="flex min-h-screen w-full bg-background relative overflow-x-hidden text-text-primary" 
       :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar -->
    <aside class="fixed h-screen w-[260px] bg-gradient-to-br from-primary-dark to-primary shadow-md transition-all duration-300 z-50 flex flex-col overflow-y-auto text-white
                 scrollbar-thin scrollbar-thumb-white/20 scrollbar-thumb-rounded-full"
           :class="{ 'w-[70px]': sidebarCollapsed }">
      <!-- Sidebar Header -->
      <div class="px-6 py-4 flex items-center justify-center border-b border-white/10 transition-all duration-300"
           :class="{ 'px-2 py-6 justify-center': sidebarCollapsed }">
        <div class="flex items-center gap-2 justify-center">
          <img src="@/assets/contract_icon.png" alt="Logo" class="w-8 h-8" />
          <span class="text-lg font-bold text-white whitespace-nowrap shadow-sm transition-all duration-300"
                :class="{ 'opacity-0 -translate-x-2 hidden': sidebarCollapsed }">
            PACTA
          </span>
        </div>
      </div>
      
      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-items">
          <router-link to="/dashboard" 
                      class="flex items-center px-6 py-3 text-white/70 no-underline transition-all duration-200 gap-4 mb-1 relative rounded-r-3xl mr-3 hover:bg-white/8 hover:text-white"
                      :class="{ 'px-0 py-3 justify-center': sidebarCollapsed, 'bg-white/12 text-white font-medium': currentRoute.startsWith('/dashboard') }">
            <i class="fas fa-home w-5 text-center" :class="{ 'mr-0': sidebarCollapsed }"></i>
            <span class="font-medium tracking-wide transition-all duration-300"
                  :class="{ 'opacity-0 -translate-x-2': sidebarCollapsed }">
              Menu Principal
            </span>
            <div v-if="sidebarCollapsed" 
                class="absolute left-full top-1/2 -translate-y-1/2 bg-surface text-text-primary py-1 px-2 rounded shadow-md text-sm whitespace-nowrap opacity-0 invisible transition-all duration-200 pointer-events-none ml-2 before:content-[''] before:absolute before:top-1/2 before:right-full before:border-[5px] before:border-transparent before:border-r-surface before:-mt-[5px] group-hover:opacity-100 group-hover:visible">
              Menu Principal
            </div>
            <div v-if="currentRoute.startsWith('/dashboard')" class="absolute left-0 top-0 h-full w-1 bg-background"></div>
          </router-link>
        </div>

        <div class="mt-2">
          <div class="nav-items">
            <router-link to="/contracts" 
                        class="flex items-center px-6 py-3 text-white/70 no-underline transition-all duration-200 gap-4 mb-1 relative rounded-r-3xl mr-3 hover:bg-white/8 hover:text-white"
                        :class="{ 'px-0 py-3 justify-center': sidebarCollapsed, 'bg-white/12 text-white font-medium': currentRoute.startsWith('/contracts') }">
              <i class="fas fa-file-contract w-5 text-center" :class="{ 'mr-0': sidebarCollapsed }"></i>
              <span class="font-medium tracking-wide transition-all duration-300"
                    :class="{ 'opacity-0 -translate-x-2': sidebarCollapsed }">
                Contratos
              </span>
              <div v-if="sidebarCollapsed" 
                  class="absolute left-full top-1/2 -translate-y-1/2 bg-surface text-text-primary py-1 px-2 rounded shadow-md text-sm whitespace-nowrap opacity-0 invisible transition-all duration-200 pointer-events-none ml-2 before:content-[''] before:absolute before:top-1/2 before:right-full before:border-[5px] before:border-transparent before:border-r-surface before:-mt-[5px] group-hover:opacity-100 group-hover:visible">
                Contratos
              </div>
              <div v-if="currentRoute.startsWith('/contracts')" class="absolute left-0 top-0 h-full w-1 bg-background"></div>
            </router-link>
          </div>
          <div class="nav-items">
            <router-link to="/analytics" 
                        class="flex items-center px-6 py-3 text-white/70 no-underline transition-all duration-200 gap-4 mb-1 relative rounded-r-3xl mr-3 hover:bg-white/8 hover:text-white"
                        :class="{ 'px-0 py-3 justify-center': sidebarCollapsed, 'bg-white/12 text-white font-medium': currentRoute.startsWith('/analytics') }">
              <i class="fas fa-chart-bar w-5 text-center" :class="{ 'mr-0': sidebarCollapsed }"></i>
              <span class="font-medium tracking-wide transition-all duration-300"
                    :class="{ 'opacity-0 -translate-x-2': sidebarCollapsed }">
                Estadisticas
              </span>
              <div v-if="sidebarCollapsed" 
                  class="absolute left-full top-1/2 -translate-y-1/2 bg-surface text-text-primary py-1 px-2 rounded shadow-md text-sm whitespace-nowrap opacity-0 invisible transition-all duration-200 pointer-events-none ml-2 before:content-[''] before:absolute before:top-1/2 before:right-full before:border-[5px] before:border-transparent before:border-r-surface before:-mt-[5px] group-hover:opacity-100 group-hover:visible">
                Estadisticas
              </div>
              <div v-if="currentRoute.startsWith('/analytics')" class="absolute left-0 top-0 h-full w-1 bg-background"></div>
            </router-link>
          </div>
        </div>
      </nav>
    </aside>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col ml-[260px] transition-all duration-300 min-h-screen relative overflow-x-hidden max-w-full"
         :class="{ 'ml-[70px]': sidebarCollapsed }">
      <!-- Header -->
      <header class="flex items-center justify-between p-3 bg-surface border-b border-border h-[70px] fixed top-0 right-0 w-[calc(100%-260px)] z-10 backdrop-blur-md transition-all duration-300 shadow-sm"
              :class="{ 'w-[calc(100%-70px)]': sidebarCollapsed }">
        <div class="flex items-center">
          <button 
            class="icon-button icon-button-secondary" 
            @click="toggleSidebar" 
            aria-label="Toggle sidebar"
          >
            <i class="fas fa-bars text-base"></i>
          </button>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="relative">
            <button 
              class="icon-button icon-button-secondary" 
              aria-label="Notificaciones" 
              @click="toggleNotifications"
            >
              <i class="fas fa-bell"></i>
              <span v-if="unreadNotifications > 0" 
                   class="absolute top-0 right-0 bg-primary text-white rounded-full h-[18px] w-[18px] text-[10px] flex items-center justify-center font-bold translate-x-1/4 -translate-y-1/4 shadow-md">
                {{ unreadNotifications }}
              </span>
            </button>
            
            <!-- Notification panel -->
            <NotificationPanel
              v-if="showNotifications"
              :onClose="() => showNotifications = false"
            />
          </div>
          
          <div class="relative flex items-center gap-2 cursor-pointer py-1 px-2 rounded transition-all duration-200 hover:bg-secondary/10"
               @click="toggleUserMenu">
            <UserAvatar :name="userData.username" />
            <div v-if="!sidebarCollapsed" class="flex flex-col">
              <span class="text-sm font-medium text-text-primary">@{{ userData.username }}</span>
            </div>
            <i class="fas fa-chevron-down text-text-secondary text-xs transition-transform duration-200"
               :class="{ 'rotate-180': isUserMenuOpen }"></i>
            
            <!-- User dropdown menu -->
            <div v-if="isUserMenuOpen" 
                 class="absolute top-[calc(100%+10px)] right-0 w-[280px] bg-surface rounded shadow-lg z-50 border border-border animate-fadeIn">
              <div class="p-4 flex items-center gap-4 border-b border-border">
                <UserAvatar :name="userData.username" :size="64" />
                <div class="flex flex-col">
                  <span class="text-base font-semibold text-text-primary m-0">{{ userData.username }}</span>
                  <span class="text-xs text-text-secondary m-0">{{ userData.role || 'Usuario' }}</span>
                </div>
              </div>
              
              <hr class="m-0 border-none border-t border-border" />
              
              <!-- License status info -->
              <div v-if="license" class="p-4 flex flex-col gap-1">
                <div class="inline-flex items-center gap-1 py-1 px-4 bg-success/10 text-success rounded-full text-xs font-medium self-start"
                     :class="{ 'bg-warning/10 text-warning': licenseDays < 30 }">
                  <i class="fas fa-shield-alt text-xs"></i>
                  <span>{{ license.status }}</span>
                </div>
                <div class="flex flex-col text-xs">
                  <span class="text-text-primary font-medium">Expira: {{ license.expiryDate }}</span>
                  <span class="text-text-secondary">{{ license.remainingDays }} días restantes</span>
                </div>
              </div>
              
              <div v-else class="p-4 flex items-center gap-1 text-warning text-xs font-medium">
                <i class="fas fa-exclamation-triangle text-sm"></i>
                <span>Sin licencia activa</span>
              </div>
              
              <hr class="m-0 border-none border-t border-border" />
              
              <div class="p-2">
                <router-link to="/settings" 
                            class="flex items-center gap-4 py-2 px-4 text-text-primary no-underline transition-all duration-200 rounded hover:bg-secondary/5">
                  <i class="fas fa-cog w-4 text-sm"></i>
                  <span>Configuración</span>
                </router-link>
                
                <button class="link-danger w-full flex items-center gap-4 py-2 px-4 border-none bg-transparent cursor-pointer text-left text-sm font-normal"
                        @click.stop="logout">
                  <i class="fas fa-sign-out-alt w-4 text-sm"></i>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main class="pt-[calc(70px+1.5rem)] p-6 flex-1 max-w-7xl mx-auto w-full">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in"
                     enter-active-class="transition-all duration-300 ease-out"
                     leave-active-class="transition-all duration-200 ease-in"
                     enter-from-class="opacity-0 translate-y-5"
                     leave-to-class="opacity-0 -translate-y-5">
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

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease;
}
</style> 