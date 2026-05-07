<template>
  <div class="sd-page fade-in">

    <!-- Top bar -->
    <div class="sd-topbar">
      <button class="sd-back-btn" @click="router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <div class="sd-topbar-info">
        <span class="sd-topbar-arabic">{{ surahMeta?.name }}</span>
        <span class="sd-topbar-en">{{ surahMeta?.englishName }}</span>
      </div>

      <button class="sd-settings-btn" :title="t('quran.settings.displayTitle')" @click="showModal = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>

    <!-- Surah meta bar -->
    <div v-if="surahMeta" class="sd-meta-bar">
      <span class="sd-meta-chip">{{ t(`quran.type_${surahMeta.revelationType}`) }}</span>
      <span class="sd-meta-chip">{{ surahMeta.numberOfAyahs }} {{ t('quran.ayahs') }}</span>
      <span v-if="surahMeta.status" class="sd-meta-chip sd-meta-status" :class="`sd-status-${surahMeta.status}`">
        {{ t(`quran.status_${surahMeta.status}`) }}
      </span>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="sd-skel-block">
        <div class="skel skel-bar" style="height:12px;width:30%;margin-bottom:10px"></div>
        <div class="skel skel-bar" style="height:28px;width:90%"></div>
        <div class="skel skel-bar" style="height:12px;width:75%"></div>
        <div class="skel skel-bar" style="height:12px;width:55%"></div>
      </div>
    </template>

    <!-- Error -->
    <div v-else-if="error" class="sd-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.5" stroke-linecap="round" class="sd-state-icon-svg">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p class="sd-state-text">{{ t('common.error') }}</p>
      <el-button size="small" @click="loadData">{{ t('quran.retry') }}</el-button>
    </div>

    <!-- Ayah list -->
    <div v-else class="sd-list" ref="listRef">

      <!-- Bismillah (all surahs except At-Tawbah #9) -->
      <div v-if="surahId !== 9" class="sd-bismillah" dir="rtl">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </div>

      <AyahItem
        v-for="ayah in ayahs"
        :key="ayah.number"
        :ref="el => setAyahRef(el, ayah.number)"
        :ayah="ayah"
        :settings="quranStore.settings"
        :highlighted="currentAyah === ayah.number"
      />
    </div>

    <!-- Settings modal -->
    <SettingsModal
      v-model="showModal"
      :settings="quranStore.settings"
      @update="handleSettingsUpdate"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuranStore } from '../stores/useQuranStore'
import { useAuthStore } from '../stores/useAuthStore'
import AyahItem     from '../components/quran/AyahItem.vue'
import SettingsModal from '../components/quran/SettingsModal.vue'

const route  = useRoute()
const router = useRouter()
const { t }  = useI18n()
const quranStore = useQuranStore()
const authStore  = useAuthStore()

const surahId = computed(() => Number(route.params.id))
const ayahs   = ref([])
const loading = ref(true)
const error   = ref(false)
const showModal    = ref(false)
const currentAyah  = ref(null)
const listRef      = ref(null)

// Map ayah number → DOM element ref
const ayahRefs = {}
function setAyahRef(el, num) {
  if (el) ayahRefs[num] = el.$el ?? el
}

const surahMeta = computed(() =>
  quranStore.mergedSurahs.find(s => s.number === surahId.value)
)

// ── Load data ──────────────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  error.value   = false
  try {
    await quranStore.fetchSurahs()
    const result = await quranStore.fetchAyahs(surahId.value)
    if (!result) throw new Error('No data')
    ayahs.value = result
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// ── Intersection Observer for last-read tracking ───────────────────────────
let observer = null
let saveTimer = null

function initObserver() {
  observer = new IntersectionObserver(entries => {
    let topmost = null
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const num = Number(entry.target.dataset.ayah)
      if (!topmost || num < topmost) topmost = num
    })
    if (topmost && topmost !== currentAyah.value) {
      currentAyah.value = topmost
      debounceSave(topmost)
    }
  }, { threshold: 0.4 })

  nextTick(() => {
    Object.values(ayahRefs).forEach(el => {
      if (el) observer.observe(el)
    })
  })
}

function debounceSave(ayahNumber) {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const uid = authStore.currentUser?.uid
    if (uid) quranStore.updateLastRead(uid, surahId.value, ayahNumber)
  }, 1200)
}

// ── Scroll to last read ────────────────────────────────────────────────────
async function scrollToLastRead() {
  const lr = quranStore.lastRead
  if (!lr || lr.surahId !== surahId.value || lr.ayahNumber <= 1) return
  await nextTick()
  // Small delay so refs are populated
  setTimeout(() => {
    const el = ayahRefs[lr.ayahNumber]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 200)
}

// ── Settings update from modal ─────────────────────────────────────────────
function handleSettingsUpdate(patch) {
  const uid = authStore.currentUser?.uid
  if (!uid) return
  quranStore.updateSettings(uid, patch)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  const uid = authStore.currentUser?.uid
  await Promise.all([
    loadData(),
    uid ? quranStore.loadSettings(uid)  : Promise.resolve(),
    uid ? quranStore.loadLastRead(uid)  : Promise.resolve(),
  ])
  await scrollToLastRead()
  initObserver()
})

onUnmounted(() => {
  observer?.disconnect()
  clearTimeout(saveTimer)
})
</script>

<style scoped>
.sd-page {
  min-height: 100vh;
  padding-bottom: 32px;
}

/* ── Top bar ── */
.sd-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.sd-back-btn,
.sd-settings-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}
.sd-back-btn:hover,
.sd-settings-btn:hover {
  background: var(--teal-light);
  border-color: var(--teal-mid);
  color: var(--teal);
}

.sd-topbar-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sd-topbar-arabic {
  font-family: 'Scheherazade New', 'Amiri', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--text1);
  line-height: 1.3;
}
.sd-topbar-en {
  font-size: 11px;
  color: var(--text2);
  font-weight: 600;
}

/* ── Meta bar ── */
.sd-meta-bar {
  display: flex;
  gap: 6px;
  padding: 10px 16px;
  flex-wrap: wrap;
}
.sd-meta-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--bg2);
  border: 1px solid var(--border);
  color: var(--text2);
}
.sd-meta-status.sd-status-learned { color: var(--green); border-color: var(--green); background: var(--green-light); }
.sd-meta-status.sd-status-learning { color: #F59E0B; border-color: #F59E0B; background: rgba(245,158,11,0.1); }

/* ── Bismillah ── */
.sd-bismillah {
  font-family: 'Scheherazade New', 'Amiri', serif;
  font-size: 26px;
  text-align: center;
  color: var(--teal);
  padding: 20px 16px 8px;
  line-height: 1.8;
}

/* ── List ── */
.sd-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px 0;
}

/* ── Skeletons ── */
.sd-skel-block {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg2);
  margin: 0 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.skel {
  background: linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Error state ── */
.sd-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 16px;
  color: var(--text2);
}
.sd-state-icon-svg { opacity: 0.4; }
.sd-state-text { font-size: 14px; }

/* ── Fade-in ── */
.fade-in {
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
