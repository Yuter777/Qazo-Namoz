<template>
  <main class="page dashboard-page">
    <section class="card">
      <h1>{{ t('navigation.dashboard') }}</h1>
      <p class="subtitle">Siz muvaffaqiyatli kirdingiz.</p>

      <button
        class="secondary-btn"
        :disabled="isLoading"
        @click="handleLogout"
      >
        {{ isLoading ? t('common.loading') : t('auth.logout') }}
      </button>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { logout } from '../services/authService';

const router = useRouter();
const { t } = useI18n();

const isLoading = ref(false);

const handleLogout = async () => {
  isLoading.value = true;

  try {
    await logout();
    router.push({ name: 'Login' });
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
  background: #f1f5f9;
}

.card {
  width: min(100%, 460px);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  text-align: center;
}

h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.subtitle {
  margin: 0 0 20px;
  color: #475569;
}

.secondary-btn {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 16px;
  background: #fff;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
}

.secondary-btn:disabled {
  opacity: 0.7;
  cursor: progress;
}
</style>