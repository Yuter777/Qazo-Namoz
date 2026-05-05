import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useUserData } from '../composables/useUserData'
import { usePrayerTracker } from '../composables/usePrayerTracker'

export const useAuthStore = defineStore('auth', () => {
  const { currentUser, isInitialized, loginWithGoogle, logout } = useAuth()
  const { createUserIfNotExists } = useUserData()
  const tracker = usePrayerTracker()

  const isAuthenticated = computed(() => !!currentUser.value)

  // Called from App.vue watcher — runs on login AND page refresh
  async function onUserLoggedIn(user) {
    await createUserIfNotExists(user)

    // Run these in parallel — they don't depend on each other
    const { usePrayerStore } = await import('./usePrayerStore.js')
    await Promise.all([
      usePrayerStore().hydrateFromCloud(user.uid),
      tracker.initTracker(user.uid),
    ])
  }

  async function googleLogin() {
    const user = await loginWithGoogle()
    await onUserLoggedIn(user)
    return user
  }

  async function signOut() {
    const { usePrayerStore } = await import('./usePrayerStore.js')
    usePrayerStore().$reset?.()
    await logout()
  }

  return {
    currentUser,
    isAuthenticated,
    isInitialized,
    googleLogin,
    signOut,
    onUserLoggedIn,
  }
})
