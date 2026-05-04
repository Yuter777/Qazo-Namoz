import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { PRAYERS, EMPTY_COUNTS } from '../utils/prayerConstants'
import { loadTracker, saveTracker, recordCompletion, loadHistory } from '../services/prayerService'

const LS_KEY = 'qazo-tracker-v2'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') } catch { return null }
}
function saveLocal(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch {}
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

export const usePrayerStore = defineStore('prayer', () => {
  // ── State ──────────────────────────────────────────────────
  const local     = loadLocal()
  const qazo      = ref(local?.qazo      || EMPTY_COUNTS())
  const completedCounts = ref(local?.completedCounts || EMPTY_COUNTS())
  const goals     = ref(local?.goals     || Object.fromEntries(PRAYERS.map(p => [p, 3])))
  const history   = ref([])
  const isLoading = ref(false)
  const uid       = ref(null)

  // todayCount tracks completions in the current calendar day (resets on new day)
  const _savedDay   = ref(local?.todayDay   || '')
  const _savedToday = ref(local?.todayCount || EMPTY_COUNTS())
  const todayCount  = computed(() => {
    if (_savedDay.value !== todayKey()) return EMPTY_COUNTS()
    return _savedToday.value
  })

  // ── Persist helpers ───────────────────────────────────────
  function _persist() {
    const day = todayKey()
    saveLocal({
      qazo: qazo.value,
      completedCounts: completedCounts.value,
      goals: goals.value,
      todayDay: day,
      todayCount: _savedDay.value === day ? _savedToday.value : EMPTY_COUNTS(),
    })
  }

  async function _syncToCloud() {
    if (!uid.value) return
    try {
      await saveTracker(uid.value, {
        qazo: qazo.value,
        completedCounts: completedCounts.value,
        goals: goals.value,
      })
    } catch (e) {
      console.error('Tracker sync error:', e)
    }
  }

  // ── Hydrate from Firebase on login ───────────────────────
  async function hydrateFromCloud(userUid) {
    uid.value = userUid
    isLoading.value = true
    try {
      const [data, hist] = await Promise.all([
        loadTracker(userUid),
        loadHistory(userUid),
      ])
      if (data) {
        if (data.qazo)            qazo.value            = data.qazo
        if (data.completedCounts) completedCounts.value = data.completedCounts
        if (data.goals)           goals.value           = data.goals
      }
      history.value = hist

      // Re-build todayCount from today's history
      const today = todayKey()
      const tc = EMPTY_COUNTS()
      for (const entry of hist) {
        const d = entry.trackedAt?.toDate ? entry.trackedAt.toDate() : new Date(entry.trackedAt)
        if (d.toISOString().split('T')[0] === today) {
          tc[entry.prayer] = (tc[entry.prayer] || 0) + 1
        }
      }
      _savedDay.value   = today
      _savedToday.value = tc
      _persist()
    } finally {
      isLoading.value = false
    }
  }

  // ── Actions ───────────────────────────────────────────────
  function completePrayer(prayer) {
    if ((qazo.value[prayer] || 0) <= 0) return

    // Update counts
    qazo.value[prayer]            = Math.max(0, (qazo.value[prayer] || 0) - 1)
    completedCounts.value[prayer] = (completedCounts.value[prayer] || 0) + 1

    // Update today count
    const day = todayKey()
    if (_savedDay.value !== day) {
      _savedDay.value   = day
      _savedToday.value = EMPTY_COUNTS()
    }
    _savedToday.value[prayer] = (_savedToday.value[prayer] || 0) + 1

    // Prepend to local history
    const entry = { id: Date.now().toString(), prayer, trackedAt: new Date() }
    history.value = [entry, ...history.value]

    _persist()

    // Cloud record in background
    if (uid.value) {
      recordCompletion(uid.value, prayer).then(id => {
        entry.id = id
      }).catch(e => console.error(e))
      _syncToCloud().catch(e => console.error(e))
    }
  }

  function addQazo(prayer, count) {
    qazo.value[prayer] = (qazo.value[prayer] || 0) + Math.max(1, count)
    _persist()
    _syncToCloud()
  }

  function setQazoCounts(counts) {
    PRAYERS.forEach(p => {
      qazo.value[p]            = counts[p] || 0
      completedCounts.value[p] = 0
    })
    _savedDay.value   = ''
    _savedToday.value = EMPTY_COUNTS()
    _persist()
    _syncToCloud()
  }

  function setGoal(prayer, value) {
    goals.value[prayer] = Math.max(0, value)
    _persist()
    _syncToCloud()
  }

  return {
    qazo,
    completedCounts,
    goals,
    history,
    todayCount,
    isLoading,
    hydrateFromCloud,
    completePrayer,
    addQazo,
    setQazoCounts,
    setGoal,
  }
})
