<template>
  <div class="sett-wrap">

    <div class="sett-card">
      <!-- Autoplay toggle -->
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

      <!-- Reciter select -->
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

    <!-- Current reciter info -->
    <div class="sett-info">
      <span class="sett-info-label">🎙 {{ t('quran.settings.currentReciter') }}:</span>
      <span class="sett-info-val">{{ currentReciterLabel }}</span>
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
  { value: 'ar.alafasy',           label: 'Mishary Rashid Alafasy' },
  { value: 'ar.abdurrahmaansudais', label: 'Abdur Rahman Al-Sudais' },
  { value: 'ar.minshawi',          label: 'Mohamed Siddiq Al-Minshawi' },
  { value: 'ar.husary',            label: 'Mahmoud Khalil Al-Husary' },
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
  gap: 12px;
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
  padding: 16px;
}
.sett-col { padding: 16px; }
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
</style>