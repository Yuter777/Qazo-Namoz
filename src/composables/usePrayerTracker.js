import { ref } from 'vue'
import { db } from '../firebase/config'
import {
  doc, getDoc, updateDoc, addDoc, deleteDoc,
  collection, getDocs, query, where, orderBy, limit,
  serverTimestamp, increment, runTransaction,
} from 'firebase/firestore'
import { PRAYERS } from '../utils/prayerConstants'

const DEFAULT_GOALS = Object.fromEntries(PRAYERS.map((p) => [p, 0]))

// ── Module-level singletons (shared across all components) ────────────────────

// How many times each prayer was completed today
const todayCount = ref(Object.fromEntries(PRAYERS.map((p) => [p, 0])))

// Firestore doc IDs for today's entries per prayer (newest last) — used for undo
const todayEntries = ref(Object.fromEntries(PRAYERS.map((p) => [p, []])))

const dailyGoals   = ref({ ...DEFAULT_GOALS })
const showCongrats = ref(false)
const congratsDate = ref('')
const streak       = ref(0)
const isLoading    = ref(false)

// All days that have at least one completion — used for live streak updates
const historyDays = new Set()

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function fmtTime(d = new Date()) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function computeStreak() {
  let s = 0
  const d = new Date()
  // Walk backwards from today while that date has activity
  while (historyDays.has(fmtDate(d))) {
    s++
    d.setDate(d.getDate() - 1)
  }
  streak.value = s
}

// ── Composable ────────────────────────────────────────────────────────────────
export function usePrayerTracker() {

  /**
   * Run once per session (called from useAuthStore.onUserLoggedIn).
   * Loads today's counts + daily goals + streak from Firestore.
   */
  async function initTracker(uid) {
    isLoading.value = true
    try {
      const today = fmtDate()

      const [userSnap, todaySnap, recentSnap] = await Promise.all([
        getDoc(doc(db, 'users', uid)),

        // Today's completions — no composite index needed (single-field filter)
        getDocs(query(
          collection(db, 'users', uid, 'history'),
          where('date', '==', today),
        )),

        // Recent history for streak (covers 200 completions ≈ 30+ days at 6/day)
        getDocs(query(
          collection(db, 'users', uid, 'history'),
          orderBy('createdAt', 'desc'),
          limit(200),
        )),
      ])

      // ── Daily goals ──────────────────────────────────────────────────────
      if (userSnap.exists()) {
        const data = userSnap.data()
        dailyGoals.value = { ...DEFAULT_GOALS, ...(data.dailyGoals ?? {}) }
      }

      // ── Rebuild today's count + entry IDs ────────────────────────────────
      const count   = Object.fromEntries(PRAYERS.map((p) => [p, 0]))
      const entries = Object.fromEntries(PRAYERS.map((p) => [p, []]))
      todaySnap.forEach((d) => {
        const { prayerName } = d.data()
        if (PRAYERS.includes(prayerName)) {
          count[prayerName]++
          entries[prayerName].push(d.id)
        }
      })
      todayCount.value   = count
      todayEntries.value = entries

      // ── Streak ───────────────────────────────────────────────────────────
      historyDays.clear()
      recentSnap.forEach((d) => {
        const date = d.data().date
        if (date) historyDays.add(date)
      })
      computeStreak()

    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark a prayer as done (no daily limit).
   * Writes one history entry and increments qazoCount on the user doc.
   */
  async function addPrayerDone(uid, prayerName) {
    isLoading.value = true
    try {
      const now    = new Date()
      const today  = fmtDate(now)
      const time   = fmtTime(now)
      const isFirst = PRAYERS.every((p) => (todayCount.value[p] || 0) === 0)

      const docRef = await addDoc(collection(db, 'users', uid, 'history'), {
        prayerName,
        date:      today,
        time,
        status:    'done',
        createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'users', uid), { qazoCount: increment(1) })

      // ── Reactive update ──────────────────────────────────────────────────
      todayCount.value   = { ...todayCount.value,   [prayerName]: (todayCount.value[prayerName] || 0) + 1 }
      todayEntries.value = { ...todayEntries.value, [prayerName]: [...(todayEntries.value[prayerName] || []), docRef.id] }

      // First prayer today → add today to historyDays and recompute streak
      if (isFirst) {
        historyDays.add(today)
        computeStreak()
      }

      _maybeShowCongrats()
      return true
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Undo the latest completion of a prayer today.
   * Deletes the last history entry and decrements qazoCount (never below 0).
   */
  async function undoPrayerDone(uid, prayerName) {
    const entries = todayEntries.value[prayerName] || []
    if (entries.length === 0) return false

    isLoading.value = true
    try {
      const lastId = entries[entries.length - 1]

      await deleteDoc(doc(db, 'users', uid, 'history', lastId))

      // Atomic decrement, never below 0
      await runTransaction(db, async (tx) => {
        const snap  = await tx.get(doc(db, 'users', uid))
        const count = snap.data()?.qazoCount ?? 0
        tx.update(doc(db, 'users', uid), { qazoCount: Math.max(0, count - 1) })
      })

      // ── Reactive update ──────────────────────────────────────────────────
      const newEntries = entries.slice(0, -1)
      todayEntries.value = { ...todayEntries.value, [prayerName]: newEntries }
      todayCount.value   = { ...todayCount.value,   [prayerName]: Math.max(0, (todayCount.value[prayerName] || 0) - 1) }

      return true
    } finally {
      isLoading.value = false
    }
  }

  // ── Congrats ─────────────────────────────────────────────────────────────
  function checkTodayCompletion() {
    // "Goal reached" = every prayer that has a goal > 0 has count >= goal
    const goaled = PRAYERS.filter((p) => (dailyGoals.value[p] ?? 0) > 0)
    if (goaled.length === 0) return false
    return goaled.every((p) => (todayCount.value[p] || 0) >= (dailyGoals.value[p] || 0))
  }

  function _maybeShowCongrats() {
    const today = fmtDate()
    if (congratsDate.value === today) return   // already shown today
    if (checkTodayCompletion()) {
      congratsDate.value = today
      showCongrats.value = true
    }
  }

  function checkAndTriggerCongratulations() {
    _maybeShowCongrats()
  }

  function getTodayStatus() {
    return todayCount.value
  }

  // ── Daily goals ───────────────────────────────────────────────────────────
  async function updateDailyGoals(uid, goals) {
    const merged = { ...DEFAULT_GOALS, ...goals }
    await updateDoc(doc(db, 'users', uid), { dailyGoals: merged })
    dailyGoals.value = merged
  }

  return {
    // State
    todayCount,
    todayEntries,
    dailyGoals,
    showCongrats,
    streak,
    isLoading,
    // Functions
    initTracker,
    addPrayerDone,
    undoPrayerDone,
    getTodayStatus,
    checkTodayCompletion,
    checkAndTriggerCongratulations,
    updateDailyGoals,
  }
}
