<template>
  <router-view />
</template>

<script setup>
import { useUiStore } from './stores/useUiStore.js'
import { useAuthStore } from './stores/useAuthStore.js'

// Initialize stores on app start — applies theme and listens to Firebase auth
useUiStore()
useAuthStore()
</script>
