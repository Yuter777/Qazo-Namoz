<template>
  <div
    class="container"
    :class="[
      'home-page',
      isDark ? 'dark' : ''
    ]"
  >
    <header
      class="navbar flex items-center justify-between gap-3.5 sticky top-0 z-10 border-b border-zinc-200 bg-white/90 dark:bg-[#121214]/90 dark:border-[#2f2f35] backdrop-blur-md px-5 py-3"
    >
      <div class="brand font-bold">QazoNamoz</div>
      <nav class="nav-links desktop-nav flex gap-3.5">
        <router-link to="/info">{{ t('home.aboutNav') }}</router-link>
        <router-link to="/info">{{ t('home.videoNav') }}</router-link>
        <router-link to="/start">{{ t('home.startNav') }}</router-link>
      </nav>
      <div class="nav-actions desktop-only flex gap-2 items-center">
        <router-link
          v-if="!currentUser"
          class="icon-btn nav-link-btn inline-flex items-center border border-zinc-300 rounded-lg px-4 py-2 bg-white dark:bg-[#202026] dark:border-[#3b3b45] dark:text-zinc-100 text-inherit text-sm"
          to="/login"
        >
          {{ t('auth.signIn') }}
        </router-link>
        <router-link
          v-else
          class="icon-btn nav-link-btn inline-flex items-center border border-zinc-300 rounded-lg px-4 py-2 bg-white dark:bg-[#202026] dark:border-[#3b3b45] dark:text-zinc-100 text-inherit text-sm"
          to="/profile"
        >
          {{ t('navigation.profile') }}
        </router-link>
        <button
          v-if="currentUser"
          class="icon-btn border border-zinc-300 rounded-lg px-4 py-2 bg-white dark:bg-[#202026] dark:border-[#3b3b45] dark:text-zinc-100 text-inherit text-sm"
          @click="handleLogout"
        >
          {{ t('auth.logout') }}
        </button>
        <select
          v-model="selectedLocale"
          class="locale-select border border-zinc-300 rounded-lg px-3 py-2 bg-white dark:bg-[#202026] dark:border-[#3b3b45] dark:text-zinc-100 text-inherit"
          @change="changeLocale"
        >
          <option value="uz">UZ</option>
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>
        <button
          class="icon-btn border border-zinc-300 rounded-lg px-4 py-2 bg-white dark:bg-[#202026] dark:border-[#3b3b45] dark:text-zinc-100 text-inherit text-sm"
          @click="uiStore.toggleTheme"
        >
          {{ isDark ? t('ui.lightMode') : t('ui.darkMode') }}
        </button>
      </div>
    </header>

    <main>
      <section class="hero section w-full max-w-[980px] mx-auto py-10 pt-10 pb-5">
        <p class="eyebrow m-0 text-xs uppercase opacity-70 tracking-widest">{{ t('home.eyebrow') }}</p>
        <h1 class="mt-2 mb-4 text-[clamp(30px,5vw,52px)] leading-[1.08]">{{ t('home.title') }}</h1>
        <p class="hero-text max-w-3xl opacity-85">{{ t('home.subtitle') }}</p>
        <div class="hero-actions flex gap-3 mt-5">
          <router-link
            to="/start"
            class="primary-btn border border-zinc-900 rounded-lg px-4 py-2 bg-zinc-900 text-white text-sm"
            >{{ t('home.startNav') }}</router-link
          >
          <router-link
            to="/info"
            class="secondary-btn border border-zinc-300 rounded-lg px-4 py-2 bg-white text-inherit text-sm dark:bg-[#202026] dark:border-[#3b3b45] dark:text-zinc-100"
            >{{ t('home.info') }}</router-link
          >
        </div>
      </section>

      <section id="about" class="section card w-full max-w-[980px] mx-auto mt-3 border border-zinc-200 rounded-2xl bg-white dark:bg-zinc-900 dark:border-[#313138] p-6">
        <h2>{{ t('home.aboutTitle') }}</h2>
        <p>{{ t('home.aboutText') }}</p>
      </section>

      <section id="tracker" class="section card w-full max-w-[980px] mx-auto mt-3 border border-zinc-200 rounded-2xl bg-white dark:bg-zinc-900 dark:border-[#313138] p-6">
        <h2>{{ t('home.trackerTitle') }}</h2>
        <p class="muted opacity-75">{{ t('home.trackerHint') }}</p>
        <div class="form-grid grid grid-cols-2 gap-3 my-3.5 max-sm:grid-cols-1">
          <label class="grid gap-1.5 text-sm">
            {{ t('home.startDate') }}
            <input
              v-model="localStart"
              type="date"
              class="border border-zinc-300 rounded-lg px-3 py-2 bg-white dark:bg-[#1f1f22] dark:border-[#3f3f46] text-inherit text-sm"
            />
          </label>
          <label class="grid gap-1.5 text-sm">
            {{ t('home.endDate') }}
            <input
              v-model="localEnd"
              type="date"
              class="border border-zinc-300 rounded-lg px-3 py-2 bg-white dark:bg-[#1f1f22] dark:border-[#3f3f46] text-inherit text-sm"
            />
          </label>
        </div>
        <button
          class="primary-btn border border-zinc-900 rounded-lg px-4 py-2 bg-zinc-900 text-white text-sm dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
          @click="onBuild"
        >
          {{ t('home.build') }}
        </button>

        <p
          v-if="prayerStore.planErrorKey"
          class="error text-red-600 mt-2"
        >
          {{ t(prayerStore.planErrorKey) }}
        </p>

        <div v-if="prayerStore.planDates.length" class="plan-list mt-4">
          <div class="stats flex gap-4 flex-wrap">
            <p class="muted opacity-75">
              {{ t('home.totalDays') }}: <strong>{{ prayerStore.totalCount }}</strong>
            </p>
            <p class="muted opacity-75">
              {{ t('home.completed') }}: <strong>{{ prayerStore.completedCount }}</strong>
            </p>
            <p class="muted opacity-75">
              {{ t('home.left') }}: <strong>{{ prayerStore.remainingCount }}</strong>
            </p>
          </div>
          <ul class="list-none p-0 m-0 mt-2.5 max-h-72 overflow-auto">
            <li
              v-for="item in prayerStore.planDates"
              :key="item.date"
              class="mt-2 first:mt-0"
            >
              <label class="flex items-center gap-2">
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

      <section id="video" class="section card w-full max-w-[980px] mx-auto mt-3 border border-zinc-200 rounded-2xl bg-white dark:bg-zinc-900 dark:border-[#313138] p-6">
        <h2>{{ t('home.videoTitle') }}</h2>
        <div class="video-wrap relative w-full aspect-video overflow-hidden rounded-xl">
          <iframe
            src="https://www.youtube.com/embed/C34XHioWP7Q?si=ZTkfqz4bLA2gAA2a"
            title="Qazo namozi haqida video"
            loading="lazy"
            class="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          />
        </div>
      </section>
    </main>

    <footer class="footer w-full max-w-[980px] mx-auto mt-7 py-5 pb-9 grid gap-1.5 text-sm opacity-80">
      <p>{{ t('home.footerText') }}</p>
      <p>{{ t('home.author') }}</p>
    </footer>

    <nav
      class="mobile-bottom-nav hidden max-sm:grid fixed left-2 right-2 bottom-2 h-14 bg-white border border-zinc-200 rounded-2xl grid-cols-4 z-30 shadow-[0_4px_16px_rgba(15,23,42,0.1)] dark:bg-[#202026] dark:border-[#3b3b45] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
    >
      <router-link to="/" class="bottom-item text-inherit no-underline grid place-items-center">
        <span class="item-wrap inline-flex items-center gap-1.5 text-xs font-medium">
          <FontAwesomeIcon :icon="faHouse" />
          <span>{{ t('navigation.home') }}</span>
        </span>
      </router-link>
      <router-link to="/start" class="bottom-item text-inherit no-underline grid place-items-center">
        <span class="item-wrap inline-flex items-center gap-1.5 text-xs font-medium">
          <FontAwesomeIcon :icon="faPlay" />
          <span>{{ t('navigation.start') }}</span>
        </span>
      </router-link>
      <router-link to="/info" class="bottom-item text-inherit no-underline grid place-items-center">
        <span class="item-wrap inline-flex items-center gap-1.5 text-xs font-medium">
          <FontAwesomeIcon :icon="faCircleInfo" />
          <span>{{ t('navigation.info') }}</span>
        </span>
      </router-link>
      <router-link
        v-if="!currentUser"
        to="/login"
        class="bottom-item text-inherit no-underline grid place-items-center"
      >
        <span class="item-wrap inline-flex items-center gap-1.5 text-xs font-medium">
          <FontAwesomeIcon :icon="faRightToBracket" />
          <span>{{ t('navigation.signIn') }}</span>
        </span>
      </router-link>
      <router-link
        v-else
        to="/profile"
        class="bottom-item text-inherit no-underline grid place-items-center"
      >
        <span class="item-wrap inline-flex items-center gap-1.5 text-xs font-medium">
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
