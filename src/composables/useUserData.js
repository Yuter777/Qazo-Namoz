import { ref } from 'vue'
import { db } from '../firebase/config'
import {
  doc, getDoc, setDoc, updateDoc, addDoc,
  collection, getDocs, orderBy, query,
  serverTimestamp, increment,
} from 'firebase/firestore'

const PRAYER_NAMES = ['bomdod', 'peshin', 'asr', 'shom', 'xufton', 'vitr']

const DEFAULT_DAILY_GOALS = Object.fromEntries(PRAYER_NAMES.map((p) => [p, 0]))

function todayDate() {
  // YYYY-MM-DD in local timezone
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function currentTime() {
  // HH:mm in local timezone
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}

export function useUserData() {
  const isLoading = ref(false)

  // ── User document ──────────────────────────────────────────────────────────

  /**
   * Creates a user document only if it doesn't already exist.
   * Returns null for new users, existing data for returning users.
   */
  async function createUserIfNotExists(user) {
    const userRef = doc(db, 'users', user.uid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        qazoCount: 0,
        dailyGoals: { ...DEFAULT_DAILY_GOALS },
        createdAt: serverTimestamp(),
      })
      return null
    }

    return snap.data()
  }

  /**
   * Fetches user document. Always returns a complete dailyGoals object
   * even if some fields are missing in Firestore.
   */
  async function getUserData(uid) {
    isLoading.value = true
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (!snap.exists()) return null

      const data = snap.data()
      return {
        ...data,
        dailyGoals: { ...DEFAULT_DAILY_GOALS, ...(data.dailyGoals ?? {}) },
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Updates dailyGoals. Only the provided fields are changed;
   * missing fields fall back to 0.
   */
  async function updateDailyGoals(uid, goals = {}) {
    const merged = { ...DEFAULT_DAILY_GOALS, ...goals }
    await updateDoc(doc(db, 'users', uid), { dailyGoals: merged })
  }

  // ── History subcollection ──────────────────────────────────────────────────

  /**
   * Appends one completed-prayer entry to history and atomically
   * increments the user's qazoCount.
   */
  async function addPrayerHistory(uid, prayerName) {
    if (!PRAYER_NAMES.includes(prayerName)) {
      throw new Error(`Unknown prayer name: "${prayerName}"`)
    }

    isLoading.value = true
    try {
      await addDoc(collection(db, 'users', uid, 'history'), {
        prayerName,
        date: todayDate(),
        time: currentTime(),
        status: 'done',
        createdAt: serverTimestamp(),
      })

      await updateDoc(doc(db, 'users', uid), {
        qazoCount: increment(1),
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Returns all history entries, newest first.
   * Returns an empty array when there are no entries.
   */
  async function getPrayerHistory(uid) {
    isLoading.value = true
    try {
      const q = query(
        collection(db, 'users', uid, 'history'),
        orderBy('createdAt', 'desc'),
      )
      const snap = await getDocs(q)
      if (snap.empty) return []
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    createUserIfNotExists,
    getUserData,
    updateDailyGoals,
    addPrayerHistory,
    getPrayerHistory,
  }
}
