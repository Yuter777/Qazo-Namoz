<template>
  <div class="sk-list">
    <div v-for="i in 8" :key="i" class="sk-row">
      <div class="sk sk-dot" />
      <div class="sk-lines">
        <div class="sk sk-name" />
        <div class="sk sk-time" />
      </div>
      <div class="sk sk-chip" />
    </div>
  </div>
</template>

<style scoped>
.sk-list { padding: 0 20px; }
.sk-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}
.sk-row:last-child { border-bottom: none; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk {
  background: var(--border);
  border-radius: 4px;
  animation: skPulse 1.4s ease-in-out infinite;
}
.sk-dot  { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.sk-name { height: 13px; width: 52%; }
.sk-time { height: 11px; width: 26%; }
.sk-chip { width: 52px; height: 22px; border-radius: 20px; flex-shrink: 0; }
@keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:.35} }

@media (min-width: 768px) {
  .sk-list { padding: 0; }
}
</style>
