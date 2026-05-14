<template>
  <div class="qn-page fade-in">
    <!-- Profile header -->
    <div class="profile-header">
      <div class="avatar">{{ userInitial }}</div>
      <div>
        <div class="profile-name">{{ displayName }}</div>
        <div class="profile-email">{{ authStore.currentUser?.email }}</div>
      </div>
    </div>

    <!-- Desktop 2-col grid -->
    <div class="desktop-profile-grid">
      <!-- Left col -->
      <div>
        <div class="qn-section-label" style="padding-left: 0">
          {{ t("profile.language") }}
        </div>
        <div class="qn-card" style="margin: 0; padding: 14px 16px">
          <div class="lang-pills">
            <button
              v-for="l in ['uz', 'en', 'ru']"
              :key="l"
              class="lang-pill"
              :class="{ active: locale === l }"
              @click="setLocale(l)"
            >
              {{ l === "uz" ? "🇺🇿 UZ" : l === "en" ? "🇬🇧 EN" : "🇷🇺 RU" }}
            </button>
          </div>
        </div>

        <div class="qn-section-label" style="padding-left: 0">
          {{ t("profile.dailyGoal") }}
        </div>
        <div class="qn-card" style="margin: 0">
          <SkeletonGoalRows v-if="showGoalSkeleton" />
          <template v-else>
            <div v-for="p in PRAYERS" :key="p" class="goal-row">
              <div class="goal-label">
                {{ PRAYER_EMOJIS[p] }} {{ t(`prayers.${p}`) }}
              </div>
              <input
                class="goal-input"
                type="number"
                min="0"
                max="50"
                :value="tracker.dailyGoals.value[p] ?? 0"
                @change="(e) => saveGoal(p, parseInt(e.target.value) || 0)"
              />
            </div>
          </template>
        </div>
      </div>

      <!-- Right col -->
      <div>
        <div class="qn-section-label" style="padding-left: 0">
          {{ t("profile.settings") }}
        </div>
        <div class="qn-card" style="margin: 0">
          <div class="toggle-row">
            <div>
              <div class="toggle-label">{{ t("profile.darkMode") }}</div>
            </div>
            <button
              class="qn-toggle"
              :class="{ on: uiStore.isDark }"
              @click="uiStore.toggleTheme()"
            />
          </div>
          <div class="toggle-row">
            <div>
              <div class="toggle-label">{{ t("profile.notifications") }}</div>
              <div class="toggle-sub">{{ t("profile.notifSub") }}</div>
            </div>
            <button
              class="qn-toggle"
              :class="{ on: notif }"
              @click="notif = !notif"
            />
          </div>
        </div>

        <div class="qn-section-label" style="padding-left: 0">
          {{ t("profile.account") }}
        </div>
        <div class="qn-card" style="margin: 0">
          <div class="toggle-row">
            <div class="toggle-label">{{ t("info.howToUse") }}</div>
            <button
              style="
                font-size: 13px;
                font-weight: 600;
                color: var(--teal-dark);
                background: none;
                border: none;
                cursor: pointer;
                font-family: inherit;
              "
              @click="showInfoModal = true"
            >
              {{ t("nav.info") }}
            </button>
          </div>
          <div class="toggle-row">
            <div class="toggle-label">{{ t("profile.signOut") }}</div>
            <button
              style="
                font-size: 13px;
                font-weight: 600;
                color: var(--red);
                background: none;
                border: none;
                cursor: pointer;
                font-family: inherit;
              "
              @click="signOut"
            >
              {{ t("auth.logout") }}
            </button>
          </div>
          <div class="toggle-row" style="border-bottom: none">
            <div class="toggle-label" style="color: #dc2626">
              Hisobni o'chirish
            </div>
            <button class="danger-text-btn" @click="showDeleteModal = true">
              O'chirish
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile-only layout -->
    <div class="mobile-only-profile">
      <div class="qn-section-label">{{ t("profile.language") }}</div>
      <div class="qn-card" style="margin: 0 20px; padding: 14px 16px">
        <div class="lang-pills">
          <button
            v-for="l in ['uz', 'en', 'ru']"
            :key="l"
            class="lang-pill"
            :class="{ active: locale === l }"
            @click="setLocale(l)"
          >
            {{ l === "uz" ? "🇺🇿 UZ" : l === "en" ? "🇬🇧 EN" : "🇷🇺 RU" }}
          </button>
        </div>
      </div>

      <div class="qn-section-label">{{ t("profile.dailyGoal") }}</div>
      <div class="qn-card" style="margin: 0 20px">
        <SkeletonGoalRows v-if="showGoalSkeleton" />
        <template v-else>
          <div v-for="p in PRAYERS" :key="p" class="goal-row">
            <div class="goal-label">
              {{ PRAYER_EMOJIS[p] }} {{ t(`prayers.${p}`) }}
            </div>
            <input
              class="goal-input"
              type="number"
              min="0"
              max="50"
              :value="tracker.dailyGoals.value[p] ?? 0"
              @change="(e) => saveGoal(p, parseInt(e.target.value) || 0)"
            />
          </div>
        </template>
      </div>

      <div class="qn-section-label">{{ t("profile.settings") }}</div>
      <div class="qn-card" style="margin: 0 20px">
        <div class="toggle-row">
          <div>
            <div class="toggle-label">{{ t("profile.darkMode") }}</div>
          </div>
          <button
            class="qn-toggle"
            :class="{ on: uiStore.isDark }"
            @click="uiStore.toggleTheme()"
          />
        </div>
        <div class="toggle-row">
          <div>
            <div class="toggle-label">{{ t("profile.notifications") }}</div>
            <div class="toggle-sub">{{ t("profile.notifSub") }}</div>
          </div>
          <button
            class="qn-toggle"
            :class="{ on: notif }"
            @click="notif = !notif"
          />
        </div>
      </div>

      <div class="qn-section-label">{{ t("profile.account") }}</div>
      <div class="qn-card" style="margin: 0 20px 8px">
        <div class="toggle-row">
          <div class="toggle-label">{{ t("info.howToUse") }}</div>
          <button
            style="
              font-size: 13px;
              font-weight: 600;
              color: var(--teal-dark);
              background: none;
              border: none;
              cursor: pointer;
              font-family: inherit;
            "
            @click="showInfoModal = true"
          >
            {{ t("nav.info") }}
          </button>
        </div>
        <div class="toggle-row">
          <div class="toggle-label">{{ t("profile.signOut") }}</div>
          <button
            style="
              font-size: 13px;
              font-weight: 600;
              color: var(--red);
              background: none;
              border: none;
              cursor: pointer;
              font-family: inherit;
            "
            @click="signOut"
          >
            {{ t("auth.logout") }}
          </button>
        </div>
        <div class="toggle-row" style="border-bottom: none">
          <div class="toggle-label" style="color: #dc2626">
            Hisobni o'chirish
          </div>
          <button class="danger-text-btn" @click="showDeleteModal = true">
            O'chirish
          </button>
        </div>
      </div>
    </div>

    <div style="padding-bottom: 12px" />

    <DeleteAccountModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      :user-email="authStore.currentUser?.email || ''"
      :uid="authStore.currentUser?.uid || ''"
      @close="showDeleteModal = false"
    />

    <!-- Info modal -->
    <el-dialog
      v-model="showInfoModal"
      width="480px"
      :show-close="false"
      :close-on-click-modal="true"
      @close="showInfoModal = false"
      custom-class="info-modal-el"
      align-center
    >
      <template #header>
        <div class="info-modal-header">
          <span class="info-modal-title">{{ t("info.howToUse") }} 🕌</span>
          <button class="info-modal-close" @click="showInfoModal = false">
            ✕
          </button>
        </div>
      </template>
      <div class="info-modal-body">
        <div v-for="(step, i) in infoSteps" :key="i" class="info-step">
          <div class="info-num">{{ i + 1 }}</div>
          <div
            style="font-size: 14px; color: var(--text1); line-height: 1.5"
          >
            {{ step }}
          </div>
        </div>
      </div>
      <template #footer>
        <div class="info-modal-footer">v1.0 · {{ t("nav.appName") }}</div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore.js";
