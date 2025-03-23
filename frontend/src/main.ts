// Importar nuestro archivo de estilos unificado
import "./styles/index.css";

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
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice';
import ProgressSpinner from 'primevue/progressspinner';

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
app.use(ConfirmationService);

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
app.component('Password', Password);
app.component('Checkbox', Checkbox);
app.component('Tag', Tag);
app.component('Badge', Badge);
app.component('Avatar', Avatar);
app.component('ConfirmDialog', ConfirmDialog);
app.component('ProgressSpinner', ProgressSpinner);

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
