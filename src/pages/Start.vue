<template>
  <div class="container start-page" :class="{ dark: isDark }">
    <main class="section card">
      <h1>{{ t('home.trackerTitle') }}</h1>
      <p class="muted">{{ t('home.trackerHint') }}</p>
      <div class="form-grid">
        <label>
          {{ t('home.startDate') }}
          <input v-model="startDate" type="date" />
        </label>
        <label>
          {{ t('home.endDate') }}
          <input v-model="endDate" type="date" />
        </label>
      </div>
      <button class="primary-btn" @click="buildPlan">{{ t('home.build') }}</button>

      <p v-if="planError" class="error">{{ planError }}</p>

      <div v-if="planDates.length" class="plan-list">
        <div class="stats">
          <p class="muted">{{ t('home.totalDays') }}: <strong>{{ planDates.length }}</strong></p>
          <p class="muted">{{ t('home.completed') }}: <strong>{{ completedCount }}</strong></p>
          <p class="muted">{{ t('home.left') }}: <strong>{{ remainingCount }}</strong></p>
        </div>
        <ul>
          <li v-for="item in planDates" :key="item.date">
            <label>
              <input
                type="checkbox"
                :checked="completedDates.has(item.date)"
                @change="toggleCompleted(item.date)"
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
import { onAuthChange } from '../services/authService';
import { loadPrayerPlan, savePrayerPlan } from '../services/prayerPlanService';

const { t, locale } = useI18n();

const isDark = ref(localStorage.getItem('qazo-theme') === 'dark');
const startDate = ref(localStorage.getItem('qazo-start-date') || '');
const endDate = ref(localStorage.getItem('qazo-end-date') || '');
const planError = ref('');
const planDates = ref(JSON.parse(localStorage.getItem('qazo-plan-dates') || '[]'));
const completedDates = ref(new Set(JSON.parse(localStorage.getItem('qazo-completed-dates') || '[]')));
const currentUser = ref(null);
const isHydrating = ref(false);

const completedCount = computed(() => completedDates.value.size);
const remainingCount = computed(() => Math.max(planDates.value.length - completedDates.value.size, 0));

const hydrateFromCloud = async (uid) => {
  isHydrating.value = true;
  try {
    const data = await loadPrayerPlan(uid);
    if (!data) return;
    startDate.value = data.startDate || '';
    endDate.value = data.endDate || '';
    planDates.value = data.planDates || [];
    completedDates.value = new Set(data.completedDates || []);
  } finally {
    isHydrating.value = false;
  }
};

const persistPlan = async () => {
  if (isHydrating.value || !currentUser.value?.uid) return;
  try {
    await savePrayerPlan(currentUser.value.uid, {
      startDate: startDate.value,
      endDate: endDate.value,
      planDates: planDates.value,
      completedDates: [...completedDates.value],
    });
  } catch (error) {
    console.error('Error saving prayer plan:', error);
  }
};

const buildPlan = () => {
  planError.value = '';
  planDates.value = [];
  completedDates.value = new Set();

  if (!startDate.value || !endDate.value) {
    planError.value = t('home.missingDates');
    return;
  }

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    planError.value = t('home.invalidDate');
    return;
  }
  if (start > end) {
    planError.value = t('home.badRange');
    return;
  }

  const entries = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = cursor.toISOString().split('T')[0];
    entries.push({
      date: iso,
      label: cursor.toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : locale.value === 'en' ? 'en-US' : 'uz-UZ', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  planDates.value = entries;
  persistPlan();
};

const toggleCompleted = (date) => {
  const updated = new Set(completedDates.value);
  if (updated.has(date)) updated.delete(date);
  else updated.add(date);
  completedDates.value = updated;
  persistPlan();
};

onAuthChange(async (user) => {
  currentUser.value = user;
  if (user?.uid) await hydrateFromCloud(user.uid);
});

watch(startDate, (value) => {
  localStorage.setItem('qazo-start-date', value || '');
  persistPlan();
});
watch(endDate, (value) => {
  localStorage.setItem('qazo-end-date', value || '');
  persistPlan();
});
watch(planDates, (value) => {
  localStorage.setItem('qazo-plan-dates', JSON.stringify(value));
  persistPlan();
}, { deep: true });
watch(completedDates, (value) => {
  localStorage.setItem('qazo-completed-dates', JSON.stringify([...value]));
  persistPlan();
}, { deep: true });
</script>

<style scoped>
.start-page { min-height: 100vh; background: #f7f7f5; color: #18181b; }
.dark.start-page { background: #121214; color: #f5f5f5; }
.section { width: min(980px, 92vw); margin: 20px auto; }
.card { border: 1px solid #e4e4e7; border-radius: 16px; padding: 24px; background: #fff; }
.dark .card { background: #18181b; border-color: #313138; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 14px 0; }
label { display: grid; gap: 6px; font-size: 14px; }
input[type='date'] { border: 1px solid #d4d4d8; border-radius: 10px; padding: 10px; background: #fff; }
.primary-btn { border: 1px solid #18181b; border-radius: 10px; padding: 10px 16px; background: #18181b; color: #fff; cursor: pointer; }
.plan-list ul { list-style: none; padding: 0; margin: 10px 0 0; max-height: 320px; overflow: auto; }
.plan-list li + li { margin-top: 8px; }
.stats { display: flex; gap: 16px; flex-wrap: wrap; }
.muted { opacity: 0.75; }
.error { color: #dc2626; }
@media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } }
</style>
