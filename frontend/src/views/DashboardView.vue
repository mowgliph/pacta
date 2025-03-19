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
import LicenseStatus from '@/components/modules/dashboard/LicenseStatus.vue';
import ContractStats from '@/components/modules/dashboard/ContractStats.vue';
import ActivityFeed from '@/components/modules/dashboard/ActivityFeed.vue';
import NotificationPanel from '@/components/modules/dashboard/NotificationPanel.vue';
</script>

<style lang="scss" scoped>
@import '../../assets/main.scss';

.dashboard {
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: $spacing-unit * 3;
  }

  &__card {
    background: white;
    border-radius: $border-radius;
    box-shadow: $shadow-sm;
    padding: $spacing-unit * 3;
  }
}
</style>