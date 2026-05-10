<template>
  <div class="sett-wrap">

    <!-- Audio settings -->
    <div class="sett-section-title">{{ t('quran.settings.audio') }}</div>
    <div class="sett-card">
      <div class="sett-row">
        <div class="sett-row-info">
          <div class="sett-label">{{ t('quran.settings.autoplay') }}</div>
          <div class="sett-sub">{{ t('quran.settings.autoplaySub') }}</div>
        </div>
        <el-switch
          :model-value="quranStore.settings.autoplay"
          @change="val => save({ autoplay: val })"
        />
      </div>

      <div class="sett-divider" />

      <div class="sett-col">
        <div class="sett-label">{{ t('quran.settings.reciter') }}</div>
        <div class="sett-sub">{{ t('quran.settings.reciterSub') }}</div>
        <el-select
          :model-value="quranStore.settings.reciter"
          style="width:100%;margin-top:10px"
          @change="val => changeReciter(val)"
        >
          <el-option
            v-for="opt in RECITERS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
    </div>

    <div class="sett-info">
      <span class="sett-info-label">{{ t('quran.settings.currentReciter') }}:</span>
      <span class="sett-info-val">{{ currentReciterLabel }}</span>
    </div>

    <!-- Display settings -->
    <div class="sett-section-title" style="margin-top:8px">{{ t('quran.settings.display') }}</div>
    <div class="sett-card">
      <div class="sett-row">
        <div class="sett-row-info">
          <div class="sett-label">{{ t('quran.settings.showArabic') }}</div>
        </div>
        <el-switch
          :model-value="quranStore.settings.showArabic"
          @change="val => save({ showArabic: val })"
        />
      </div>
      <div class="sett-divider" />
      <div class="sett-row">
        <div class="sett-row-info">
          <div class="sett-label">{{ t('quran.settings.showLatin') }}</div>
        </div>
        <el-switch
          :model-value="quranStore.settings.showLatin"
          @change="val => save({ showLatin: val })"
        />
      </div>
      <div class="sett-divider" />
      <div class="sett-row">
        <div class="sett-row-info">
          <div class="sett-label">{{ t('quran.settings.showTranslation') }}</div>
        </div>
        <el-switch
          :model-value="quranStore.settings.showTranslation"
          @change="val => save({ showTranslation: val })"
        />
      </div>
    </div>

    <!-- Font size -->
    <div class="sett-card">
      <div class="sett-col">
        <div class="sett-label">{{ t('quran.settings.fontSize') }}</div>
        <div class="sett-font-btns">
          <button
            v-for="size in FONT_SIZES"
            :key="size.value"
            class="sett-font-btn"
            :class="{ active: quranStore.settings.fontSize === size.value }"
            @click="save({ fontSize: size.value })"
          >{{ size.label }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuranStore } from '../../stores/useQuranStore'
import { useAuthStore } from '../../stores/useAuthStore'

const { t } = useI18n()
const quranStore = useQuranStore()
const authStore = useAuthStore()

const RECITERS = [
  { value: 'ar.alafasy',            label: 'Mishary Rashid Alafasy' },
  { value: 'ar.abdurrahmaansudais', label: 'Abdur Rahman Al-Sudais' },
  { value: 'ar.minshawi',           label: 'Mohamed Siddiq Al-Minshawi' },
  { value: 'ar.husary',             label: 'Mahmoud Khalil Al-Husary' },
]

const FONT_SIZES = [
  { value: 'small',  label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large',  label: 'L' },
]

const currentReciterLabel = computed(() =>
  RECITERS.find(r => r.value === quranStore.settings.reciter)?.label ?? quranStore.settings.reciter
)

function save(patch) {
  const uid = authStore.currentUser?.uid
  if (!uid) return
  quranStore.updateSettings(uid, patch)
}

function changeReciter(val) {
  save({ reciter: val })
  quranStore.stopAudio()
}
</script>

<style scoped>
.sett-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sett-section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0 2px;
}

.sett-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.sett-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
}
.sett-col { padding: 14px 16px; }
.sett-divider { height: 1px; background: var(--border); }

.sett-row-info { flex: 1; min-width: 0; }
.sett-label { font-size: 14px; font-weight: 600; color: var(--text1); }
.sett-sub   { font-size: 12px; color: var(--text2); margin-top: 2px; }

.sett-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 12px;
}
.sett-info-label { color: var(--text2); }
.sett-info-val   { color: var(--text1); font-weight: 600; }

.sett-font-btns {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.sett-font-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text2);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.sett-font-btn.active {
  background: var(--teal-light);
  border-color: var(--teal);
  color: var(--teal);
}
.sett-font-btn:hover:not(.active) {
  border-color: var(--teal-mid);
  color: var(--text1);
}
</style>
