<template>
  <div class="stats-wrap">

    <!-- Stat cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num stat-green">{{ quranStore.stats.learned }}</div>
        <div class="stat-label">{{ t('quran.stats.learned') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-num stat-blue">{{ quranStore.stats.learning }}</div>
        <div class="stat-label">{{ t('quran.stats.learning') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-num stat-gray">{{ quranStore.stats.remaining }}</div>
        <div class="stat-label">{{ t('quran.stats.remaining') }}</div>
      </div>
    </div>

    <!-- Progress card -->
    <div class="stats-progress-card">
      <div class="stats-progress-header">
        <span class="stats-progress-label">{{ t('quran.stats.progress') }}</span>
        <span class="stats-progress-pct">{{ quranStore.stats.pct }}%</span>
      </div>
      <div class="stats-bar-track">
        <div
          class="stats-bar-fill"
          :style="{ width: Math.max(quranStore.stats.pct, 1) + '%' }"
        ></div>
      </div>
      <div class="stats-bar-sub">
        {{ quranStore.stats.learned }} / {{ quranStore.stats.total }} {{ t('quran.stats.surahs') }}
      </div>
    </div>

    <!-- Totals info -->
    <div class="stats-info-card">
      <div class="stats-info-row">
        <span class="stats-info-label">{{ t('quran.stats.totalSurahs') }}</span>
        <span class="stats-info-val">114</span>
      </div>
      <div class="stats-info-divider"></div>
      <div class="stats-info-row">
        <span class="stats-info-label">{{ t('quran.stats.withStatus') }}</span>
        <span class="stats-info-val">{{ quranStore.stats.learned + quranStore.stats.learning }}</span>
      </div>
      <div class="stats-info-divider"></div>
      <div class="stats-info-row">
        <span class="stats-info-label">{{ t('quran.stats.notStarted') }}</span>
        <span class="stats-info-val">{{ 114 - quranStore.stats.learned - quranStore.stats.learning }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useQuranStore } from '../../stores/useQuranStore'

const { t } = useI18n()
const quranStore = useQuranStore()
</script>

<style scoped>
.stats-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stat-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px 8px;
  text-align: center;
  box-shadow: var(--shadow);
}
.stat-num {
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 5px;
}
.stat-label { font-size: 11px; color: var(--text2); font-weight: 500; }
.stat-green { color: var(--green); }
.stat-blue  { color: #3B82F6; }
.stat-gray  { color: var(--text2); }

/* Progress card */
.stats-progress-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px;
  box-shadow: var(--shadow);
}
.stats-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.stats-progress-label { font-weight: 600; color: var(--text1); font-size: 14px; }
.stats-progress-pct   { font-weight: 800; color: var(--teal); font-size: 18px; }
.stats-bar-track {
  height: 10px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}
.stats-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--teal), var(--green));
  border-radius: 999px;
  transition: width 0.7s ease;
}
.stats-bar-sub {
  font-size: 12px;
  color: var(--text2);
  text-align: right;
}

/* Info card */
.stats-info-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.stats-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}
.stats-info-label { font-size: 13px; color: var(--text2); }
.stats-info-val   { font-size: 14px; font-weight: 700; color: var(--text1); }
.stats-info-divider { height: 1px; background: var(--border); }
</style>