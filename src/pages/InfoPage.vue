<template>
  <div class="qn-page fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <div class="page-title">{{ t('info.howToUse') }}</div>
      </div>
      <span style="font-size: 28px">🕌</span>
    </div>

    <!-- Steps -->
    <div class="qn-section-label">{{ t('info.howToUse') }}</div>
    <div class="qn-card" style="margin: 0 20px">
      <div v-for="(step, i) in steps" :key="i" class="info-step">
        <div class="info-num">{{ i + 1 }}</div>
        <div style="font-size: 14px; color: var(--text1); line-height: 1.5">{{ step }}</div>
      </div>
    </div>

    <!-- Prayer order -->
    <div class="qn-section-label">{{ t('info.prayerOrder') }}</div>
    <div class="qn-card" style="margin: 0 20px">
      <div
        v-for="(p, i) in PRAYERS"
        :key="p"
        class="order-row"
        :style="{ borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }"
      >
        <div
          class="order-num"
          :style="`background:${ORDER_COLORS[i]}20;color:${ORDER_COLORS[i]}`"
        >{{ i + 1 }}</div>
        <div style="font-size: 15px; font-weight: 500; color: var(--text1)">{{ PRAYER_EMOJIS[p] }}</div>
        <div style="flex: 1; font-size: 14px; color: var(--text1); font-weight: 500">
          {{ t(`prayers.${p}`) }}
        </div>
      </div>
    </div>

    <div style="padding: 20px; text-align: center; color: var(--text3); font-size: 13px">
      v1.0 · {{ t('nav.appName') }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PRAYERS, PRAYER_EMOJIS } from '../utils/prayerConstants.js'

const { t } = useI18n()

const ORDER_COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#f97316', '#8b5cf6', '#2d9e8a']

const steps = computed(() => [
  t('info.step1'),
  t('info.step2'),
  t('info.step3'),
  t('info.step4'),
])
</script>

<style scoped>
.page-header {
  padding: 20px 20px 16px;
  display: flex; align-items: center; justify-content: space-between;
}
.page-title { font-size: 22px; font-weight: 700; color: var(--text1); letter-spacing: -0.5px; }

.info-step {
  display: flex; gap: 16px; padding: 16px;
  border-bottom: 1px solid var(--border);
  align-items: flex-start;
}
.info-step:last-child { border-bottom: none; }
.info-num {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--teal-light); color: var(--teal-dark);
  font-weight: 700; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.order-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
}
.order-num {
  width: 28px; height: 28px; border-radius: 8px;
  font-weight: 700; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .page-header { padding: 32px 32px 16px; }
  .page-title  { font-size: 26px; }
  .qn-card     { margin: 0 32px !important; }
  .qn-section-label { padding-left: 32px; padding-right: 32px; }
}
</style>
