<template>
  <div>
    <!-- Search -->
    <div class="sl-search-wrap">
      <el-input
        v-model="quranStore.searchQuery"
        :placeholder="t('quran.search')"
        clearable
        size="large"
      >
        <template #prefix>
          <span style="font-size:14px">🔍</span>
        </template>
      </el-input>
    </div>

    <!-- Error state -->
    <div v-if="quranStore.surahsError" class="sl-state">
      <div class="sl-state-icon">⚠️</div>
      <p class="sl-state-text">{{ t('common.error') }}</p>
      <el-button size="small" @click="quranStore.fetchSurahs()">{{ t('quran.retry') }}</el-button>
    </div>

    <!-- Skeleton -->
    <template v-else-if="quranStore.isLoadingSurahs">
      <div v-for="i in 8" :key="i" class="sl-skel-row">
        <div class="skel skel-circle" style="width:30px;height:30px;flex-shrink:0"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px">
          <div class="skel skel-bar" style="height:13px;width:55%"></div>
          <div class="skel skel-bar" style="height:10px;width:35%"></div>
        </div>
        <div style="display:flex;gap:4px">
          <div v-for="j in 3" :key="j" class="skel skel-bar" style="width:28px;height:28px;border-radius:7px"></div>
        </div>
      </div>
    </template>

    <!-- List -->
    <template v-else>
      <div class="sl-list">
        <SurahItem
          v-for="surah in quranStore.filteredSurahs"
          :key="surah.number"
          :surah="surah"
        />
      </div>
      <div v-if="quranStore.filteredSurahs.length === 0" class="sl-state">
        <div class="sl-state-icon">🔍</div>
        <p class="sl-state-text">{{ t('quran.noResults') }}</p>
      </div>
    </template>
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
.sl-search-wrap { margin-bottom: 12px; }

.sl-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sl-skel-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  background: var(--bg2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  margin-bottom: 8px;
}
.skel {
  background: linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skel-circle { border-radius: 50%; }
.skel-bar    { border-radius: 6px; }
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.sl-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 16px;
  color: var(--text2);
}
.sl-state-icon { font-size: 40px; }
.sl-state-text { font-size: 14px; }
</style>