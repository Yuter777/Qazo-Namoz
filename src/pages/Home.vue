<template>
  <div class="container home-page" :class="{ dark: isDark }">
    <header class="navbar">
      <div class="brand">QazoNamoz</div>
      <nav class="nav-links desktop-nav">
        <router-link to="/info">{{ t('home.aboutNav') }}</router-link>
        <router-link to="/info">{{ t('home.videoNav') }}</router-link>
        <router-link to="/start">{{ t('home.startNav') }}</router-link>
      </nav>
      <div class="nav-actions desktop-only">
        <router-link v-if="!currentUser" class="icon-btn nav-link-btn" to="/login">
          {{ t('auth.signIn') }}
        </router-link>
        <router-link v-else class="icon-btn nav-link-btn" to="/profile">
          {{ t('navigation.profile') }}
        </router-link>
        <button v-if="currentUser" class="icon-btn" @click="handleLogout">
          {{ t('auth.logout') }}
        </button>
        <select v-model="selectedLocale" class="locale-select" @change="changeLocale">
          <option value="uz">UZ</option>
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>
        <button class="icon-btn" @click="uiStore.toggleTheme">
          {{ isDark ? t('ui.lightMode') : t('ui.darkMode') }}
        </button>
      </div>
    </header>

    <main>
      <section class="hero section">
        <p class="eyebrow">{{ t('home.eyebrow') }}</p>
        <h1>{{ t('home.title') }}</h1>
        <p class="hero-text">{{ t('home.subtitle') }}</p>
        <div class="hero-actions">
          <router-link to="/start" class="primary-btn">{{ t('home.startNav') }}</router-link>
          <router-link to="/info" class="secondary-btn">{{ t('home.info') }}</router-link>
        </div>
      </section>

      <section id="about" class="section card">
        <h2>{{ t('home.aboutTitle') }}</h2>
        <p>{{ t('home.aboutText') }}</p>
      </section>

      <section id="tracker" class="section card">
        <h2>{{ t('home.trackerTitle') }}</h2>
        <p class="muted">{{ t('home.trackerHint') }}</p>
        <div class="form-grid">
          <label>
            {{ t('home.startDate') }}
            <input v-model="localStart" type="date" />
          </label>
          <label>
            {{ t('home.endDate') }}
            <input v-model="localEnd" type="date" />
          </label>
        </div>
        <button class="primary-btn" @click="onBuild">
          {{ t('home.build') }}
        </button>

        <p v-if="prayerStore.planErrorKey" class="error">{{ t(prayerStore.planErrorKey) }}</p>

        <div v-if="prayerStore.planDates.length" class="plan-list">
          <div class="stats">
            <p class="muted">
              {{ t('home.totalDays') }}: <strong>{{ prayerStore.totalCount }}</strong>
            </p>
            <p class="muted">
              {{ t('home.completed') }}: <strong>{{ prayerStore.completedCount }}</strong>
            </p>
            <p class="muted">
              {{ t('home.left') }}: <strong>{{ prayerStore.remainingCount }}</strong>
            </p>
          </div>
          <ul>
            <li v-for="item in prayerStore.planDates" :key="item.date">
              <label>
                <input
                  type="checkbox"
                  :checked="prayerStore.completedDates.has(item.date)"
                  @change="prayerStore.toggleCompleted(item.date)"
                />
                <span>{{ item.label }}</span>
              </label>
            </li>
          </ul>
        </div>
      </section>

      <section id="video" class="section card">
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

    <footer class="footer">
      <p>{{ t('home.footerText') }}</p>
      <p>{{ t('home.author') }}</p>
    </footer>

    <nav class="mobile-bottom-nav">
      <router-link to="/" class="bottom-item">
        <span class="item-wrap">
          <FontAwesomeIcon :icon="faHouse" />
          <span>{{ t('navigation.home') }}</span>
        </span>
      </router-link>
      <router-link to="/start" class="bottom-item">
        <span class="item-wrap">
          <FontAwesomeIcon :icon="faPlay" />
          <span>{{ t('navigation.start') }}</span>
        </span>
      </router-link>
      <router-link to="/info" class="bottom-item">
        <span class="item-wrap">
          <FontAwesomeIcon :icon="faCircleInfo" />
          <span>{{ t('navigation.info') }}</span>
        </span>
      </router-link>
      <router-link v-if="!currentUser" to="/login" class="bottom-item">
        <span class="item-wrap">
          <FontAwesomeIcon :icon="faRightToBracket" />
          <span>{{ t('navigation.signIn') }}</span>
        </span>
      </router-link>
      <router-link v-else to="/profile" class="bottom-item">
        <span class="item-wrap">
          <FontAwesomeIcon :icon="faUser" />
          <span>{{ t('navigation.profile') }}</span>
        </span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faCircleInfo,
  faHouse,
  faPlay,
  faRightToBracket,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { logout } from '../services/authService';
import { useUiStore } from '../stores/useUiStore.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import { usePrayerStore } from '../stores/usePrayerStore.js';

