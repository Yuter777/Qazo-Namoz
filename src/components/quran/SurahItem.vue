<template>
  <div class="si-card" :class="cardClass" @click="goToDetail">

    <!-- Surah number badge -->
    <div class="si-num">{{ surah.number }}</div>

    <!-- Names + meta -->
    <div class="si-info">
      <div class="si-arabic">{{ surah.name }}</div>
      <div class="si-english">{{ surah.englishName }}</div>
      <div class="si-meta">
        {{ surah.numberOfAyahs }} {{ t('quran.ayahs') }}
        <span class="si-dot">·</span>
        {{ t(`quran.type_${surah.revelationType}`) }}
        <span v-if="surah.status" class="si-tag" :class="`si-tag-${surah.status}`">
          {{ t(`quran.status_${surah.status}`) }}
        </span>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="si-actions" @click.stop>

      <!-- Play / Pause -->
      <button
        class="si-btn si-play-btn"
        :class="{ 'si-btn-active-play': isCurrentlyPlaying }"
        :disabled="audioState.isLoading && audioState.surahId === surah.number"
        :title="t('quran.play')"
        @click="handlePlay"
      >
        <svg v-if="audioState.isLoading && audioState.surahId === surah.number"
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="si-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <svg v-else-if="isCurrentlyPlaying"
          width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </button>

      <!-- Mark Learned -->
      <button
        class="si-btn"
        :class="{ 'si-btn-active-learned': surah.status === 'learned' }"
        :disabled="saving"
        :title="t('quran.markLearned')"
        @click="handleStatus('learned')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>

      <!-- Mark Learning -->
      <button
        class="si-btn"
        :class="{ 'si-btn-active-learning': surah.status === 'learning' }"
        :disabled="saving"
        :title="t('quran.markLearning')"
        @click="handleStatus('learning')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>

      <!-- Remove status -->
      <button
        v-if="surah.status"
        class="si-btn si-btn-remove"
        :disabled="saving"
        :title="t('quran.removeStatus')"
        @click="handleRemove"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuranStore } from '../../stores/useQuranStore'
import { useAuthStore } from '../../stores/useAuthStore'

const props = defineProps({
  surah: { type: Object, required: true },
})

const { t } = useI18n()
const router = useRouter()
const quranStore = useQuranStore()
const authStore = useAuthStore()

const saving = computed(() => quranStore.isSaving(props.surah.number))
const audioState = computed(() => quranStore.audioState)

const isCurrentlyPlaying = computed(() =>
  quranStore.audioState.surahId === props.surah.number &&
  quranStore.audioState.isPlaying
)

const cardClass = computed(() => ({
  'si-card-learned': props.surah.status === 'learned',
  'si-card-learning': props.surah.status === 'learning',
}))

function goToDetail() {
  router.push({ name: 'SurahDetail', params: { id: props.surah.number } })
}

function handlePlay() {
  quranStore.playSurah(props.surah.number, props.surah.englishName)
}

function handleStatus(status) {
  const uid = authStore.currentUser?.uid
  if (!uid) return
  if (props.surah.status === status) {
    quranStore.removeStatus(uid, props.surah.number)
  } else {
    quranStore.setStatus(uid, props.surah.number, status)
  }
}

function handleRemove() {
  const uid = authStore.currentUser?.uid
  if (!uid) return
  quranStore.removeStatus(uid, props.surah.number)
}
</script>

<style scoped>
.si-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  background: var(--bg2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
}
.si-card:hover { border-color: var(--teal-mid); }

.si-card-learned {
  border-color: var(--green) !important;
  background: var(--green-light);
}
.si-card-learning {
  border-color: #F59E0B !important;
  background: rgba(245, 158, 11, 0.06);
}

/* Number badge */
.si-num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--teal-light);
  color: var(--teal);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Info */
.si-info {
  flex: 1;
  min-width: 0;
}
.si-arabic {
  font-size: 15px;
  font-weight: 700;
  color: var(--text1);
  font-family: 'Scheherazade New', 'Amiri', 'Arial', serif;
  line-height: 1.3;
}
.si-english {
  font-size: 12px;
  font-weight: 600;
  color: var(--text1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.si-meta {
  font-size: 10px;
  color: var(--text2);
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.si-dot { color: var(--text3); }
.si-tag {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 999px;
  border: 1px solid;
  letter-spacing: 0.02em;
}
.si-tag-learned  { color: var(--green); border-color: var(--green); background: var(--green-light); }
.si-tag-learning { color: #F59E0B; border-color: #F59E0B; background: rgba(245,158,11,0.1); }

/* Actions */
.si-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.si-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text2);
  transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s;
}
.si-btn:hover:not(:disabled) {
  background: var(--teal-light);
  border-color: var(--teal-mid);
  color: var(--teal);
}
.si-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.si-btn-active-play    { background: var(--teal-light) !important; border-color: var(--teal) !important; color: var(--teal) !important; }
.si-btn-active-learned { background: var(--green-light) !important; border-color: var(--green) !important; color: var(--green) !important; }
.si-btn-active-learning { background: rgba(245,158,11,0.12) !important; border-color: #F59E0B !important; color: #F59E0B !important; }
.si-btn-remove {
  color: var(--red);
  border-color: transparent;
  background: transparent;
}
.si-btn-remove:hover:not(:disabled) {
  background: var(--red-light) !important;
  border-color: var(--red) !important;
  color: var(--red) !important;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.si-spin { animation: spin 0.9s linear infinite; }
</style>
