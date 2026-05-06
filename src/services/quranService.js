import { db } from '../firebase/config'
import {
  collection, doc, getDocs, setDoc, deleteDoc, getDoc, serverTimestamp,
} from 'firebase/firestore'

const progressCol = (uid) => collection(db, 'users', uid, 'quranProgress')
const progressDoc = (uid, surahId) => doc(db, 'users', uid, 'quranProgress', String(surahId))
const settingsDoc = (uid) => doc(db, 'users', uid, 'settings', 'quran')

export async function getUserProgress(uid) {
  const snap = await getDocs(progressCol(uid))
  const result = {}
  snap.docs.forEach(d => { result[d.id] = d.data() })
  return result
}

export async function setSurahStatus(uid, surahId, status) {
  await setDoc(progressDoc(uid, surahId), {
    surahId: Number(surahId),
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function removeSurahStatus(uid, surahId) {
  await deleteDoc(progressDoc(uid, surahId))
}

export async function getQuranSettings(uid) {
  const snap = await getDoc(settingsDoc(uid))
  return snap.exists() ? snap.data() : null
}

export async function saveQuranSettings(uid, settings) {
  await setDoc(settingsDoc(uid), settings, { merge: true })
}