const { t, locale } = useI18n();
const uiStore = useUiStore();
const authStore = useAuthStore();
const prayerStore = usePrayerStore();

const isDark = computed(() => uiStore.isDark);
const currentUser = computed(() => authStore.currentUser);

const selectedLocale = ref(localStorage.getItem('qazo-locale') || locale.value || 'uz');

// Local form state — synced from store when cloud hydration updates dates
const localStart = ref(prayerStore.startDate);
const localEnd = ref(prayerStore.endDate);

watch(() => prayerStore.startDate, (v) => { localStart.value = v; });
watch(() => prayerStore.endDate, (v) => { localEnd.value = v; });

const changeLocale = () => {
  locale.value = selectedLocale.value;
  localStorage.setItem('qazo-locale', selectedLocale.value);
};

const onBuild = () => {
  prayerStore.buildPlan(localStart.value, localEnd.value, locale.value);
};

const handleLogout = async () => {
  await logout();
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f7f7f5;
  color: #18181b;
  margin: 0 auto;
}

.home-page.dark {
  background: #121214;
  color: #f5f5f5;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #e4e4e7;
  background: rgba(247, 247, 245, 0.9);
  backdrop-filter: blur(8px);
}

.dark .navbar {
  background: rgba(18, 18, 20, 0.9);
  border-color: #2f2f35;
}

.brand {
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 14px;
}

.nav-links a {
  color: inherit;
  text-decoration: none;
  opacity: 0.85;
}

.mobile-bottom-nav {
  display: none;
}

.section {
  width: min(980px, 92vw);
  margin: 0 auto;
  padding: 40px 0 20px;
}

.hero h1 {
  margin: 8px 0 16px;
  font-size: clamp(30px, 5vw, 52px);
  line-height: 1.08;
}

.hero-text {
  max-width: 760px;
  opacity: 0.85;
}

.eyebrow {
  margin: 0;
  font-size: 14px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.nav-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.locale-select {
  border: 1px solid #d4d4d8;
  border-radius: 10px;
  padding: 8px 10px;
  background: #fff;
  color: inherit;
}

.dark .locale-select {
  background: #202026;
  border-color: #3b3b45;
  color: #f5f5f5;
}

.card {
  border: 1px solid #e4e4e7;
  border-radius: 16px;
  padding: 24px;
  background: #ffffff;
  margin-top: 14px;
}

.dark .card {
  background: #18181b;
  border-color: #313138;
}

.primary-btn,
.secondary-btn,
.icon-btn {
  border: 1px solid #d4d4d8;
  border-radius: 10px;
  padding: 10px 16px;
  text-decoration: none;
  color: inherit;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.nav-link-btn {
  display: inline-flex;
  align-items: center;
}

.primary-btn {
  background: #18181b;
  color: #fff;
  border-color: #18181b;
}

.dark .primary-btn {
  background: #f4f4f5;
  color: #111;
  border-color: #f4f4f5;
}

.dark .secondary-btn,
.dark .icon-btn {
  background: #202026;
  border-color: #3b3b45;
  color: #f5f5f5;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 14px 0;
}

label {
  display: grid;
  gap: 6px;
  font-size: 14px;
}

input[type='date'] {
  border: 1px solid #d4d4d8;
  border-radius: 10px;
  padding: 10px;
  background: #fff;
  color: inherit;
  font-size: 14px;
}

.dark input[type='date'] {
  background: #1f1f22;
  color: #fff;
  border-color: #3f3f46;
}

.plan-list ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  max-height: 280px;
  overflow: auto;
}

.plan-list li + li {
  margin-top: 8px;
}

.stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.muted {
  opacity: 0.75;
}

.error {
  color: #dc2626;
  margin-top: 8px;
}

.video-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
}

.video-wrap iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.footer {
  width: min(980px, 92vw);
  margin: 26px auto 0;
  padding: 20px 0 36px;
  display: grid;
  gap: 6px;
  font-size: 14px;
  opacity: 0.8;
}

@media (max-width: 700px) {
  .desktop-nav {
    display: none;
  }

  .navbar {
    padding: 12px 14px;
  }

  .section {
    padding-top: 26px;
  }

  .card {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    flex-direction: column;
  }

  .nav-actions {
    gap: 6px;
  }

  .nav-actions .icon-btn,
  .nav-actions .locale-select {
    padding: 8px 10px;
    font-size: 13px;
  }

  .home-page {
    padding-bottom: 78px;
  }

  .mobile-bottom-nav {
    position: fixed;
    left: 8px;
    right: 8px;
    bottom: 8px;
    height: 56px;
    background: #fff;
    border: 1px solid #e4e4e7;
    border-radius: 14px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    z-index: 30;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.1);
  }

  .bottom-item {
    color: inherit;
    text-decoration: none;
    display: grid;
    place-items: center;
  }

  .item-wrap {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
  }

  .bottom-item.router-link-active {
    color: #2563eb;
  }

  .dark .mobile-bottom-nav {
    background: #202026;
    border-color: #3b3b45;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .dark .bottom-item.router-link-active {
    color: #93c5fd;
  }
}
</style>
