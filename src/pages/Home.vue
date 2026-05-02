<template>
  <div class="container home-page" :class="{ dark: isDark }">
    <header class="navbar">
      <div class="brand">QazoNamoz</div>
      <nav class="nav-links desktop-nav">
        <router-link to="/info">{{ t("home.aboutNav") }}</router-link>
        <router-link to="/info">{{ t("home.videoNav") }}</router-link>
        <router-link to="/start">{{ t("home.startNav") }}</router-link>
      </nav>
      <div class="nav-actions desktop-only">
        <router-link
          v-if="!currentUser"
          class="icon-btn nav-link-btn"
          to="/login"
          >Sign In</router-link
        >
        <router-link v-else class="icon-btn nav-link-btn" to="/profile"
          >Profile</router-link
        >
        <button v-if="currentUser" class="icon-btn" @click="handleLogout">
          Logout
        </button>
        <select
          v-model="selectedLocale"
          class="locale-select"
          @change="changeLocale"
        >
          <option value="uz">UZ</option>
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>
        <button class="icon-btn" @click="toggleTheme">
          {{ isDark ? "Light" : "Dark" }}
        </button>
      </div>
    </header>
    <main>
      <section class="hero section">
        <p class="eyebrow">{{ t("home.eyebrow") }}</p>
        <h1>{{ t("home.title") }}</h1>
        <p class="hero-text">{{ t("home.subtitle") }}</p>
        <div class="hero-actions">
          <router-link to="/start" class="primary-btn">{{
            t("home.startNav")
          }}</router-link>
          <router-link to="/info" class="secondary-btn">{{
            t("home.info")
          }}</router-link>
        </div>
      </section>

      <section id="about" class="section card">
        <h2>{{ t("home.aboutTitle") }}</h2>
        <p>{{ t("home.aboutText") }}</p>
      </section>

      <section id="tracker" class="section card">
        <h2>{{ t("home.trackerTitle") }}</h2>
        <p class="muted">{{ t("home.trackerHint") }}</p>
        <div class="form-grid">
          <label>
            {{ t("home.startDate") }}
            <input v-model="startDate" type="date" />
          </label>
          <label>
            {{ t("home.endDate") }}
            <input v-model="endDate" type="date" />
          </label>
        </div>
        <button class="primary-btn" @click="buildPlan">
          {{ t("home.build") }}
        </button>

        <p v-if="planError" class="error">{{ planError }}</p>

        <div v-if="planDates.length" class="plan-list">
          <div class="stats">
            <p class="muted">
              {{ t("home.totalDays") }}: <strong>{{ planDates.length }}</strong>
            </p>
            <p class="muted">
              {{ t("home.completed") }}: <strong>{{ completedCount }}</strong>
            </p>
            <p class="muted">
              {{ t("home.left") }}: <strong>{{ remainingCount }}</strong>
            </p>
          </div>
          <ul>
            <li v-for="item in planDates" :key="item.date">
              <label>
                <input
                  type="checkbox"
                  :checked="completedDates.has(item.date)"
                  @change="toggleCompleted(item.date)"
                />
                <span>{{ item.label }}</span>
              </label>
            </li>
          </ul>
        </div>
      </section>

      <section id="video" class="section card">
        <h2>{{ t("home.videoTitle") }}</h2>
        <div class="video-wrap">
          <iframe
            src="https://www.youtube.com/embed/C34XHioWP7Q?si=ZTkfqz4bLA2gAA2a"
            title="Qazo namozi haqida video"
            loading="lazy"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
              web-share;
            "
            allowfullscreen
          />
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>{{ t("home.footerText") }}</p>
      <p>{{ t("home.author") }}</p>
    </footer>
    <nav class="mobile-bottom-nav">
      <router-link to="/" class="bottom-item">
        <span class="item-wrap"
          ><FontAwesomeIcon :icon="faHouse" /><span>Home</span></span
        >
      </router-link>
      <router-link to="/start" class="bottom-item">
        <span class="item-wrap"
          ><FontAwesomeIcon :icon="faPlay" /><span>Start</span></span
        >
      </router-link>
      <router-link to="/info" class="bottom-item">
        <span class="item-wrap"
          ><FontAwesomeIcon :icon="faCircleInfo" /><span>Info</span></span
        >
      </router-link>
      <router-link v-if="!currentUser" to="/login" class="bottom-item">
        <span class="item-wrap"
          ><FontAwesomeIcon :icon="faRightToBracket" /><span
            >Sign In</span
          ></span
        >
      </router-link>
      <router-link v-else to="/profile" class="bottom-item">
        <span class="item-wrap"
          ><FontAwesomeIcon :icon="faUser" /><span>Profile</span></span
        >
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faCircleInfo,
  faHouse,
  faPlay,
  faRightToBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { logout, onAuthChange } from "../services/authService";
