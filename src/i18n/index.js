import { createI18n } from 'vue-i18n';
import uz from './locales/uz.js';
import ru from './locales/ru.js';
import en from './locales/en.js';

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'uz', // Default language
  fallbackLocale: 'en', // Fallback language
  messages: {
    uz,
    ru,
    en,
  },
});

export default i18n;