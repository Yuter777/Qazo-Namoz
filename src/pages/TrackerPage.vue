<template>
  <div class="qn-page fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <div class="page-title">{{ t('tracker.history') }}</div>
        <div class="page-subtitle">{{ prayerStore.history.length }} {{ t('tracker.done').toLowerCase() }}</div>
      </div>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    </div>

    <!-- Loading skeleton -->
    <SkeletonHistoryList v-if="showSkeleton" />

    <!-- Empty state -->
    <div v-else-if="prayerStore.history.length === 0" class="empty-state">
      <div style="font-size: 48px; margin-bottom: 12px">🕌</div>
      <div style="font-size: 15px">{{ t('tracker.noHistory') }}</div>
    </div>

    <template v-else>
      <!-- Desktop table -->
      <div class="desktop-tracker-wrap">
        <div class="qn-card qn-card-desktop" style="overflow: hidden">
          <table class="tracker-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{{ t('tracker.prayer') }}</th>
                <th>{{ t('tracker.date') }}</th>
                <th>{{ t('tracker.time') }}</th>
                <th>{{ t('tracker.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in prayerStore.history" :key="item.id">
                <td style="color: var(--text3); font-size: 12px">{{ i + 1 }}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <div :style="`width:8px;height:8px;border-radius:2px;background:${PRAYER_COLORS[item.prayer]};flex-shrink:0`" />
                    <span style="font-weight: 500">{{ PRAYER_EMOJIS[item.prayer] }} {{ t(`prayers.${item.prayer}`) }}</span>
                  </div>
                </td>
                <td style="color: var(--text2)">{{ formatDate(item.trackedAt) }}</td>
                <td style="color: var(--text2)">{{ formatTime(item.trackedAt) }}</td>
                <td>
                  <span class="done-chip">✓ {{ t('tracker.done') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile grouped cards -->
      <div class="mobile-tracker-wrap">
        <template v-for="(items, date) in groupedHistory" :key="date">
          <div class="qn-section-label">{{ date }}</div>
          <div class="qn-card" style="margin: 0 20px">
            <div
              v-for="item in items"
              :key="item.id"
              class="tracker-entry"
            >
              <div class="tracker-dot" :style="`background:${PRAYER_COLORS[item.prayer]}`" />
              <div style="flex: 1">
                <div style="font-size: 14px; font-weight: 600; color: var(--text1)">
                  {{ PRAYER_EMOJIS[item.prayer] }} {{ t(`prayers.${item.prayer}`) }}
                </div>
                <div style="font-size: 12px; color: var(--text3)">{{ formatTime(item.trackedAt) }}</div>
              </div>
              <span class="done-chip">✓ {{ t('tracker.done') }}</span>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePrayerStore }    from '../stores/usePrayerStore.js'
import { useSkeleton }       from '../composables/useSkeleton.js'
import { PRAYER_COLORS, PRAYER_EMOJIS } from '../utils/prayerConstants.js'
import SkeletonHistoryList from '../components/SkeletonHistoryList.vue'

const { t, locale } = useI18n()
const prayerStore = usePrayerStore()

const showSkeleton = useSkeleton(() => prayerStore.isLoading)

function toDate(v) {
  if (!v) return new Date()
  return v?.toDate ? v.toDate() : new Date(v)
}

function formatDate(v) {
  return toDate(v).toLocaleDateString(
    locale.value === 'uz' ? 'uz-UZ' : locale.value === 'ru' ? 'ru-RU' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )
}

function formatTime(v) {
  return toDate(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function groupKey(v) {
  return toDate(v).toLocaleDateString(
    locale.value === 'uz' ? 'uz-UZ' : locale.value === 'ru' ? 'ru-RU' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

const groupedHistory = computed(() => {
  const groups = {}
  for (const item of prayerStore.history) {
    const key = groupKey(item.trackedAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return groups
})
</script>

<style scoped>
.page-header {
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title   { font-size: 22px; font-weight: 700; color: var(--text1); letter-spacing: -0.5px; }
.page-subtitle { font-size: 13px; color: var(--text2); margin-top: 2px; }

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--text3);
}

.done-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px; font-weight: 500;
  background: var(--green-light); color: #166534;
}

.tracker-entry {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}
.tracker-entry:last-child { border-bottom: none; }
.tracker-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

/* Desktop table */
.desktop-tracker-wrap { display: none; }
.mobile-tracker-wrap  { display: block; }

.tracker-table { width: 100%; border-collapse: collapse; }
.tracker-table th {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px;
  color: var(--text3); font-weight: 600; padding: 12px 16px;
  text-align: left; border-bottom: 1px solid var(--border);
}
.tracker-table td { padding: 12px 16px; font-size: 14px; color: var(--text1); border-bottom: 1px solid var(--border); }
.tracker-table tr:last-child td { border-bottom: none; }
.tracker-table tr:hover td { background: var(--teal-light); }

@media (min-width: 768px) {
  .page-header { padding: 32px 32px 16px; }
  .page-title  { font-size: 26px; }
  .desktop-tracker-wrap { display: block; padding: 0; }
  .mobile-tracker-wrap  { display: none; }
}

</style>
