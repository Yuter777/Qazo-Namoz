import { ref, watch, onUnmounted } from "vue";

export function useSkeleton(
  isLoadingSource,
  { minMs = 300, maxMs = 5000 } = {}
) {
  const getVal =
    typeof isLoadingSource === "function"
      ? isLoadingSource
      : () => isLoadingSource.value;

  if (!getVal()) return ref(false);

  const show = ref(true);
  let minTimer = null;
  const maxTimer = setTimeout(() => {
    show.value = false;
  }, maxMs);

  const stop = watch(isLoadingSource, (loading) => {
    if (!loading) {
      clearTimeout(maxTimer);
      minTimer = setTimeout(() => {
        show.value = false;
        stop();
      }, minMs);
    }
  });

  onUnmounted(() => {
    clearTimeout(minTimer);
    clearTimeout(maxTimer);
  });

  return show;
}
