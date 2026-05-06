<template>
  <div class="qn-page">
    <div class="lb-wrap">

      <!-- Page header -->
      <div class="lb-header">
        <span class="lb-header-icon">🏆</span>
        <h1 class="lb-title">{{ t('leaderboard.title') }}</h1>
        <p class="lb-subtitle">{{ t('leaderboard.subtitle') }}</p>
      </div>

      <!-- Current user rank banner (outside top 50) -->
      <transition name="slide-down">
        <div v-if="!isLoading && currentUserRank !== null && currentUserRank > 50" class="lb-my-rank">
          <div class="lb-my-rank-left">
            <div class="lb-my-avatar">{{ myInitial }}</div>
            <div>
              <div class="lb-my-name">{{ myName }}</div>
              <div class="lb-my-label">{{ t('leaderboard.yourRank') }}</div>
            </div>
          </div>
          <div class="lb-my-right">
            <div class="lb-my-rank-num">#{{ currentUserRank }}</div>
            <div class="lb-my-count">{{ currentUserQazoCount }} {{ t('leaderboard.prayers') }}</div>
          </div>
        </div>
      </transition>

      <!-- Error -->
      <div v-if="error" class="lb-error">
        <div class="lb-empty-icon">⚠️</div>
        <p class="lb-empty-text">{{ t('common.error') }}</p>
        <el-button size="small" @click="fetchLeaderboard">{{ t('leaderboard.retry') }}</el-button>
      </div>

      <!-- Skeleton loading -->
      <template v-else-if="isLoading">
        <div v-for="i in 8" :key="i" class="lb-skeleton-row">
          <div class="skel skel-circle" style="width:36px;height:36px;flex-shrink:0"></div>
          <div class="skel skel-circle" style="width:40px;height:40px;flex-shrink:0"></div>
          <div class="skel skel-bar" style="flex:1;height:16px"></div>
          <div class="skel skel-bar" style="width:48px;height:20px"></div>
        </div>
      </template>

      <!-- Leaderboard list -->
      <template v-else>
        <div class="lb-list">
          <transition-group name="lb-item" appear>
            <div
              v-for="(user, idx) in users"
              :key="user.uid"
              class="lb-row"
              :class="rowClasses(idx, user.uid)"
              :style="{ transitionDelay: idx * 30 + 'ms' }"
            >
              <!-- Rank badge -->
              <div class="lb-rank-badge" :class="rankBadgeClass(idx)">
                <span v-if="idx === 0" class="lb-medal">🥇</span>
                <span v-else-if="idx === 1" class="lb-medal">🥈</span>
                <span v-else-if="idx === 2" class="lb-medal">🥉</span>
                <span v-else class="lb-rank-num">{{ idx + 1 }}</span>
              </div>

              <!-- Avatar -->
              <div class="lb-avatar" :class="avatarBorderClass(idx)">
                <img
                  v-if="user.photoURL"
                  :src="user.photoURL"
                  :alt="user.displayName"
                  class="lb-avatar-img"
                  referrerpolicy="no-referrer"
                />
                <span v-else class="lb-avatar-initial">{{ getInitial(user.displayName || user.email) }}</span>
              </div>

              <!-- Name + you tag -->
              <div class="lb-info">
                <div class="lb-user-name">
                  {{ user.displayName || user.email?.split('@')[0] || t('leaderboard.anonymous') }}
                </div>
                <div v-if="user.uid === authStore.currentUser?.uid" class="lb-you-tag">
                  {{ t('leaderboard.you') }}
                </div>
              </div>

              <!-- Count -->
              <div class="lb-count-wrap">
                <span class="lb-count-num" :class="countClass(idx)">{{ user.qazoCount ?? 0 }}</span>
                <span class="lb-count-suffix">{{ t('leaderboard.prayers') }}</span>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- Empty state -->
        <div v-if="users.length === 0" class="lb-empty">
          <div class="lb-empty-icon">🕌</div>
          <p class="lb-empty-text">{{ t('leaderboard.empty') }}</p>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { db } from '../firebase/config'
import {
  collection, query, orderBy, limit, getDocs, getDoc, doc, where, getCountFromServer,
} from 'firebase/firestore'
import { useAuthStore } from '../stores/useAuthStore'

const { t } = useI18n()
const authStore = useAuthStore()

const users = ref([])
const isLoading = ref(true)
const error = ref(false)
const currentUserRank = ref(null)
const currentUserQazoCount = ref(0)

const myName = computed(() => {
  const u = authStore.currentUser
  return u?.displayName || u?.email?.split('@')[0] || t('leaderboard.anonymous')
})
const myInitial = computed(() => (myName.value[0] || 'U').toUpperCase())

function getInitial(name) {
  return (name?.[0] || '?').toUpperCase()
}

function rowClasses(idx, uid) {
  return {
    'lb-rank-1': idx === 0,
    'lb-rank-2': idx === 1,
    'lb-rank-3': idx === 2,
    'lb-top10': idx >= 3 && idx < 10,
    'lb-me': uid === authStore.currentUser?.uid,
  }
}

function rankBadgeClass(idx) {
  if (idx === 0) return 'lb-gold-bg'
  if (idx === 1) return 'lb-silver-bg'
  if (idx === 2) return 'lb-bronze-bg'
  return ''
}

function avatarBorderClass(idx) {
  if (idx === 0) return 'av-gold'
  if (idx === 1) return 'av-silver'
  if (idx === 2) return 'av-bronze'
  return ''
}

function countClass(idx) {
  if (idx === 0) return 'count-gold'
  if (idx === 1) return 'count-silver'
  if (idx === 2) return 'count-bronze'
  return ''
}