import { loadPrayerPlan, savePrayerPlan } from "../services/prayerPlanService";

const { t, locale } = useI18n();

const isDark = ref(localStorage.getItem("qazo-theme") === "dark");
const selectedLocale = ref(
  localStorage.getItem("qazo-locale") || locale.value || "uz",
);
const startDate = ref(localStorage.getItem("qazo-start-date") || "");
const endDate = ref(localStorage.getItem("qazo-end-date") || "");
const planError = ref("");
const planDates = ref(
  JSON.parse(localStorage.getItem("qazo-plan-dates") || "[]"),
);
const completedDates = ref(
  new Set(JSON.parse(localStorage.getItem("qazo-completed-dates") || "[]")),
);
const currentUser = ref(null);
const isHydrating = ref(false);

const completedCount = computed(() => completedDates.value.size);
const remainingCount = computed(() =>
  Math.max(planDates.value.length - completedDates.value.size, 0),
);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  const nextTheme = isDark.value ? "dark" : "light";
  localStorage.setItem("qazo-theme", nextTheme);
  window.dispatchEvent(
    new CustomEvent("qazo-theme-change", { detail: nextTheme }),
  );
};

const changeLocale = () => {
  locale.value = selectedLocale.value;
  localStorage.setItem("qazo-locale", selectedLocale.value);
};

const hydrateFromCloud = async (uid) => {
  isHydrating.value = true;
  try {
    const data = await loadPrayerPlan(uid);
    if (!data) return;

    startDate.value = data.startDate || "";
    endDate.value = data.endDate || "";
    planDates.value = data.planDates || [];
    completedDates.value = new Set(data.completedDates || []);
  } finally {
    isHydrating.value = false;
  }
};

const persistPlan = async () => {
  if (isHydrating.value) return;
  if (!currentUser.value?.uid) return;
  try {
    await savePrayerPlan(currentUser.value.uid, {
      startDate: startDate.value,
      endDate: endDate.value,
      planDates: planDates.value,
      completedDates: [...completedDates.value],
    });
  } catch (error) {
    console.error("Error saving prayer plan:", error);
  }
};

const buildPlan = () => {
  planError.value = "";
  planDates.value = [];
  completedDates.value = new Set();

  if (!startDate.value || !endDate.value) {
    planError.value = t("home.missingDates");
    return;
  }

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    planError.value = t("home.invalidDate");
    return;
  }

  if (start > end) {
    planError.value = t("home.badRange");
    return;
  }

  const entries = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const iso = cursor.toISOString().split("T")[0];
    entries.push({
      date: iso,
      label: cursor.toLocaleDateString("uz-UZ", {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  planDates.value = entries;
  persistPlan();
};

const toggleCompleted = (date) => {
  const updated = new Set(completedDates.value);
  if (updated.has(date)) {
    updated.delete(date);
  } else {
    updated.add(date);
  }
  completedDates.value = updated;
  persistPlan();
};

const handleLogout = async () => {
  await logout();
};

onAuthChange(async (user) => {
  currentUser.value = user;
  if (user?.uid) {
    await hydrateFromCloud(user.uid);
    return;
  }
});

watch(startDate, (value) => {
  localStorage.setItem("qazo-start-date", value || "");
  persistPlan();
});

watch(endDate, (value) => {
  localStorage.setItem("qazo-end-date", value || "");
  persistPlan();
});

watch(
  planDates,
  (value) => {
    localStorage.setItem("qazo-plan-dates", JSON.stringify(value));
    persistPlan();
  },
  { deep: true },
);

watch(
  completedDates,
  (value) => {
    localStorage.setItem("qazo-completed-dates", JSON.stringify([...value]));
    persistPlan();
  },
  { deep: true },
);
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
.dark .icon-btn,
.dark .locale-select {
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

input[type="date"] {
  border: 1px solid #d4d4d8;
  border-radius: 10px;
  padding: 10px;
  background: #fff;
}

.dark input[type="date"] {
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
}

.video-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
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
    box-shadow: 0 8px 28px rgba(15, 23, 42, 0.15);
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
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  }

  .dark .bottom-item.router-link-active {
    color: #93c5fd;
  }
}
</style>
