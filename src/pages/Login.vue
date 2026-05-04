<template>
  <main class="page login-page" :class="{ dark: isDark }">
    <section class="card">
      <h1>{{ isSignup ? t('auth.signUp') : t('auth.signIn') }}</h1>
      <p class="subtitle">Qazo-Namoz ilovasiga xush kelibsiz.</p>

      <div class="auth-switch">
        <button :class="{ active: !isSignup }" @click="isSignup = false">{{ t('auth.signIn') }}</button>
        <button :class="{ active: isSignup }" @click="isSignup = true">{{ t('auth.signUp') }}</button>
      </div>

      <div class="form">
        <label v-if="isSignup">
          {{ t('auth.name') }}
          <input v-model.trim="fullName" type="text" :placeholder="t('auth.name')" />
        </label>
        <label>
          {{ t('auth.email') }}
          <input v-model.trim="email" type="email" placeholder="you@example.com" />
        </label>
        <label>
          {{ t('auth.password') }}
          <input v-model="password" type="password" placeholder="••••••••" />
        </label>
      </div>

      <button class="primary-btn" :disabled="isLoading" @click="handleEmailAuth">
        {{ isLoading ? t('common.loading') : (isSignup ? t('auth.createAccount') : t('auth.signIn')) }}
      </button>

      <button class="secondary-btn google-btn" :disabled="isLoading" @click="handleGoogleLogin">
        <svg class="google-icon" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h13.2c-.6 3-2.3 5.6-5 7.3v6h8c4.7-4.3 7.3-10.7 7.3-17.5z" fill="#4285F4" />
          <path d="M24 48c6.5 0 12-2.2 16-5.8l-8-6c-2.1 1.4-4.9 2.3-8 2.3-6.2 0-11.4-4.2-13.3-9.8H2.5v6.2C6.5 42.3 14.7 48 24 48z" fill="#34A853" />
          <path d="M10.7 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7v-6.2H2.5C.9 16.6 0 20.2 0 24s.9 7.4 2.5 10.9l8.2-6.2z" fill="#FBBC05" />
          <path d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.9 2.2 30.4 0 24 0 14.7 0 6.5 5.7 2.5 14.1l8.2 6.2C12.6 13.7 17.8 9.5 24 9.5z" fill="#EA4335" />
        </svg>
        <span>{{ isLoading ? t('common.loading') : t('auth.loginWithGoogle') }}</span>
      </button>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '../services/authService';
import { useUiStore } from '../stores/useUiStore.js';

const router = useRouter();
const { t } = useI18n();
const uiStore = useUiStore();

const isDark = computed(() => uiStore.isDark);
const isLoading = ref(false);
const errorMessage = ref('');
const isSignup = ref(false);
const fullName = ref('');
const email = ref('');
const password = ref('');

const handleEmailAuth = async () => {
  errorMessage.value = '';
  if (!email.value || !password.value) {
    errorMessage.value = t('auth.emailRequired');
    return;
  }
  if (password.value.length < 6) {
    errorMessage.value = t('auth.passwordMinLength');
    return;
  }
  isLoading.value = true;
  try {
    if (isSignup.value) {
      await registerWithEmail(email.value, password.value, fullName.value);
    } else {
      await loginWithEmail(email.value, password.value);
    }
    router.push({ name: 'Home' });
  } catch (error) {
    errorMessage.value = error?.message || t('auth.error');
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    await loginWithGoogle();
    router.push({ name: 'Home' });
  } catch (error) {
    errorMessage.value = error?.message || t('auth.googleError');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f8fafc;
}

.dark.page {
  background: #0b0f19;
}

.card {
  width: min(100%, 460px);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.dark .card {
  background: #111827;
  border-color: #1f2937;
}

h1 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #111827;
}

.dark h1 {
  color: #f3f4f6;
}

.subtitle {
  margin: 0 0 20px;
  color: #334155;
  font-size: 14px;
}

.dark .subtitle {
  color: #9ca3af;
}

.auth-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}

.auth-switch button {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 10px;
  background: #fff;
  cursor: pointer;
  color: #111827;
  font-size: 14px;
  transition: border-color 0.15s, color 0.15s;
}

.dark .auth-switch button {
  background: #1f2937;
  border-color: #374151;
  color: #f3f4f6;
}

.auth-switch button.active {
  border-color: #3b82f6;
  color: #3b82f6;
}

.form {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 14px;
  color: #334155;
}

.dark label {
  color: #9ca3af;
}

input {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
  color: #111827;
  transition: border-color 0.15s;
}

.dark input {
  background: #1f2937;
  border-color: #374151;
  color: #f3f4f6;
}

input:focus {
  border-color: #3b82f6;
}

.primary-btn {
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  background: #111827;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.dark .primary-btn {
  background: #3b82f6;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: progress;
}

.secondary-btn {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 16px;
  background: #fff;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.dark .secondary-btn {
  background: #1f2937;
  border-color: #374151;
  color: #f3f4f6;
}

.secondary-btn:disabled {
  opacity: 0.7;
  cursor: progress;
}

.google-icon {
  flex-shrink: 0;
}

.error-message {
  margin-top: 12px;
  color: #dc2626;
  font-size: 14px;
  word-break: break-word;
}
</style>
