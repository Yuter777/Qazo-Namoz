<template>
  <div class="sk-stat-grid">
    <div v-for="i in 3" :key="i" class="sk-stat-card">
      <div class="sk sk-num" />
      <div class="sk sk-label" />
    </div>
  </div>
</template>

<style scoped>
.sk-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  padding: 16px 20px 0;
}
.sk-stat-card {
  background: var(--bg2);
  border-radius: var(--radius-sm);
  padding: 14px 10px;
  border: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.sk {
  background: var(--border);
  border-radius: 5px;
  animation: skPulse 1.4s ease-in-out infinite;
}
.sk-num   { width: 44px; height: 28px; border-radius: 7px; }
.sk-label { width: 58px; height: 10px; }
@keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:.35} }

@media (min-width: 768px) {
  .sk-stat-grid { padding: 24px 32px 0; gap: 16px; }
  .sk-num   { height: 36px; width: 52px; }
  .sk-label { width: 68px; }
}
</style>
