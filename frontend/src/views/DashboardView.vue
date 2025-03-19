<template>
  <div class="dashboard">
    <div class="dashboard__grid">
      <!-- License Status Card -->
      <LicenseStatus class="dashboard__card" />
      
      <!-- Contract Statistics -->
      <ContractStats class="dashboard__card" />
      
      <!-- Recent Activity -->
      <ActivityFeed class="dashboard__card" />
      
      <!-- Notifications -->
      <NotificationPanel class="dashboard__card" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LicenseStatus from '../components/modules/dashboard/LicenseStatus.vue';
import ContractStats from '../components/modules/dashboard/ContractStats.vue';
import ActivityFeed from '../components/modules/dashboard/ActivityFeed.vue';
import NotificationPanel from '../components/modules/dashboard/NotificationPanel.vue';
</script>

<style lang="scss">
.dashboard {
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: v.$spacing-unit * 3;
  }

  &__card {
    background: white;
    border-radius: v.$border-radius;
    box-shadow: v.$shadow-sm;
    padding: v.$spacing-unit * 3;
  }
}
</style>