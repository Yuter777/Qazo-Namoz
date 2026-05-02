<template>
  <div class="container info-page" :class="{ dark: isDark }">
    <main>
      <section class="section card">
        <h1>{{ t('home.aboutTitle') }}</h1>
        <p>{{ t('home.aboutText') }}</p>
      </section>

      <section class="section card">
        <h2>{{ t('home.videoTitle') }}</h2>
        <div class="video-wrap">
          <iframe
            src="https://www.youtube.com/embed/C34XHioWP7Q?si=ZTkfqz4bLA2gAA2a"
            title="Qazo namozi haqida video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isDark = ref(localStorage.getItem('qazo-theme') === 'dark');
</script>

<style scoped>
.info-page { min-height: 100vh; background: #f7f7f5; color: #18181b; }
.dark.info-page { background: #121214; color: #f5f5f5; }
.section { width: min(980px, 92vw); margin: 20px auto; }
.card { border: 1px solid #e4e4e7; border-radius: 16px; padding: 24px; background: #fff; }
.dark .card { background: #18181b; border-color: #313138; }
.video-wrap { width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; }
.video-wrap iframe { width: 100%; height: 100%; border: 0; }
</style>
