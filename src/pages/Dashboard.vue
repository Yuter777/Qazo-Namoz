<template>
  <main class="page dashboard-page" :class="{ dark: isDark }">
    <section class="card">
      <h1>{{ t('navigation.dashboard') }}</h1>
      <p class="subtitle">{{ t('dashboard.welcome') }}</p>

      <div v-if="prayerStore.planDates.length" class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">{{ t('home.totalDays') }}</span>
          <strong class="stat-value">{{ prayerStore.totalCount }}</strong>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('home.completed') }}</span>
          <strong class="stat-value success">{{ prayerStore.completedCount }}</strong>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('home.left') }}</span>
          <strong class="stat-value">{{ prayerStore.remainingCount }}</strong>
        </div>
      </div>

      <div class="actions">
        <router-link class="primary-btn" to="/start">{{ t('navigation.start') }}</router-link>
        <button class="secondary-btn" :disabled="isLoading" @click="handleLogout">
          {{ isLoading ? t('common.loading') : t('auth.logout') }}
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { logout } from '../services/authService';
import { useUiStore } from '../stores/useUiStore.js';
import { usePrayerStore } from '../stores/usePrayerStore.js';

const router = useRouter();
const { t } = useI18n();
const uiStore = useUiStore();
const prayerStore = usePrayerStore();

const isDark = computed(() => uiStore.isDark);
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
  background: #fafaf9;
}

.dark.page {
  background: #0b0f19;
  color: #f3f4f6;
}

.card {
  width: min(100%, 520px);
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
  font-size: 24px;
}

.subtitle {
  margin: 0 0 20px;
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 4px;
}

.dark .stat-item {
  border-color: #1f2937;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

.stat-value {
  font-size: 22px;
}

.stat-value.success {
  color: #22c55e;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.primary-btn {
  border-radius: 12px;
  padding: 10px 16px;
  background: #111827;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
}

.dark .primary-btn {
  background: #3b82f6;
}

.secondary-btn {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 16px;
  background: #fff;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
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

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
