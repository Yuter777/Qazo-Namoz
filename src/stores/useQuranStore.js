import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getUserProgress, setSurahStatus, removeSurahStatus,
  getQuranSettings, saveQuranSettings,
} from '../services/quranService'

const API_BASE = 'https://api.alquran.cloud/v1'

export const useQuranStore = defineStore('quran', () => {
  // ── State ──────────────────────────────────────────────────────────────
  const surahs = ref([])
  const progress = ref({})   // { [surahId]: { surahId, status, updatedAt } }
  const settings = ref({ autoplay: false, reciter: 'ar.alafasy' })

  const isLoadingSurahs = ref(false)
  const isLoadingProgress = ref(false)
  const surahsLoaded = ref(false)
  const surahsError = ref(false)

  const searchQuery = ref('')
  const savingIds = ref([]) // surahIds currently being saved

  // Audio element lives outside Vue reactivity to avoid proxy issues
  let _audioEl = null

  const audioState = ref({
    surahId: null,
    surahName: '',
    ayahs: [],
    index: 0,
    isPlaying: false,
    isLoading: false,
  })

  // ── Computed ────────────────────────────────────────────────────────────
  const mergedSurahs = computed(() =>
    surahs.value.map(s => ({
      ...s,
      status: progress.value[String(s.number)]?.status ?? null,
    }))
  )

  const filteredSurahs = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    const list = q
      ? mergedSurahs.value.filter(s =>
          s.englishName.toLowerCase().includes(q) ||
          s.name.includes(q) ||
          String(s.number).includes(q)
        )
      : [...mergedSurahs.value]

    return list.sort((a, b) => {
      const ord = { learned: 0, learning: 1, null: 2 }
      return (ord[a.status] ?? 2) - (ord[b.status] ?? 2)
    })
  })

  const learnedSurahs = computed(() =>
    mergedSurahs.value.filter(s => s.status === 'learned')
  )
  const learningSurahs = computed(() =>
    mergedSurahs.value.filter(s => s.status === 'learning')
  )
  const stats = computed(() => {
    const learned = learnedSurahs.value.length
    const learning = learningSurahs.value.length
    const remaining = 114 - learned
    const pct = Math.round((learned / 114) * 100)
    return { learned, learning, remaining, total: 114, pct }
  })

  // ── API Actions ─────────────────────────────────────────────────────────
  async function fetchSurahs() {
    if (surahsLoaded.value) return
    isLoadingSurahs.value = true
    surahsError.value = false
    try {
      const res = await fetch(`${API_BASE}/surah`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.code === 200) {
        surahs.value = json.data
        surahsLoaded.value = true
      }
    } catch (e) {
      surahsError.value = true
      console.error('fetchSurahs:', e)
    } finally {
      isLoadingSurahs.value = false
    }
  }

  // ── Firestore Actions ───────────────────────────────────────────────────
  async function fetchProgress(uid) {
    isLoadingProgress.value = true
    try {
      progress.value = await getUserProgress(uid)
    } catch (e) {
      console.error('fetchProgress:', e)
    } finally {
      isLoadingProgress.value = false
    }
  }

  async function setStatus(uid, surahId, status) {
    const key = String(surahId)
    // Optimistic update
    progress.value = {
      ...progress.value,
      [key]: { surahId: Number(surahId), status, updatedAt: null },
    }
    savingIds.value = [...savingIds.value, key]
    try {
      await setSurahStatus(uid, surahId, status)
    } catch (e) {
      // Revert on failure
      const reverted = { ...progress.value }
      delete reverted[key]
      progress.value = reverted
      console.error('setStatus:', e)
    } finally {
      savingIds.value = savingIds.value.filter(x => x !== key)
    }
  }

  async function removeStatus(uid, surahId) {
    const key = String(surahId)
    const prev = progress.value[key]
    // Optimistic remove
    const reverted = { ...progress.value }
    delete reverted[key]
    progress.value = reverted
    savingIds.value = [...savingIds.value, key]
    try {
      await removeSurahStatus(uid, surahId)
    } catch (e) {
      // Revert on failure
      if (prev) progress.value = { ...progress.value, [key]: prev }
      console.error('removeStatus:', e)
    } finally {
      savingIds.value = savingIds.value.filter(x => x !== key)
    }
  }

  async function loadSettings(uid) {
    try {
      const data = await getQuranSettings(uid)
      if (data) settings.value = { ...settings.value, ...data }
    } catch (e) {
      console.error('loadSettings:', e)
    }
  }

  async function updateSettings(uid, patch) {
    settings.value = { ...settings.value, ...patch }
    try {
      await saveQuranSettings(uid, settings.value)
    } catch (e) {
      console.error('updateSettings:', e)
    }
  }

  // ── Audio ───────────────────────────────────────────────────────────────
  async function playSurah(surahId, surahName) {
    // Toggle play/pause if same surah
    if (audioState.value.surahId === surahId) {
      if (audioState.value.isPlaying) {
        _audioEl?.pause()
        audioState.value.isPlaying = false
      } else {
        _audioEl?.play().then(() => { audioState.value.isPlaying = true }).catch(() => {})
      }
      return
    }
    stopAudio()
    audioState.value.surahId = surahId
    audioState.value.surahName = surahName
    audioState.value.isLoading = true
    try {
      const reciter = settings.value.reciter
      const res = await fetch(`${API_BASE}/surah/${surahId}/${reciter}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.code === 200) {
        audioState.value.ayahs = json.data.ayahs.map(a => a.audio)
        audioState.value.index = 0
        _playAt(0)
      }
    } catch (e) {
      console.error('playSurah:', e)
      audioState.value.surahId = null
    } finally {
      audioState.value.isLoading = false
    }
  }

  function _playAt(idx) {
    const ayahs = audioState.value.ayahs
    if (idx >= ayahs.length) {
      audioState.value.isPlaying = false
      if (settings.value.autoplay) {
        const nextId = (audioState.value.surahId ?? 0) + 1
        if (nextId <= 114) {
          const next = surahs.value.find(s => s.number === nextId)
          if (next) playSurah(next.number, next.englishName)
        }
      }
      return
    }
    if (!_audioEl) {
      _audioEl = new Audio()
      _audioEl.addEventListener('ended', () => {
        audioState.value.index++
        _playAt(audioState.value.index)
      })
      _audioEl.addEventListener('error', () => {
        audioState.value.isPlaying = false
      })
    }
    _audioEl.src = ayahs[idx]
    _audioEl.play()
      .then(() => { audioState.value.isPlaying = true })
      .catch(() => { audioState.value.isPlaying = false })
  }

  function stopAudio() {
    if (_audioEl) {
      _audioEl.pause()
      _audioEl.src = ''
    }
    audioState.value = {
      surahId: null, surahName: '', ayahs: [],
      index: 0, isPlaying: false, isLoading: false,
    }
  }

  function isSaving(surahId) {
    return savingIds.value.includes(String(surahId))
  }

  return {
    surahs, progress, settings,
    isLoadingSurahs, isLoadingProgress, surahsLoaded, surahsError,
    searchQuery, audioState, savingIds,
    mergedSurahs, filteredSurahs, learnedSurahs, learningSurahs, stats,
    fetchSurahs, fetchProgress, setStatus, removeStatus,
    loadSettings, updateSettings,
    playSurah, stopAudio, isSaving,
  }
})