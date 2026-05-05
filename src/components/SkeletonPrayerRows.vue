<template>
  <div>
    <div v-for="i in 6" :key="i" class="sk-row">
      <div class="sk sk-icon" />
      <div class="sk-text">
        <div class="sk sk-name" />
        <div class="sk sk-sub" />
      </div>
      <div class="sk sk-btn" />
    </div>
  </div>
</template>

<style scoped>
.sk-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}
.sk-row:last-child { border-bottom: none; }
.sk-text { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.sk {
  background: var(--border);
  border-radius: 6px;
  animation: skPulse 1.4s ease-in-out infinite;
}
.sk-icon { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; }
.sk-name { height: 13px; width: 58%; }
.sk-sub  { height: 11px; width: 38%; }
.sk-btn  { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; }
@keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:.35} }
</style>
