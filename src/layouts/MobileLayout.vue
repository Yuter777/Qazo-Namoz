<template>
  <div class="mobile-layout">
    <main class="mobile-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.mobile-layout {
  min-height: 100vh;
  background: #f8fafc;
}

.mobile-content {
  min-height: 100vh;
}
</style>