import { useUiStore } from "../stores/useUiStore.js";
import { usePrayerTracker } from "../composables/usePrayerTracker.js";
import { useSkeleton } from "../composables/useSkeleton.js";
import { PRAYERS, PRAYER_EMOJIS } from "../utils/prayerConstants.js";
import { logout as firebaseSignOut } from "../services/authService.js";
import SkeletonGoalRows from "../components/SkeletonGoalRows.vue";
import "element-plus/es/components/dialog/style/css";
import { ElDialog } from "element-plus";
import { showSuccess, showInfo } from "../utils/message.js";

const DeleteAccountModal = defineAsyncComponent(() =>
  import("../components/DeleteAccountModal.vue")
);

const { t, locale } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();
const tracker = usePrayerTracker();
const showGoalSkeleton = useSkeleton(tracker.isLoading);
const showDeleteModal = ref(false);
const showInfoModal = ref(false);

const notif = ref(true);

const infoSteps = computed(() => [
  t("info.step1"),
  t("info.step3"),
  t("info.step4"),
]);

const displayName = computed(
  () =>
    authStore.currentUser?.displayName ||
    authStore.currentUser?.email?.split("@")[0] ||
    "User"
);
const userInitial = computed(() => (displayName.value[0] || "U").toUpperCase());

function setLocale(l) {
  locale.value = l;
  localStorage.setItem("qazo-locale", l);
  showInfo(t('messages.languageChanged'))
}

