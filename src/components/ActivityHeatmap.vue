<template>
  <div>
    <div style="padding: 0 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
      <span style="font-size: 13px; color: var(--text2)">{{ t('dashboard.heatmapTitle') }}</span>
      <span style="font-size: 13px; color: var(--teal); font-weight: 600">{{ activeDays }} {{ t('dashboard.days') }}</span>
    </div>
    <div style="padding: 0 20px">
      <div class="qn-heatmap-grid">
        <div
          v-for="(cell, i) in cells"
          :key="i"
          class="qn-heatmap-cell"
          :class="cell.level > 0 ? `l${cell.level}` : ''"
          :title="cell.label"
        />
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 6px">
        <span style="font-size: 11px; color: var(--text3)">{{ t('dashboard.heatLess') }}</span>
        <span style="font-size: 11px; color: var(--text3)">{{ t('dashboard.heatMore') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  history: { type: Array, default: () => [] },
})

// Build a map: iso-date → completion count
const countByDay = computed(() => {
  const map = {}
  for (const entry of props.history) {
    const iso = new Date(entry.trackedAt?.toDate ? entry.trackedAt.toDate() : entry.trackedAt)
      .toISOString().split('T')[0]
    map[iso] = (map[iso] || 0) + 1
  }
  return map
})

// Generate last 98 days (14 × 7)
const cells = computed(() => {
  const days = []
  for (let i = 97; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().split('T')[0]
    const count = countByDay.value[iso] || 0
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
    days.push({ date: d, iso, level, label: `${iso} – ${count} qazo` })
  }
  return days
})

const activeDays = computed(() => cells.value.filter(c => c.level > 0).length)
</script>
