import { db } from '../firebase/config'
import {
  doc, getDoc, setDoc, addDoc, getDocs,
  collection, serverTimestamp, orderBy, query, limit,
} from 'firebase/firestore'
const trackerRef = (uid) => doc(db, 'users', uid, 'tracker', 'main')
const historyRef = (uid) => collection(db, 'users', uid, 'history')

// Load qazo tracker state
export const loadTracker = async (uid) => {
  const snap = await getDoc(trackerRef(uid))
  return snap.exists() ? snap.data() : null
}

// Save qazo tracker state
export const saveTracker = async (uid, payload) => {
  await setDoc(trackerRef(uid), { ...payload, updatedAt: serverTimestamp() }, { merge: true })
}

// Record a completed prayer
export const recordCompletion = async (uid, prayer) => {
  const ref = await addDoc(historyRef(uid), {
    prayer,
    trackedAt: serverTimestamp(),
  })
  return ref.id
}

// Load last N history entries
export const loadHistory = async (uid, maxItems = 100) => {
  const q = query(historyRef(uid), orderBy('trackedAt', 'desc'), limit(maxItems))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
