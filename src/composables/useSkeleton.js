import { ref, watch, onUnmounted } from 'vue'

/**
 * Returns a reactive boolean that starts true and becomes false once
 * isLoadingSource goes false (with a minMs anti-flicker delay).
 * Auto-hides after maxMs even if loading never completes.
 *
 * Works with a ref OR a getter function.
 *
 * If loading is already done when called (e.g. navigating back to a loaded page),
 * returns ref(false) immediately — no skeleton shown at all.
 */
export function useSkeleton(isLoadingSource, { minMs = 300, maxMs = 2000 } = {}) {
  const getVal = typeof isLoadingSource === 'function'
    ? isLoadingSource
    : () => isLoadingSource.value

  // Already loaded — skip skeleton entirely
  if (!getVal()) return ref(false)

  const show = ref(true)
  let minTimer = null
  const maxTimer = setTimeout(() => { show.value = false }, maxMs)

  const stop = watch(isLoadingSource, (loading) => {
    if (!loading) {
      clearTimeout(maxTimer)
      minTimer = setTimeout(() => { show.value = false; stop() }, minMs)
    }
  })

  onUnmounted(() => {
    clearTimeout(minTimer)
    clearTimeout(maxTimer)
  })

  return show
}
