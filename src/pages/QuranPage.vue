<template>
  <div class="qn-page fade-in">
    <div class="qp-wrap">

      <!-- Page header -->
      <div class="page-header">
        <div>
          <div class="page-title">📖 {{ t('quran.title') }}</div>
          <div class="page-subtitle">{{ t('quran.subtitle') }}</div>
        </div>
      </div>

      <!-- Tab bar -->
      <div class="qp-tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="qp-tab-btn"
          :class="{ active: activeTab === tab.key }"
          role="tab"
          :aria-selected="activeTab === tab.key"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab panels (v-show to preserve scroll state) -->
      <SurahList   v-show="activeTab === 'surahs'"   />
      <ProgressTab v-show="activeTab === 'progress'" />
      <StatsTab    v-show="activeTab === 'stats'"    />
      <SettingsTab v-show="activeTab === 'settings'" />

    </div>

    <!-- Floating audio mini-player -->
    <transition name="audio-slide">
      <div
        v-if="quranStore.audioState.surahId !== null"
        class="qp-audio-bar"
      >
        <div class="qp-audio-info">
          <span class="qp-audio-eyebrow">{{ t('quran.nowPlaying') }}</span>
          <span class="qp-audio-name">{{ quranStore.audioState.surahName }}</span>
          <span class="qp-audio-ayah">{{ t('quran.ayah') }} {{ quranStore.audioState.index + 1 }} / {{ quranStore.audioState.ayahs.length }}</span>
        </div>
        <div class="qp-audio-controls">
          <button class="qp-audio-btn" @click="handlePlayPause">
            <span v-if="quranStore.audioState.isLoading">⌛</span>
            <span v-else-if="quranStore.audioState.isPlaying">⏸</span>
            <span v-else>▶</span>
          </button>
          <button class="qp-audio-btn qp-audio-stop" @click="quranStore.stopAudio()" :title="t('quran.stop')">
            ⏹
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuranStore } from '../stores/useQuranStore'
import { useAuthStore } from '../stores/useAuthStore'
import SurahList   from '../components/quran/SurahList.vue'
import ProgressTab from '../components/quran/ProgressTab.vue'
import StatsTab    from '../components/quran/StatsTab.vue'
import SettingsTab from '../components/quran/SettingsTab.vue'

const { t } = useI18n()
const quranStore = useQuranStore()
const authStore  = useAuthStore()

const activeTab = ref('surahs')

const tabs = computed(() => [
  { key: 'surahs',   label: t('quran.tabs.surahs')   },
  { key: 'progress', label: t('quran.tabs.progress')  },
  { key: 'stats',    label: t('quran.tabs.stats')     },
  { key: 'settings', label: t('quran.tabs.settings')  },
])

function handlePlayPause() {
  const s = quranStore.audioState
  if (s.surahId) quranStore.playSurah(s.surahId, s.surahName)
}

onMounted(async () => {
  const uid = authStore.currentUser?.uid
  await quranStore.fetchSurahs()
  if (uid) {
    await Promise.all([
      quranStore.fetchProgress(uid),
      quranStore.loadSettings(uid),
    ])
  }
})

onUnmounted(() => {
  quranStore.stopAudio()
})
</script>

<style scoped>
.qp-wrap {
  padding: 0 16px 24px;
}

/* ── Tab bar ── */
.qp-tabs {
  display: flex;
  gap: 5px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.qp-tabs::-webkit-scrollbar { display: none; }

.qp-tab-btn {
  flex: 1;
  min-width: max-content;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  transition: all 0.2s;
  white-space: nowrap;
}
.qp-tab-btn.active {
  background: var(--teal);
  color: #fff;
  box-shadow: 0 2px 8px rgba(45, 158, 138, 0.3);
}
.qp-tab-btn:hover:not(.active) {
  color: var(--text1);
  background: var(--teal-light);
}

/* ── Audio mini-player ── */
.qp-audio-bar {
  position: fixed;
  bottom: 72px;
  left: 0;
  right: 0;
  max-width: 430px;
  margin: 0 auto;
  background: var(--teal);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  box-shadow: 0 -4px 16px rgba(45, 158, 138, 0.35);
  z-index: 98;
}

.qp-audio-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.qp-audio-eyebrow {
  font-size: 9px;
  font-weight: 600;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.qp-audio-name {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.qp-audio-ayah {
  font-size: 10px;
  opacity: 0.65;
}

.qp-audio-controls {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.qp-audio-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.qp-audio-btn:hover { background: rgba(255, 255, 255, 0.35); }
.qp-audio-stop { font-size: 13px; }

/* ── Transitions ── */
.audio-slide-enter-active,
.audio-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.audio-slide-enter-from,
.audio-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>