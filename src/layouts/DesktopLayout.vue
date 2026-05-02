<template>
  <div class="desktop-layout">
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.desktop-layout {
  min-height: 100vh;
  margin: 0 auto;
  max-width: 1280;
}

.content {
  min-height: 100vh;
}
</style>
