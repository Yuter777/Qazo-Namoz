<template>
  <Teleport to="body">
    <div class="qn-modal-overlay" @click.self="$emit('close')">
      <div class="qn-modal-sheet">
        <div class="qn-modal-handle" />

        <!-- Tabs -->
        <div style="display: flex; gap: 6px; margin-bottom: 18px">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :style="{
              flex: 1, padding: '9px', borderRadius: '10px',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', border: 'none',
              background: activeTab === tab.id ? 'var(--teal)' : 'var(--teal-light)',
              color: activeTab === tab.id ? 'white' : 'var(--teal-dark)',
            }"
            @click="activeTab = tab.id"
          >{{ tab.label }}</button>
        </div>

        <!-- ── Add tab ── -->
        <template v-if="activeTab === 'add'">
          <div class="prayer-select-grid">
            <button
              v-for="p in PRAYERS"
              :key="p"
              class="prayer-select-btn"
              :class="{ selected: selectedPrayer === p }"
              @click="selectedPrayer = p"
            >
              <div class="ps-name">{{ PRAYER_EMOJIS[p] }} {{ t(`prayers.${p}`) }}</div>
              <div class="ps-count">{{ t('dashboard.count') }}: {{ prayerStore.qazo[p] }}</div>
            </button>
          </div>

          <div style="margin-bottom: 16px">
            <label style="font-size: 13px; color: var(--text2); font-weight: 500; display: block; margin-bottom: 6px">
              {{ t('dashboard.count') }}
            </label>
            <input
              v-model.number="addCount"
              class="qn-input"
              type="number"
              min="1"
              max="9999"
            />
          </div>

          <div style="display: flex; gap: 8px">
            <button
              @click="$emit('close')"
              style="flex: 1; padding: 13px; border-radius: 12px; border: 1.5px solid var(--border);
                background: none; font-size: 15px; font-weight: 600; cursor: pointer;
                color: var(--text2); font-family: inherit"
            >{{ t('common.cancel') }}</button>
            <button class="qn-add-btn" style="flex: 2" @click="onAdd">{{ t('dashboard.add') }}</button>
          </div>
        </template>

        <!-- ── Calc tab ── -->
        <template v-else>
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px">
            <div>
              <label style="font-size: 12px; color: var(--text2); font-weight: 500; display: block; margin-bottom: 4px">
                {{ t('calc.fromDate') }}
              </label>
              <input type="date" class="qn-input" v-model="calcFrom" :max="todayStr" @change="calcResult = null" />
            </div>
            <div>
              <label style="font-size: 12px; color: var(--text2); font-weight: 500; display: block; margin-bottom: 4px">
                {{ t('calc.toDate') }}
              </label>
              <input type="date" class="qn-input" v-model="calcTo" :max="todayStr" @change="calcResult = null" />
            </div>
            <button class="qn-add-btn" @click="doCalc">🔢 {{ t('calc.calcBtn') }}</button>
          </div>

          <template v-if="calcResult">
            <div style="background: var(--teal-light); border-radius: 12px; padding: 12px 16px;
              display: flex; justify-content: space-between; margin-bottom: 12px">
              <div style="text-align: center">
                <div style="font-size: 22px; font-weight: 800; color: var(--text1)">{{ calcResult.days.toLocaleString() }}</div>
                <div style="font-size: 11px; color: var(--text2); font-weight: 500">{{ t('calc.totalDays') }}</div>
              </div>
              <div style="text-align: center">
                <div style="font-size: 22px; font-weight: 800; color: var(--teal)">{{ calcTotal.toLocaleString() }}</div>
                <div style="font-size: 11px; color: var(--text2); font-weight: 500">{{ t('calc.totalPrayers') }}</div>
              </div>
            </div>

            <div class="qn-card" style="margin-bottom: 12px">
              <div
                v-for="(p, i) in PRAYERS"
                :key="p"
                style="display: flex; align-items: center; gap: 10px; padding: 10px 14px"
                :style="{ borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }"
              >
                <span>{{ PRAYER_EMOJIS[p] }}</span>
                <div style="flex: 1; font-size: 13px; font-weight: 500; color: var(--text1)">{{ t(`prayers.${p}`) }}</div>
                <input
                  v-if="showCustom"
                  type="number" min="0" max="99999"
                  v-model.number="customCounts[p]"
                  style="width: 72px; padding: 5px 8px; border-radius: 8px; border: 1.5px solid var(--teal);
                    font-family: inherit; font-size: 14px; font-weight: 700; text-align: center;
                    color: var(--text1); background: var(--bg); outline: none"
                />
                <span v-else style="font-size: 15px; font-weight: 700; color: var(--text1)">
                  {{ customCounts[p].toLocaleString() }}
                </span>
              </div>
            </div>

            <div style="display: flex; gap: 8px">
              <button
                @click="showCustom = !showCustom"
                :style="{
                  flex: 1, padding: '11px', borderRadius: '12px',
                  border: '1.5px solid var(--border)',
                  background: showCustom ? 'var(--teal-light)' : 'none',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  color: showCustom ? 'var(--teal-dark)' : 'var(--text2)',
                  fontFamily: 'inherit',
                }"
              >✏️ {{ t('calc.customCounts') }}</button>
              <button
                class="qn-add-btn"
                style="flex: 2"
                :style="{ background: calcApplied ? 'var(--green)' : 'var(--teal)' }"
                @click="doApply"
              >{{ calcApplied ? '✓ ' + t('calc.applied') : '📲 ' + t('calc.applyToTracker') }}</button>
            </div>
          </template>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePrayerStore } from '../stores/usePrayerStore.js'
