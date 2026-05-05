import { ref } from 'vue'
import { db } from '../firebase/config'
import {
  doc, getDoc, updateDoc, addDoc, deleteDoc,
  collection, getDocs, query, where,
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
const isLoading    = ref(true)

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

      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      const cutoff = fmtDate(oneYearAgo)

      const [userSnap, todaySnap, recentSnap] = await Promise.all([
        getDoc(doc(db, 'users', uid)),

        getDocs(query(
          collection(db, 'users', uid, 'history'),
          where('date', '==', today),
        )),

        // All entries from the past year — single-field filter, no composite index
        getDocs(query(
          collection(db, 'users', uid, 'history'),
          where('date', '>=', cutoff),
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

      // Sort by createdAt ascending so entries[p].at(-1) is always the newest tap
      const todayDocs = []
      todaySnap.forEach((d) => todayDocs.push(d))
      todayDocs.sort((a, b) => (a.data().createdAt?.toMillis?.() ?? 0) - (b.data().createdAt?.toMillis?.() ?? 0))

      todayDocs.forEach((d) => {
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
    const now    = new Date()
    const today  = fmtDate(now)
    const time   = fmtTime(now)
    const isFirst = PRAYERS.every((p) => (todayCount.value[p] || 0) === 0)

    // Optimistic update — UI responds instantly, Firestore write happens behind
    const tempId = `opt-${Date.now()}`
    todayCount.value   = { ...todayCount.value,   [prayerName]: (todayCount.value[prayerName] || 0) + 1 }
    todayEntries.value = { ...todayEntries.value, [prayerName]: [...(todayEntries.value[prayerName] || []), tempId] }
    if (isFirst) { historyDays.add(today); computeStreak() }
    _maybeShowCongrats()

    try {
      const docRef = await addDoc(collection(db, 'users', uid, 'history'), {
        prayerName,
        prayer:    prayerName,
        date:      today,
        time,
        status:    'done',
        createdAt: serverTimestamp(),
        trackedAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'users', uid), { qazoCount: increment(1) })

      // Swap tempId for the real Firestore ID
      const cur = todayEntries.value[prayerName] || []
      const idx = cur.indexOf(tempId)
      if (idx !== -1) {
        const updated = [...cur]
        updated[idx] = docRef.id
        todayEntries.value = { ...todayEntries.value, [prayerName]: updated }
      }
      return true
    } catch (e) {
      // Rollback on network failure
      todayCount.value   = { ...todayCount.value,   [prayerName]: Math.max(0, (todayCount.value[prayerName] || 0) - 1) }
      todayEntries.value = { ...todayEntries.value, [prayerName]: (todayEntries.value[prayerName] || []).filter(id => id !== tempId) }
      console.error('[tracker] addPrayerDone failed:', e)
      return false
    }
  }

  /**
   * Undo the latest completion of a prayer today.
   * Deletes the last history entry and decrements qazoCount (never below 0).
   */
  async function undoPrayerDone(uid, prayerName) {
    const entries = todayEntries.value[prayerName] || []
    if (entries.length === 0) return false

    const lastId = entries[entries.length - 1]

    // Optimistic update — UI responds instantly
    todayEntries.value = { ...todayEntries.value, [prayerName]: entries.slice(0, -1) }
    todayCount.value   = { ...todayCount.value,   [prayerName]: Math.max(0, (todayCount.value[prayerName] || 0) - 1) }

    // Temp IDs were never confirmed in Firestore — nothing to delete
    if (lastId.startsWith('opt-')) return true

    try {
      await deleteDoc(doc(db, 'users', uid, 'history', lastId))
      await runTransaction(db, async (tx) => {
        const snap  = await tx.get(doc(db, 'users', uid))
        const count = snap.data()?.qazoCount ?? 0
        tx.update(doc(db, 'users', uid), { qazoCount: Math.max(0, count - 1) })
      })
      return true
    } catch (e) {
      // Rollback on network failure
      todayEntries.value = { ...todayEntries.value, [prayerName]: [...(todayEntries.value[prayerName] || []), lastId] }
      todayCount.value   = { ...todayCount.value,   [prayerName]: (todayCount.value[prayerName] || 0) + 1 }
      console.error('[tracker] undoPrayerDone failed:', e)
      return false
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
