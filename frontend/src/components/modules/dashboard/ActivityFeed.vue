<template>
  <div class="activity-feed">
    <h3 class="activity-feed__title">Recent Activity</h3>
    
    <div class="activity-feed__list">
      <div v-for="activity in activities" :key="activity.id" class="activity-item">
        <div class="activity-item__icon" :class="getActivityIcon(activity.type)">
          <i :class="getActivityIconClass(activity.type)"></i>
        </div>
        
        <div class="activity-item__content">
          <p class="activity-item__message">{{ activity.message }}</p>
          <span class="activity-item__time">{{ formatTime(activity.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: number;
  type: string;
  message: string;
  createdAt: string;
}

const activities = ref<Activity[]>([]);

onMounted(async () => {
  await loadActivities();
});

async function loadActivities() {
  try {
    const response = await fetch('/api/activities');
    activities.value = await response.json();
  } catch (error) {
    console.error('Error loading activities:', error);
  }
}

function getActivityIcon(type: string) {
  return {
    'activity-item__icon--contract': type.includes('CONTRACT'),
    'activity-item__icon--user': type.includes('USER'),
    'activity-item__icon--license': type.includes('LICENSE')
  };
}

function getActivityIconClass(type: string) {
  const icons: Record<string, string> = {
    CONTRACT: 'fas fa-file-contract',
    USER: 'fas fa-user',
    LICENSE: 'fas fa-key'
  };
  
  return icons[type.split('_')[0]] || 'fas fa-info-circle';
}

function formatTime(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
</script>

<style lang="scss" scoped>
.activity-feed {
  &__title {
    color: $color-text-primary;
    margin-bottom: $spacing-unit * 3;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $spacing-unit * 2;
  }
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-unit * 2;

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-accent;
    color: white;

    &--contract {
      background: #10B981;
    }

    &--user {
      background: #6366F1;
    }

    &--license {
      background: #F59E0B;
    }
  }

  &__content {
    flex: 1;
  }

  &__message {
    color: $color-text-primary;
    margin-bottom: $spacing-unit;
  }

  &__time {
    font-size: 0.875rem;
    color: $color-text-secondary;
  }
}
</style>