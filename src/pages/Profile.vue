<template>
  <main class="profile-page" :class="{ dark: isDark }">
    <section class="card">
      <div class="header">
        <h1>{{ t('profile.title') }}</h1>
        <router-link class="ghost-btn" to="/">{{ t('navigation.home') }}</router-link>
      </div>

      <p class="muted">{{ t('profile.userInfo') }}</p>

      <div class="grid">
        <div class="item">
          <span class="label">{{ t('profile.name') }}</span>
          <strong>{{ userInfo.name }}</strong>
        </div>
        <div class="item">
          <span class="label">{{ t('profile.email') }}</span>
          <strong>{{ userInfo.email }}</strong>
        </div>
        <div class="item">
          <span class="label">{{ t('profile.userId') }}</span>
          <code>{{ userInfo.uid }}</code>
        </div>
        <div class="item">
          <span class="label">{{ t('profile.authType') }}</span>
          <strong>{{ userInfo.provider }}</strong>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>{{ t('profile.planStats') }}</h2>
      <p v-if="prayerStore.isHydrating" class="muted">{{ t('profile.loading') }}</p>
      <p v-else-if="!prayerStore.planDates.length" class="muted">{{ t('profile.noPlan') }}</p>
      <div v-else class="grid stats">
        <div class="item">
          <span class="label">{{ t('profile.startDate') }}</span>
          <strong>{{ prayerStore.startDate || '-' }}</strong>
        </div>
        <div class="item">
          <span class="label">{{ t('profile.endDate') }}</span>
          <strong>{{ prayerStore.endDate || '-' }}</strong>
        </div>
        <div class="item">
          <span class="label">{{ t('profile.totalDays') }}</span>
          <strong>{{ prayerStore.totalCount }}</strong>
        </div>
        <div class="item">
          <span class="label">{{ t('profile.completed') }}</span>
          <strong>{{ prayerStore.completedCount }}</strong>
        </div>
        <div class="item">
          <span class="label">{{ t('profile.remaining') }}</span>
          <strong>{{ prayerStore.remainingCount }}</strong>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUiStore } from '../stores/useUiStore.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import { usePrayerStore } from '../stores/usePrayerStore.js';

const { t } = useI18n();
const uiStore = useUiStore();
const authStore = useAuthStore();
const prayerStore = usePrayerStore();

const isDark = computed(() => uiStore.isDark);

const userInfo = computed(() => {
  const user = authStore.currentUser;
  return {
    name: user?.displayName || t('profile.unknown'),
    email: user?.email || '-',
    uid: user?.uid || '-',
    provider: user?.providerData?.[0]?.providerId || 'password',
  };
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 24px;
  background: #fafaf9;
  display: grid;
  gap: 16px;
  align-content: start;
}

.dark.profile-page {
  background: #0b0f19;
  color: #f3f4f6;
}

.card {
  width: min(900px, 100%);
  margin: 0 auto;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}

.dark .card {
  background: #111827;
  border-color: #1f2937;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

h1,
h2 {
  margin: 0;
}

.ghost-btn {
  text-decoration: none;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 12px;
  color: #0f172a;
  font-size: 14px;
}

.dark .ghost-btn {
  border-color: #374151;
  color: #f3f4f6;
}

.muted {
  color: #6b7280;
  margin: 8px 0 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 4px;
}

.dark .item {
  border-color: #1f2937;
}

.label {
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 700px) {
  .profile-page {
    padding: 14px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
