<template>
  <div class="start-page" :class="{ dark: isDark }">
    <main class="section card">
      <h1>{{ t('home.trackerTitle') }}</h1>
      <p class="muted">{{ t('home.trackerHint') }}</p>

      <div class="form-grid">
        <label>
          {{ t('home.startDate') }}
          <input v-model="localStart" type="date" />
        </label>
        <label>
          {{ t('home.endDate') }}
          <input v-model="localEnd" type="date" />
        </label>
      </div>

      <button class="primary-btn" @click="onBuild">{{ t('home.build') }}</button>

      <p v-if="prayerStore.planErrorKey" class="error">{{ t(prayerStore.planErrorKey) }}</p>

      <div v-if="prayerStore.planDates.length" class="plan-list">
        <div class="stats">
          <p class="muted">{{ t('home.totalDays') }}: <strong>{{ prayerStore.totalCount }}</strong></p>
          <p class="muted">{{ t('home.completed') }}: <strong>{{ prayerStore.completedCount }}</strong></p>
          <p class="muted">{{ t('home.left') }}: <strong>{{ prayerStore.remainingCount }}</strong></p>
        </div>
        <ul>
          <li v-for="item in prayerStore.planDates" :key="item.date">
            <label>
              <input
                type="checkbox"
                :checked="prayerStore.completedDates.has(item.date)"
                @change="prayerStore.toggleCompleted(item.date)"
              />
              <span>{{ item.label }}</span>
            </label>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUiStore } from '../stores/useUiStore.js';
import { usePrayerStore } from '../stores/usePrayerStore.js';

const { t, locale } = useI18n();
const uiStore = useUiStore();
const prayerStore = usePrayerStore();

const isDark = computed(() => uiStore.isDark);

const localStart = ref(prayerStore.startDate);
const localEnd = ref(prayerStore.endDate);

watch(() => prayerStore.startDate, (v) => { localStart.value = v; });
watch(() => prayerStore.endDate, (v) => { localEnd.value = v; });

const onBuild = () => {
  prayerStore.buildPlan(localStart.value, localEnd.value, locale.value);
};
</script>

<style scoped>
.start-page {
  min-height: 100vh;
  background: #f7f7f5;
  color: #18181b;
}

.dark.start-page {
  background: #121214;
  color: #f5f5f5;
}

.section {
  width: min(980px, 92vw);
  margin: 20px auto;
}

.card {
  border: 1px solid #e4e4e7;
  border-radius: 16px;
  padding: 24px;
  background: #fff;
}

.dark .card {
  background: #18181b;
  border-color: #313138;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 14px 0;
}

label {
  display: grid;
  gap: 6px;
  font-size: 14px;
}

input[type='date'] {
  border: 1px solid #d4d4d8;
  border-radius: 10px;
  padding: 10px;
  background: #fff;
  color: inherit;
  font-size: 14px;
}

.dark input[type='date'] {
  background: #1f1f22;
  color: #fff;
  border-color: #3f3f46;
}

.primary-btn {
  border: 1px solid #18181b;
  border-radius: 10px;
  padding: 10px 16px;
  background: #18181b;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}

.dark .primary-btn {
  background: #f4f4f5;
  color: #111;
  border-color: #f4f4f5;
}

.plan-list ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  max-height: 320px;
  overflow: auto;
}

.plan-list li + li {
  margin-top: 8px;
}

.stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.muted {
  opacity: 0.75;
}

.error {
  color: #dc2626;
  margin-top: 8px;
}

@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
