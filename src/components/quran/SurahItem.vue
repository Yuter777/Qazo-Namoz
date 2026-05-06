<template>
  <div class="si-card" :class="cardClass">
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
    <div class="si-actions">
      <!-- Play / Pause -->
      <button
        class="si-btn si-play-btn"
        :class="{ 'si-btn-active-play': isCurrentlyPlaying }"
        :disabled="audioState.isLoading && audioState.surahId === surah.number"
        :title="t('quran.play')"
        @click="handlePlay"
      >
        <span v-if="audioState.isLoading && audioState.surahId === surah.number">⌛</span>
        <span v-else-if="isCurrentlyPlaying">⏸</span>
        <span v-else>▶</span>
      </button>

      <!-- Mark Learned -->
      <button
        class="si-btn"
        :class="{ 'si-btn-active-learned': surah.status === 'learned' }"
        :disabled="saving"
        :title="t('quran.markLearned')"
        @click="handleStatus('learned')"
      >✅</button>

      <!-- Mark Learning -->
      <button
        class="si-btn"
        :class="{ 'si-btn-active-learning': surah.status === 'learning' }"
        :disabled="saving"
        :title="t('quran.markLearning')"
        @click="handleStatus('learning')"
      >📖</button>

      <!-- Remove status -->
      <button
        v-if="surah.status"
        class="si-btn si-btn-remove"
        :disabled="saving"
        :title="t('quran.removeStatus')"
        @click="handleRemove"
      >✕</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuranStore } from '../../stores/useQuranStore'
import { useAuthStore } from '../../stores/useAuthStore'

const props = defineProps({
  surah: { type: Object, required: true },
})

const { t } = useI18n()
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
}
.si-card:hover { border-color: var(--teal-mid); }

.si-card-learned {
  border-color: var(--green) !important;
  background: var(--green-light);
}
.si-card-learning {
  border-color: #3B82F6 !important;
  background: rgba(59, 130, 246, 0.06);
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
.si-tag-learning { color: #3B82F6; border-color: #3B82F6; background: rgba(59,130,246,0.1); }

/* Actions */
.si-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.si-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg);
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s, opacity 0.15s;
}
.si-btn:hover:not(:disabled) {
  background: var(--teal-light);
  border-color: var(--teal-mid);
}
.si-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.si-play-btn { font-size: 11px; }
.si-btn-active-play    { background: var(--teal-light) !important; border-color: var(--teal) !important; }
.si-btn-active-learned { background: var(--green-light) !important; border-color: var(--green) !important; }
.si-btn-active-learning{ background: rgba(59,130,246,0.12) !important; border-color: #3B82F6 !important; }
.si-btn-remove {
  color: var(--red);
  border-color: transparent;
  background: transparent;
  font-size: 11px;
  font-weight: 700;
}
.si-btn-remove:hover:not(:disabled) {
  background: var(--red-light) !important;
  border-color: var(--red) !important;
}
</style>