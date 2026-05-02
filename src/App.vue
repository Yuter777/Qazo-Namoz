<template>
  <component :is="resolvedLayout" />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AuthLayout from './layouts/AuthLayout.vue';
import DesktopLayout from './layouts/DesktopLayout.vue';
import MobileLayout from './layouts/MobileLayout.vue';

const route = useRoute();
const screenWidth = ref(window.innerWidth);

const handleResize = () => {
  screenWidth.value = window.innerWidth;
};

const applyTheme = () => {
  const theme = localStorage.getItem('qazo-theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
};

const handleThemeChange = () => {
  applyTheme();
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('storage', handleThemeChange);
  window.addEventListener('qazo-theme-change', handleThemeChange);
  applyTheme();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('storage', handleThemeChange);
  window.removeEventListener('qazo-theme-change', handleThemeChange);
});

const isMobile = computed(() => screenWidth.value < 700);

const resolvedLayout = computed(() => {
  const routeLayout = route.meta.layout || 'desktop-mobile';
  if (routeLayout === 'auth') return AuthLayout;
  if (routeLayout === 'mobile') return MobileLayout;
  if (routeLayout === 'desktop-mobile') {
    return isMobile.value ? MobileLayout : DesktopLayout;
  }
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
  background: #f8fafc;
  color: #111827;
  transition: background-color 0.2s ease, color 0.2s ease;
}

html[data-theme='dark'] body,
body[data-theme='dark'] {
  background: #0f1115;
  color: #f3f4f6;
}
</style>