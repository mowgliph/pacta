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
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import Toast from '@/components/shared/Toast.vue';
</script>

<style lang="scss" scoped>
.layout {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
  background-color: $color-background;

  &__sidebar {
    position: fixed;
    height: 100vh;
    width: 250px;
    background-color: white;
    box-shadow: $shadow-md;
  }

  &__main {
    margin-left: 250px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  &__header {
    position: sticky;
    top: 0;
    z-index: $z-index-dropdown;
  }

  &__content {
    flex: 1;
    padding: $spacing-unit * 3;
    max-width: $container-max-width;
    margin: 0 auto;
    width: 100%;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>