async function fetchLeaderboard() {
  isLoading.value = true
  error.value = false
  try {
    const uid = authStore.currentUser?.uid

    const q = query(collection(db, 'users'), orderBy('qazoCount', 'desc'), limit(50))
    const snap = await getDocs(q)
    users.value = snap.docs.map(d => ({ uid: d.id, ...d.data() }))

    if (!uid) return

    const myIdx = users.value.findIndex(u => u.uid === uid)
    if (myIdx !== -1) {
      currentUserRank.value = myIdx + 1
      currentUserQazoCount.value = users.value[myIdx].qazoCount ?? 0
    } else {
      const mySnap = await getDoc(doc(db, 'users', uid))
      if (mySnap.exists()) {
        const myData = mySnap.data()
        currentUserQazoCount.value = myData.qazoCount ?? 0
        const countQ = query(
          collection(db, 'users'),
          where('qazoCount', '>', currentUserQazoCount.value),
        )
        const countSnap = await getCountFromServer(countQ)
        currentUserRank.value = countSnap.data().count + 1
      }
    }
  } catch (e) {
    console.error('Leaderboard fetch error:', e)
    error.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchLeaderboard)
</script>

<style scoped>
.lb-wrap {
  padding: 16px 16px 32px;
}

/* ── Header ── */
.lb-header {
  text-align: center;
  padding: 24px 0 20px;
}
.lb-header-icon {
  font-size: 52px;
  display: block;
  margin-bottom: 8px;
}
.lb-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text1);
  margin-bottom: 4px;
}
.lb-subtitle {
  font-size: 13px;
  color: var(--text2);
}

/* ── My rank banner ── */
.lb-my-rank {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--teal-light);
  border: 2px solid var(--teal);
  border-radius: var(--radius);
  padding: 14px 16px;
  margin-bottom: 16px;
}
.lb-my-rank-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lb-my-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--teal);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}
.lb-my-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text1);
}
.lb-my-label {
  font-size: 11px;
  color: var(--text2);
}
.lb-my-right {
  text-align: right;
}
.lb-my-rank-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--teal);
}
.lb-my-count {
  font-size: 11px;
  color: var(--text2);
}

/* ── List ── */
.lb-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Row base ── */
.lb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.lb-row:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* ── Rank 1 – Gold ── */
.lb-rank-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.13) 0%, rgba(245, 158, 11, 0.06) 100%);
  border: 1.5px solid rgba(255, 200, 0, 0.5);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.18), var(--shadow-md);
}
.lb-rank-1:hover {
  transform: scale(1.005) translateY(-1px);
}

/* ── Rank 2 – Silver ── */
.lb-rank-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.13) 0%, rgba(156, 163, 175, 0.06) 100%);
  border: 1.5px solid rgba(192, 192, 192, 0.5);
}

/* ── Rank 3 – Bronze ── */
.lb-rank-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.13) 0%, rgba(180, 83, 9, 0.06) 100%);
  border: 1.5px solid rgba(205, 127, 50, 0.45);
}

/* ── Top 10 glow ── */
.lb-top10 {
  border-color: rgba(45, 158, 138, 0.3);
  animation: subtleGlow 3s ease-in-out infinite;
}
@keyframes subtleGlow {
  0%, 100% { box-shadow: 0 0 0 1px rgba(45, 158, 138, 0.08), var(--shadow); }
  50%       { box-shadow: 0 0 10px rgba(45, 158, 138, 0.18), var(--shadow); }
}

/* ── Current user highlight ── */
.lb-me {
  border: 2px solid var(--teal) !important;
  background: var(--teal-light) !important;
}

/* ── Rank badge ── */
.lb-rank-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lb-medal { font-size: 22px; line-height: 1; }
.lb-rank-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--text2);
}
.lb-gold-bg   { background: rgba(255, 215, 0, 0.2); }
.lb-silver-bg { background: rgba(192, 192, 192, 0.2); }
.lb-bronze-bg { background: rgba(205, 127, 50, 0.2); }

/* ── Avatar ── */
.lb-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--teal-light);
  color: var(--teal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  flex-shrink: 0;
  border: 2px solid var(--border);
  overflow: hidden;
}
.lb-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.lb-avatar-initial { line-height: 1; }
.av-gold   { border-color: #FFD700; box-shadow: 0 0 8px rgba(255, 215, 0, 0.5); }
.av-silver { border-color: #C0C0C0; }
.av-bronze { border-color: #CD7F32; }

/* ── Info ── */
.lb-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.lb-user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lb-you-tag {
  font-size: 10px;
  font-weight: 700;
  color: var(--teal);
  background: var(--teal-light);
  border: 1px solid var(--teal-mid);
  padding: 1px 7px;
  border-radius: 999px;
  display: inline-block;
  width: fit-content;
  letter-spacing: 0.04em;
}

/* ── Count ── */
.lb-count-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}
.lb-count-num {
  font-size: 18px;
  font-weight: 800;
  color: var(--text1);
  line-height: 1.1;
}
.count-gold   { color: #D97706; }
.count-silver { color: #6B7280; }
.count-bronze { color: #92400E; }
.lb-count-suffix {
  font-size: 10px;
  color: var(--text2);
}

/* ── Error & Empty ── */
.lb-error {
  text-align: center;
  padding: 40px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text2);
}
.lb-empty {
  text-align: center;
  padding: 56px 32px;
  color: var(--text2);
}
.lb-empty-icon { font-size: 48px; margin-bottom: 12px; }
.lb-empty-text { font-size: 14px; }

/* ── Skeleton ── */
.lb-skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  margin-bottom: 8px;
}
.skel {
  background: linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skel-circle { border-radius: 50%; }
.skel-bar    { border-radius: 6px; }
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Transitions ── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.lb-item-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.lb-item-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}
</style>