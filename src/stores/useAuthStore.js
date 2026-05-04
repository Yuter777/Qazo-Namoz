import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { onAuthChange } from '../services/authService';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null);
  const isAuthenticated = computed(() => !!currentUser.value);

  onAuthChange(async (user) => {
    currentUser.value = user;
    if (user?.uid) {
      const { usePrayerStore } = await import('./usePrayerStore.js');
      usePrayerStore().hydrateFromCloud(user.uid);
    }
  });

  return { currentUser, isAuthenticated };
});
