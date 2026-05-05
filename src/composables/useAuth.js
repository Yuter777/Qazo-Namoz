import { ref, readonly } from 'vue'
import { auth, googleProvider } from '../firebase/config'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

// Module-level singleton — shared across all components
const currentUser = ref(null)
const isInitialized = ref(false)

// Resolves once Firebase reports the initial auth state (after page load/refresh)
let _resolveReady
export const authReady = new Promise((resolve) => {
  _resolveReady = resolve
})

onAuthStateChanged(auth, (user) => {
  currentUser.value = user
  if (!isInitialized.value) {
    isInitialized.value = true
    _resolveReady()
  }
})

export function useAuth() {
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  }

  async function logout() {
    await signOut(auth)
  }

  return {
    currentUser: readonly(currentUser),
    isInitialized: readonly(isInitialized),
    loginWithGoogle,
    logout,
  }
}
