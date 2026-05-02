import { db } from '../firebase/config';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

const getPlanDocRef = (uid) => doc(db, 'users', uid, 'plans', 'main');

export const loadPrayerPlan = async (uid) => {
  const snapshot = await getDoc(getPlanDocRef(uid));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data();
};

export const savePrayerPlan = async (uid, payload) => {
  await setDoc(
    getPlanDocRef(uid),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
