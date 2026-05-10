<template>
  <el-dialog
    v-model="visible"
    :title="t('quran.settings.displayTitle')"
    width="92%"
    style="max-width:380px;border-radius:16px"
    :show-close="true"
    align-center
    append-to-body
  >
    <div class="sm-body">
      <div class="sm-row">
        <span class="sm-label">{{ t('quran.settings.showArabic') }}</span>
        <el-switch :model-value="settings.showArabic" @change="emit('update', { showArabic: $event })" />
      </div>
      <div class="sm-divider" />
      <div class="sm-row">
        <span class="sm-label">{{ t('quran.settings.showLatin') }}</span>
        <el-switch :model-value="settings.showLatin" @change="emit('update', { showLatin: $event })" />
      </div>
      <div class="sm-divider" />
      <div class="sm-row">
        <span class="sm-label">{{ t('quran.settings.showTranslation') }}</span>
        <el-switch :model-value="settings.showTranslation" @change="emit('update', { showTranslation: $event })" />
      </div>
      <div class="sm-section">{{ t('quran.settings.fontSize') }}</div>
      <div class="sm-font-btns">
        <button
          v-for="size in FONT_SIZES"
          :key="size.value"
          class="sm-font-btn"
          :class="{ active: settings.fontSize === size.value }"
          @click="emit('update', { fontSize: size.value })"
        >
          {{ size.label }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

// modelValue olib tashlandi, faqat settings qoldi
const props = defineProps({
  settings: { type: Object, required: true },
})

// update:modelValue olib tashlandi
const emit = defineEmits(['update'])

const { t } = useI18n()

// visible o'zi v-model vazifasini bajaradi
const visible = defineModel()

const FONT_SIZES = [
  { value: 'small',  label: t('quran.settings.fontSizeSmall') },
  { value: 'medium', label: t('quran.settings.fontSizeMedium') },
  { value: 'large',  label: t('quran.settings.fontSizeLarge') },
]
</script>

<style scoped>
/* Stilingiz o'z holicha qoladi */
.sm-body { display: flex; flex-direction: column; gap: 0; }
.sm-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 0; }
.sm-label { font-size: 14px; font-weight: 600; color: var(--text1); }
.sm-divider { height: 1px; background: var(--border); }
.sm-section { font-size: 11px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.07em; margin-top: 16px; margin-bottom: 10px; }
.sm-font-btns { display: flex; gap: 8px; }
.sm-font-btn { flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text2); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.sm-font-btn.active { background: var(--teal-light); border-color: var(--teal); color: var(--teal); }
.sm-font-btn:hover:not(.active) { border-color: var(--teal-mid); color: var(--text1); }
</style>