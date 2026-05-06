<template>
  <div class="pt-wrap">

    <!-- Learned -->
    <div class="pt-section">
      <div class="pt-section-head">
        <span class="pt-section-label">✅ {{ t('quran.progress.learned') }}</span>
        <span class="pt-badge pt-badge-green">{{ quranStore.learnedSurahs.length }}</span>
      </div>
      <div v-if="quranStore.learnedSurahs.length" class="pt-list">
        <SurahItem
          v-for="s in quranStore.learnedSurahs"
          :key="s.number"
          :surah="s"
        />
      </div>
      <div v-else class="pt-empty">{{ t('quran.progress.empty') }}</div>
    </div>

    <!-- Learning -->
    <div class="pt-section">
      <div class="pt-section-head">
        <span class="pt-section-label">📖 {{ t('quran.progress.learning') }}</span>
        <span class="pt-badge pt-badge-blue">{{ quranStore.learningSurahs.length }}</span>
      </div>
      <div v-if="quranStore.learningSurahs.length" class="pt-list">
        <SurahItem
          v-for="s in quranStore.learningSurahs"
          :key="s.number"
          :surah="s"
        />
      </div>
      <div v-else class="pt-empty">{{ t('quran.progress.empty') }}</div>
    </div>

  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useQuranStore } from '../../stores/useQuranStore'
import SurahItem from './SurahItem.vue'

const { t } = useI18n()
const quranStore = useQuranStore()
</script>

<style scoped>
.pt-wrap {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pt-section { display: flex; flex-direction: column; gap: 10px; }

.pt-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pt-section-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--text1);
}
.pt-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.pt-badge-green { color: var(--green); background: var(--green-light); }
.pt-badge-blue  { color: #3B82F6; background: rgba(59, 130, 246, 0.1); }

.pt-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pt-empty {
  text-align: center;
  padding: 20px;
  font-size: 13px;
  color: var(--text2);
  background: var(--bg2);
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
}
</style>