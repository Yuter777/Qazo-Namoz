<template>
  <!-- Font Awesome CDN for icons (add to document head in actual project) -->
  <main class="page login-page">
    <section class="card">
      <h1>{{ isSignup ? 'Sign Up' : 'Sign In' }}</h1>
      <p class="subtitle">Qazo-Namoz ilovasiga xush kelibsiz.</p>
      <p class="hint">
        Agar Firebase sozlanmagan bo'lsa, avval `.env.example` faylidan nusxa olib `.env` yarating.
      </p>

      <div class="auth-switch">
        <button :class="{ active: !isSignup }" @click="isSignup = false">Sign In</button>
        <button :class="{ active: isSignup }" @click="isSignup = true">Sign Up</button>
      </div>

      <div class="form">
        <label v-if="isSignup">
          Ism
          <input v-model.trim="fullName" type="text" placeholder="Ismingiz" />
        </label>
        <label>
          Email
          <input v-model.trim="email" type="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input v-model="password" type="password" placeholder="********" />
        </label>
      </div>

      <button
        class="primary-btn"
        :disabled="isLoading"
        @click="handleEmailAuth"
      >
        {{ isLoading ? t('common.loading') : (isSignup ? 'Create account' : 'Sign in') }}
      </button>

      <button
        class="secondary-btn google-btn"
        :disabled="isLoading"
        @click="handleGoogleLogin"
      >
        <i class="fab fa-google google" ></i>
        <span>{{ isLoading ? t('common.loading') : t('auth.loginWithGoogle') }}</span>
      </button>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '../services/authService';

// Make sure Font Awesome is loaded globally in your index.html for icons to work.

const router = useRouter();
const { t } = useI18n();

const isLoading = ref(false);
const errorMessage = ref('');
const isSignup = ref(false);
const fullName = ref('');
const email = ref('');
const password = ref('');

const handleEmailAuth = async () => {
  errorMessage.value = '';

  if (!email.value || !password.value) {
    errorMessage.value = 'Email va password kiriting.';
    return;
  }
  if (password.value.length < 6) {
    errorMessage.value = "Password kamida 6 belgidan iborat bo'lishi kerak.";
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
    errorMessage.value = error?.message || "Autentifikatsiyada xatolik yuz berdi.";
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
    errorMessage.value = error?.message || "Kirishda xatolik yuz berdi.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f8fafc;
}

.card {
  width: min(100%, 460px);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.subtitle {
  margin: 0 0 8px;
  color: #334155;
}

.hint {
  margin: 0 0 20px;
  color: #64748b;
  font-size: 14px;
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
}

.auth-switch button.active {
  border-color: #2563eb;
  color: #2563eb;
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

input {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
}

.primary-btn {
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
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
  gap: 6px;
}

.secondary-btn:disabled {
  opacity: 0.7;
  cursor: progress;
}

.google-btn .google-icon {
  font-size: 18px;
  color: #ea4335;
}

.error-message {
  margin-top: 12px;
  color: #dc2626;
  font-size: 14px;
  word-break: break-word;
}
</style>