import { PRAYERS, PRAYER_EMOJIS } from '../utils/prayerConstants.js'
import { showSuccess, showWarning } from '../utils/message.js'

const { t } = useI18n()
const prayerStore = usePrayerStore()

const emit = defineEmits(['close'])

// ── Add tab state ──
const activeTab      = ref('calc')
const selectedPrayer = ref('bomdod')
const addCount       = ref(1)

const tabs = computed(() => [
  { id: 'calc', label: t('calc.calcTitle')      },
  { id: 'add',  label: t('dashboard.quickAdd') },
])

function onAdd() {
  const n = Math.max(1, addCount.value || 1)
  prayerStore.addQazo(selectedPrayer.value, n)
  showSuccess(t('messages.qazoAdded'))
  emit('close')
}

// ── Calc tab state ──
const todayStr   = new Date().toISOString().split('T')[0]
const calcFrom   = ref('2015-01-01')
const calcTo     = ref(todayStr)
const calcResult = ref(null)
const customCounts = ref({ bomdod: 0, peshin: 0, asr: 0, shom: 0, xufton: 0, vitr: 0 })
const showCustom = ref(false)
const calcApplied = ref(false)

const calcTotal = computed(() =>
  PRAYERS.reduce((s, p) => s + (customCounts.value[p] || 0), 0)
)

function doCalc() {
  const from = new Date(calcFrom.value)
  const to   = new Date(calcTo.value)
  if (isNaN(from) || isNaN(to) || from >= to) {
    showWarning(t('messages.invalidDates'))
    return
  }
  const days = Math.floor((to - from) / 86_400_000) + 1
  const counts = Object.fromEntries(PRAYERS.map(p => [p, days]))
  calcResult.value = { days, counts }
  customCounts.value = { ...counts }
  showCustom.value = false
  calcApplied.value = false
}

function doApply() {
  prayerStore.setQazoCounts({ ...customCounts.value })
  calcApplied.value = true
  showSuccess(t('messages.trackerUpdated'))
  setTimeout(() => emit('close'), 800)
}
</script>

<style scoped>
.prayer-select-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}
.prayer-select-btn {
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: none;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  font-family: inherit;
}
.prayer-select-btn.selected {
  border-color: var(--teal);
  background: var(--teal-light);
}
.ps-name { font-size: 14px; font-weight: 600; color: var(--text1); }
.ps-count { font-size: 12px; color: var(--text2); margin-top: 2px; }
</style>
