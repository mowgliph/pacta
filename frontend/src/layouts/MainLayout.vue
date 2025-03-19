<template>
  <div class="layout">
    <AppSidebar class="layout__sidebar" />
    <div class="layout__main">
      <AppHeader class="layout__header" />
      <main class="layout__content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <Toast /> <!-- Add the Toast component here -->
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/layout/AppHeader.vue';
import AppSidebar from '../components/layout/AppSidebar.vue';
import Toast from '../components/shared/Toast.vue';
</script>

<style lang="scss" scoped>
@use '../assets/styles/_variables.scss' as v;
@use '../assets/styles/_colors.scss' as c;

.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
  background-color: var(--color-background);

  &__main {
    display: flex;
    flex-direction: column;
  }

  &__content {
    flex: 1;
    padding: v.$spacing-unit * 6;
  }
}
</style>