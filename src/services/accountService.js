import { db, auth } from '../firebase/config'
import { doc, collection, getDocs, deleteDoc, writeBatch } from 'firebase/firestore'
import { deleteUser } from 'firebase/auth'

async function deleteSubcollection(uid, name) {
  const snap = await getDocs(collection(db, 'users', uid, name))
  if (snap.empty) return
  // Firestore batches are capped at 500 ops; use 400 to stay safe
  const docs = snap.docs
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db)
    docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
}

/**
 * Deletes all Firestore data for the user, then deletes the Firebase Auth account.
 * Throws auth/requires-recent-login if the session is too old.
 */
export async function deleteAccountData(uid) {
  await deleteSubcollection(uid, 'history')
  await deleteSubcollection(uid, 'tracker')
  await deleteDoc(doc(db, 'users', uid))

  if (auth.currentUser) {
    await deleteUser(auth.currentUser)
  }
}
