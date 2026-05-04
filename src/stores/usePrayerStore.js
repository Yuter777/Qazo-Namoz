import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { loadPrayerPlan, savePrayerPlan } from '../services/prayerPlanService';

const LOCALE_MAP = { ru: 'ru-RU', en: 'en-US', uz: 'uz-UZ' };

export const usePrayerStore = defineStore('prayer', () => {
  const startDate = ref(localStorage.getItem('qazo-start-date') || '');
  const endDate = ref(localStorage.getItem('qazo-end-date') || '');
  const planDates = ref(JSON.parse(localStorage.getItem('qazo-plan-dates') || '[]'));
  const completedDates = ref(new Set(JSON.parse(localStorage.getItem('qazo-completed-dates') || '[]')));
  const planErrorKey = ref('');
  const isHydrating = ref(false);
  const uid = ref(null);

  const completedCount = computed(() => completedDates.value.size);
  const remainingCount = computed(() => Math.max(planDates.value.length - completedDates.value.size, 0));
  const totalCount = computed(() => planDates.value.length);

  const _saveLocal = () => {
    localStorage.setItem('qazo-start-date', startDate.value || '');
    localStorage.setItem('qazo-end-date', endDate.value || '');
    localStorage.setItem('qazo-plan-dates', JSON.stringify(planDates.value));
    localStorage.setItem('qazo-completed-dates', JSON.stringify([...completedDates.value]));
  };

  const _saveCloud = async () => {
    if (isHydrating.value || !uid.value) return;
    try {
      await savePrayerPlan(uid.value, {
        startDate: startDate.value,
        endDate: endDate.value,
        planDates: planDates.value,
        completedDates: [...completedDates.value],
      });
    } catch (err) {
      console.error('Prayer plan sync error:', err);
    }
  };

  const hydrateFromCloud = async (userUid) => {
    uid.value = userUid;
    isHydrating.value = true;
    try {
      const data = await loadPrayerPlan(userUid);
      if (!data) return;
      startDate.value = data.startDate || '';
      endDate.value = data.endDate || '';
      planDates.value = data.planDates || [];
      completedDates.value = new Set(data.completedDates || []);
      _saveLocal();
    } finally {
      isHydrating.value = false;
    }
  };

  // Returns false on validation error; sets planErrorKey to an i18n key
  const buildPlan = (start, end, locale) => {
    planErrorKey.value = '';

    if (!start || !end) {
      planErrorKey.value = 'home.missingDates';
      return false;
    }

    const s = new Date(start);
    const e = new Date(end);

    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      planErrorKey.value = 'home.invalidDate';
      return false;
    }
    if (s > e) {
      planErrorKey.value = 'home.badRange';
      return false;
    }

    const dateLocale = LOCALE_MAP[locale] || 'uz-UZ';
    const entries = [];
    const cursor = new Date(s);

    while (cursor <= e) {
      const iso = cursor.toISOString().split('T')[0];
      entries.push({
        date: iso,
        label: cursor.toLocaleDateString(dateLocale, {
          weekday: 'short',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    startDate.value = start;
    endDate.value = end;
    planDates.value = entries;
    completedDates.value = new Set();
    _saveLocal();
    _saveCloud();
    return true;
  };

  const toggleCompleted = (date) => {
    const updated = new Set(completedDates.value);
    if (updated.has(date)) updated.delete(date);
    else updated.add(date);
    completedDates.value = updated;
    _saveLocal();
    _saveCloud();
  };

  return {
    startDate,
    endDate,
    planDates,
    completedDates,
    planErrorKey,
    isHydrating,
    completedCount,
    remainingCount,
    totalCount,
    hydrateFromCloud,
    buildPlan,
    toggleCompleted,
  };
});
