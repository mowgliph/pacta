import "./styles/main.scss";

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useThemeStore } from './stores/theme';
import { useAuthStore } from './stores/auth';

// PrimeVue components
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';

// PrimeVue styles
import './styles/theme.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  unstyled: false,                  // Use styled version
  ripple: true,                     // Enable ripple effect
  pt: {}                            // Empty passthrough (default)
});
app.use(ToastService);

// Register PrimeVue components
app.component('PrimeButton', Button);
app.component('PrimeInputText', InputText);
app.component('PrimeToast', Toast);
app.component('PrimeDropdown', Dropdown);
app.component('PrimeDataTable', DataTable);
app.component('PrimeColumn', Column);
app.component('PrimeDialog', Dialog);
app.component('PrimeCalendar', Calendar);
app.component('PrimeTextarea', Textarea);

// Initialize theme and auth
const themeStore = useThemeStore();
const authStore = useAuthStore();

// Initialize stores
themeStore.initTheme();
authStore.checkAuth().then(isAuthenticated => {
  if (!isAuthenticated && router.currentRoute.value.meta.requiresAuth) {
    router.push('/login');
  }
});

app.mount('#app');
