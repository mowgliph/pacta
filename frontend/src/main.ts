import './assets/main.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useThemeStore } from '@/stores/theme';

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize theme
const themeStore = useThemeStore();
themeStore.initTheme();

app.mount('#app')
