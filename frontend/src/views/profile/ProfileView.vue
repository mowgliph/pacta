<template>
  <div class="profile">
    <h1>Profile Settings</h1>

    <div class="profile-sections">
      <div class="profile-info">
        <h2>Account Information</h2>
        <form @submit.prevent="handleUpdateProfile" class="form">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              id="username"
              v-model="profileData.username"
              type="text"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              v-model="profileData.email"
              type="email"
              required
            />
          </div>

          <button type="submit" class="btn-primary" :disabled="updating">
            {{ updating ? 'Updating...' : 'Update Profile' }}
          </button>
        </form>
      </div>

      <div class="password-change">
        <h2>Change Password</h2>
        <form @submit.prevent="handlePasswordChange" class="form">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input 
              id="currentPassword"
              v-model="passwordData.currentPassword"
              type="password"
              required
            />
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input 
              id="newPassword"
              v-model="passwordData.newPassword"
              type="password"
              required
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input 
              id="confirmPassword"
              v-model="passwordData.confirmPassword"
              type="password"
              required
            />
          </div>

          <button type="submit" class="btn-primary" :disabled="changing">
            {{ changing ? 'Changing...' : 'Change Password' }}
          </button>
        </form>
      </div>

      <div class="activity-log">
        <h2>Recent Activity</h2>
        <div class="activity-list" v-if="activities.length">
          <div v-for="activity in activities" :key="activity.id" class="activity-item">
            <span class="activity-icon">
              <i :class="getActivityIcon(activity.action)"></i>
            </span>
            <div class="activity-content">
              <p class="activity-details">{{ activity.details }}</p>
              <span class="activity-time">{{ formatDate(activity.timestamp) }}</span>
            </div>
          </div>
        </div>
        <p v-else class="no-activity">No recent activity</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { format } from 'date-fns';
import { useToast } from '@/types/useToast';

const userStore = useUserStore();
const toast = useToast();

const updating = ref(false);
const changing = ref(false);
interface Activity {
  id: number;
  action: ActivityAction;
  details: string;
  timestamp: string;
}

const activities = ref<Activity[]>([]);
const profileData = ref({
  username: '',
  email: ''
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

onMounted(async () => {
  const user = await userStore.getCurrentUser();
  profileData.value = {
    username: user.username,
    email: user.email
  };
  await fetchActivities();
});

async function fetchActivities() {
  try {
    const response = await fetch('/api/activities/me');
    activities.value = await response.json();
  } catch (error) {
    console.error('Error fetching activities:', error);
  }
}

async function handleUpdateProfile() {
  updating.value = true;
  try {
    await userStore.updateProfile(profileData.value);
    toast.success('Profile updated successfully');
  } catch (error) {
    toast.error('Failed to update profile');
  } finally {
    updating.value = false;
  }
}

async function handlePasswordChange() {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    toast.error('New passwords do not match');
    return;
  }

  changing.value = true;
  try {
    await userStore.changePassword(
      passwordData.value.currentPassword,
      passwordData.value.newPassword
    );
    toast.success('Password changed successfully');
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error) {
    toast.error('Failed to change password');
  } finally {
    changing.value = false;
  }
}

type ActivityAction = 'LOGIN' | 'PROFILE_UPDATE' | 'PASSWORD_CHANGE' | 'CONTRACT_CREATE' | 'CONTRACT_UPDATE';

function getActivityIcon(action: ActivityAction | string): string {
  const icons: Record<ActivityAction | 'DEFAULT', string> = {
    LOGIN: 'fas fa-sign-in-alt',
    PROFILE_UPDATE: 'fas fa-user-edit',
    PASSWORD_CHANGE: 'fas fa-key',
    CONTRACT_CREATE: 'fas fa-file-contract',
    CONTRACT_UPDATE: 'fas fa-edit',
    DEFAULT: 'fas fa-info-circle'
  };

  return action in icons ? icons[action as ActivityAction] : icons.DEFAULT;
}

function formatDate(date: string) {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}
</script>

<style lang="scss" scoped>
@import '../../assets/main.scss';

.profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-unit * 4;

  h1 {
    margin-bottom: $spacing-unit * 4;
  }
}

.profile-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $spacing-unit * 4;
}

.form {
  background: white;
  padding: $spacing-unit * 3;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
}

.form-group {
  margin-bottom: $spacing-unit * 2;

  label {
    display: block;
    margin-bottom: $spacing-unit;
    font-weight: $font-weight-medium;
  }

  input {
    width: 100%;
    padding: $spacing-unit * 1.5;
    border: 1px solid $color-surface;
    border-radius: $border-radius;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: $color-accent;
    }
  }
}

.activity-list {
  background: white;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: $spacing-unit * 2;
  border-bottom: 1px solid $color-surface;

  &:last-child {
    border-bottom: none;
  }
}

.activity-icon {
  color: $color-accent;
  font-size: 1.25rem;
  margin-right: $spacing-unit * 2;
}

.activity-content {
  flex: 1;
}

.activity-details {
  margin-bottom: $spacing-unit;
}

.activity-time {
  font-size: 0.875rem;
  color: $color-text-secondary;
}

.no-activity {
  text-align: center;
  padding: $spacing-unit * 3;
  color: $color-text-secondary;
}

.btn-primary {
  width: 100%;
  padding: $spacing-unit * 1.5;
  background: $color-accent;
  color: white;
  border: none;
  border-radius: $border-radius;
  font-size: 1rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.9;
  }
}
</style>