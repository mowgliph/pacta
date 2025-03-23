/// <reference types="vite/client" />

// Declare PrimeVue module to help with import resolution
declare module 'primevue/*';

// Ensure .vue files are correctly typed
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
