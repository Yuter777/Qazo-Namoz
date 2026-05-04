<template>
  <component :is="resolvedLayout" />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AuthLayout from './layouts/AuthLayout.vue';
import DesktopLayout from './layouts/DesktopLayout.vue';
import MobileLayout from './layouts/MobileLayout.vue';
import { useUiStore } from './stores/useUiStore.js';
import { useAuthStore } from './stores/useAuthStore.js';

const route = useRoute();
const screenWidth = ref(window.innerWidth);

// Instantiate stores globally — applies theme to DOM and subscribes to Firebase auth
useUiStore();
useAuthStore();

const handleResize = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => window.addEventListener('resize', handleResize));
onBeforeUnmount(() => window.removeEventListener('resize', handleResize));

const isMobile = computed(() => screenWidth.value < 700);

const resolvedLayout = computed(() => {
  const routeLayout = route.meta.layout || 'desktop-mobile';
  if (routeLayout === 'auth') return AuthLayout;
  if (routeLayout === 'mobile') return MobileLayout;
  if (routeLayout === 'desktop-mobile') return isMobile.value ? MobileLayout : DesktopLayout;
  return DesktopLayout;
});
</script>

<style>
html,
body,
#app {
  min-height: 100%;
}

body {
  margin: 0;
  background: #fafaf9;
  color: #111827;
  transition: background-color 0.2s ease, color 0.2s ease;
}

[data-theme='dark'] body,
body[data-theme='dark'] {
  background: #0b0f19;
  color: #f3f4f6;
}
</style>
