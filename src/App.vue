<template>
  <router-view />
</template>

<script setup>
import { watch } from 'vue'
import { useUiStore } from './stores/useUiStore.js'
import { useAuthStore } from './stores/useAuthStore.js'

useUiStore()
const authStore = useAuthStore()

// Fires on login AND on page refresh when Firebase restores the session.
// { immediate: true } ensures it runs once with the current value too.
watch(
  () => authStore.currentUser,
  (user) => {
    if (user) authStore.onUserLoggedIn(user)
  },
  { immediate: true },
)
</script>