async function saveGoal(prayer, value) {
  const uid = authStore.currentUser?.uid;
  if (!uid) return;
  const updated = { ...tracker.dailyGoals.value, [prayer]: Math.max(0, value) };
  await tracker.updateDailyGoals(uid, updated);
  showSuccess(t('messages.goalSaved'))
}

async function signOut() {
  await firebaseSignOut();
  showInfo(t('messages.logoutSuccess'))
  router.push({ name: "Login" });
}
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 20px 20px;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  letter-spacing: -1px;
}
.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text1);
}
.profile-email {
  font-size: 13px;
  color: var(--text2);
  margin-top: 2px;
}

.lang-pills {
  display: flex;
  gap: 6px;
}
.lang-pill {
  padding: 5px 12px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: none;
  color: var(--text2);
  transition: all 0.15s;
  font-family: inherit;
}
.lang-pill.active {
  background: var(--teal-light);
  border-color: var(--teal);
  color: var(--teal-dark);
}

.goal-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}
.goal-row:last-child {
  border-bottom: none;
}
.goal-label {
  flex: 1;
  font-size: 15px;
  color: var(--text1);
}
.goal-input {
  width: 80px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  font-size: 15px;
  font-family: inherit;
  text-align: center;
  color: var(--text1);
  background: var(--bg);
  outline: none;
}
.goal-input:focus {
  border-color: var(--teal);
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}
.toggle-row:last-child {
  border-bottom: none;
}
.toggle-label {
  font-size: 15px;
  color: var(--text1);
}
.toggle-sub {
  font-size: 12px;
  color: var(--text2);
  margin-top: 2px;
}

.danger-text-btn {
  font-size: 13px;
  font-weight: 600;
  color: #dc2626;
  background: none;
  border: 1.5px solid #dc2626;
  border-radius: 7px;
  padding: 5px 12px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.danger-text-btn:hover {
  background: #fef2f2;
}

.desktop-profile-grid {
  display: none;
}
.mobile-only-profile {
  display: block;
}

.info-modal-el {
  padding: 0 !important;
  border-radius: 20px 20px 0 0;
  max-width: 480px;
  width: 100%;
  background: var(--card);
}
.info-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--border);
  border: 50px;
}
.info-modal-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text1);
}
.info-modal-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bg2, var(--bg));
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-modal-body {
  padding: 4px 0;
}
.info-modal-footer {
  padding: 12px 20px 16px;
  text-align: center;
  color: var(--text3);
  font-size: 12px;
  border-top: 1px solid var(--border);
}
.info-step {
  display: flex;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  align-items: flex-start;
}
.info-step:last-child {
  border-bottom: none;
}
.info-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--teal-light);
  color: var(--teal-dark);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .info-modal-el {
    border-radius: 16px !important;
  }
  .profile-header {
    padding: 32px 32px 20px;
  }
  .desktop-profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 24px;
    padding: 0 32px;
    margin-top: 8px;
  }
  .mobile-only-profile {
    display: none;
  }
}
</style>
