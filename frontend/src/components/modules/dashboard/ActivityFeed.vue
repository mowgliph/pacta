<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
    
    <div class="space-y-4">
      <div v-for="activity in activities" :key="activity.id" class="flex items-start gap-3">
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center text-white"
          :class="{
            'bg-success': activity.type.includes('CONTRACT'),
            'bg-info': activity.type.includes('USER'),
            'bg-warning': activity.type.includes('LICENSE'),
            'bg-primary': !activity.type.includes('CONTRACT') && !activity.type.includes('USER') && !activity.type.includes('LICENSE')
          }"
        >
          <i :class="getActivityIconClass(activity.type)"></i>
        </div>
        
        <div class="flex-1">
          <p class="text-gray-800 dark:text-gray-200 mb-1">{{ activity.message }}</p>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatTime(activity.createdAt) }}</span>
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