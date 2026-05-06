<template>
  <nav class="qn-nav">
    <!-- Sidebar logo (desktop only) -->
    <div class="sidebar-logo">
      <div class="sidebar-logo-title">🕌 {{ t('nav.appName') }}</div>
      <div class="sidebar-logo-sub">v1.0</div>
    </div>

    <!-- Nav items -->
    <button
      v-for="item in navItems"
      :key="item.route"
      class="qn-nav-btn"
      :class="{ active: route.name === item.route }"
      @click="router.push({ name: item.route })"
    >
      <component :is="item.icon" />
      <span class="nav-label">{{ t(item.labelKey) }}</span>
      <div class="qn-nav-dot" />
    </button>

    <!-- Sidebar user info (desktop only) -->
    <div class="sidebar-bottom" v-if="authStore.currentUser">
      <div class="sidebar-user">
        <div class="sidebar-avatar">{{ userInitial }}</div>
        <div>
          <div class="sidebar-uname">{{ displayName }}</div>
          <div class="sidebar-email">{{ authStore.currentUser.email }}</div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/useAuthStore.js'

const { t } = useI18n()
const route  = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const displayName = computed(() =>
  authStore.currentUser?.displayName || authStore.currentUser?.email?.split('@')[0] || 'User'
)
const userInitial = computed(() => (displayName.value[0] || 'U').toUpperCase())

// ── Inline SVG icon components ──────────────────────────────────
const IconHome = () => h('svg', { width: '22', height: '22', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z' }),
  h('path', { d: 'M9 21V12h6v9' }),
])
const IconList = () => h('svg', { width: '22', height: '22', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('line', { x1: '8', y1: '6', x2: '21', y2: '6' }),
  h('line', { x1: '8', y1: '12', x2: '21', y2: '12' }),
  h('line', { x1: '8', y1: '18', x2: '21', y2: '18' }),
  h('line', { x1: '3', y1: '6', x2: '3.01', y2: '6' }),
  h('line', { x1: '3', y1: '12', x2: '3.01', y2: '12' }),
  h('line', { x1: '3', y1: '18', x2: '3.01', y2: '18' }),
])
const IconUser = () => h('svg', { width: '22', height: '22', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' }),
  h('circle', { cx: '12', cy: '7', r: '4' }),
])
const IconInfo = () => h('svg', { width: '22', height: '22', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('circle', { cx: '12', cy: '12', r: '10' }),
  h('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
  h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' }),
])
const IconBook = () => h('svg', { width: '22', height: '22', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z' }),
  h('path', { d: 'M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z' }),
])
const IconTrophy = () => h('svg', { width: '22', height: '22', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M6 9H4a2 2 0 01-2-2V5h4' }),
  h('path', { d: 'M18 9h2a2 2 0 002-2V5h-4' }),
  h('path', { d: 'M12 17v4' }),
  h('path', { d: 'M8 21h8' }),
  h('path', { d: 'M6 5h12v7a6 6 0 01-12 0V5z' }),
])

const navItems = [
  { route: 'Dashboard',   icon: IconHome,   labelKey: 'nav.dashboard'   },
  { route: 'Tracker',     icon: IconList,   labelKey: 'nav.tracker'     },
  { route: 'Quran',       icon: IconBook,   labelKey: 'nav.quran'       },
  { route: 'Leaderboard', icon: IconTrophy, labelKey: 'nav.leaderboard' },
  { route: 'Profile',     icon: IconUser,   labelKey: 'nav.profile'     },
  { route: 'Info',        icon: IconInfo,   labelKey: 'nav.info'        },
]
</script>
