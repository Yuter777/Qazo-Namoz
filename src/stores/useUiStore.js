import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const theme = ref(localStorage.getItem('qazo-theme') || 'light');
  const isDark = computed(() => theme.value === 'dark');

  const _apply = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    document.body.setAttribute('data-theme', t);
  };

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem('qazo-theme', theme.value);
    _apply(theme.value);
  };

  _apply(theme.value);

  return { theme, isDark, toggleTheme };
});
