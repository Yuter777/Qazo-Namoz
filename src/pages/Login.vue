<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 28px">
        <div style="font-size: 36px; margin-bottom: 8px">🕌</div>
        <div style="font-size: 20px; font-weight: 800; color: var(--teal-dark); letter-spacing: -0.5px">Qazo Namozi</div>
        <div style="font-size: 13px; color: var(--text2); margin-top: 4px">
          {{ isSignup ? t('auth.createAccount') : t('auth.signIn') }}
        </div>
      </div>

      <!-- Tab switch -->
      <div class="tab-switch">
        <button :class="{ active: !isSignup }" @click="isSignup = false">{{ t('auth.signIn') }}</button>
        <button :class="{ active: isSignup }"  @click="isSignup = true">{{ t('auth.signUp') }}</button>
      </div>

      <!-- Form -->
      <div class="form-group" style="margin-bottom: 16px">
        <div v-if="isSignup" class="field">
          <label>{{ t('auth.name') }}</label>
          <input v-model.trim="fullName" class="qn-input" type="text" :placeholder="t('auth.name')" />
        </div>
        <div class="field">
          <label>{{ t('auth.email') }}</label>
          <input v-model.trim="email" class="qn-input" type="email" placeholder="you@example.com" />
        </div>
        <div class="field">
          <label>{{ t('auth.password') }}</label>
          <input v-model="password" class="qn-input" type="password" placeholder="••••••••" />
        </div>
      </div>

      <button class="qn-add-btn" :disabled="isLoading" @click="handleEmailAuth" style="margin-bottom: 10px">
        {{ isLoading ? t('common.loading') : (isSignup ? t('auth.createAccount') : t('auth.signIn')) }}
      </button>

      <div style="display: flex; align-items: center; gap: 10px; margin: 6px 0">
        <div style="flex:1; height:1px; background:var(--border)" />
        <span style="font-size:12px; color:var(--text3)">{{ t('auth.orContinueWith') }}</span>
        <div style="flex:1; height:1px; background:var(--border)" />
      </div>

      <button class="google-btn" :disabled="isLoading" @click="handleGoogleLogin">
        <svg width="18" height="18" viewBox="0 0 48 48" style="flex-shrink:0">
          <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h13.2c-.6 3-2.3 5.6-5 7.3v6h8c4.7-4.3 7.3-10.7 7.3-17.5z" fill="#4285F4" />
          <path d="M24 48c6.5 0 12-2.2 16-5.8l-8-6c-2.1 1.4-4.9 2.3-8 2.3-6.2 0-11.4-4.2-13.3-9.8H2.5v6.2C6.5 42.3 14.7 48 24 48z" fill="#34A853" />
          <path d="M10.7 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7v-6.2H2.5C.9 16.6 0 20.2 0 24s.9 7.4 2.5 10.9l8.2-6.2z" fill="#FBBC05" />
          <path d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.9 2.2 30.4 0 24 0 14.7 0 6.5 5.7 2.5 14.1l8.2 6.2C12.6 13.7 17.8 9.5 24 9.5z" fill="#EA4335" />
        </svg>
        {{ t('auth.loginWithGoogle') }}
      </button>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '../services/authService'

const router = useRouter()
const { t } = useI18n()

const isLoading    = ref(false)
const errorMessage = ref('')
const isSignup     = ref(false)
const fullName     = ref('')
const email        = ref('')
const password     = ref('')

async function handleEmailAuth() {
  errorMessage.value = ''
  if (!email.value || !password.value) { errorMessage.value = t('auth.emailRequired'); return }
  if (password.value.length < 6) { errorMessage.value = t('auth.passwordMinLength'); return }
  isLoading.value = true
  try {
    if (isSignup.value) await registerWithEmail(email.value, password.value, fullName.value)
    else                await loginWithEmail(email.value, password.value)
    router.push({ name: 'Dashboard' })
  } catch (err) {
    errorMessage.value = err?.message || t('auth.error')
  } finally {
    isLoading.value = false
  }
}

async function handleGoogleLogin() {
  errorMessage.value = ''
  isLoading.value = true
  try {
    await loginWithGoogle()
    router.push({ name: 'Dashboard' })
  } catch (err) {
    errorMessage.value = err?.message || t('auth.googleError')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.tab-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 20px;
}
.tab-switch button {
  padding: 9px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  background: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text2);
  font-family: inherit;
  transition: all 0.15s;
}
.tab-switch button.active {
  background: var(--teal-light);
  border-color: var(--teal);
  color: var(--teal-dark);
}

.form-group { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 500; color: var(--text2); }

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text1);
  font-family: inherit;
  margin-top: 6px;
  transition: background 0.15s;
}
.google-btn:hover { background: var(--teal-light); }
.google-btn:disabled { opacity: 0.7; cursor: progress; }

.error-msg {
  margin-top: 12px;
  color: var(--red);
  font-size: 13px;
  text-align: center;
}
</style>
