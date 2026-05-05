<template>
  <div>
    <div v-for="i in 6" :key="i" class="sk-row">
      <div class="sk sk-label" />
      <div class="sk sk-input" />
    </div>
  </div>
</template>

<style scoped>
.sk-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}
.sk-row:last-child { border-bottom: none; }
.sk {
  background: var(--border);
  border-radius: 6px;
  animation: skPulse 1.4s ease-in-out infinite;
}
.sk-label { height: 13px; width: 44%; }
.sk-input { width: 80px; height: 36px; border-radius: 8px; }
@keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:.35} }
</style>
