<template>
  <div
    class="ayah-block"
    :class="[`ayah-fs-${settings.fontSize ?? 'medium'}`, { 'ayah-highlighted': highlighted }]"
    :data-ayah="ayah.number"
  >
    <!-- Ayah number badge -->
    <div class="ayah-num-row">
      <div class="ayah-num">{{ ayah.number }}</div>
    </div>

    <!-- Arabic -->
    <p v-if="settings.showArabic" class="ayah-arabic" dir="rtl">
      {{ ayah.arabic }}
    </p>

    <!-- Latin transliteration -->
    <p v-if="settings.showLatin && ayah.latin" class="ayah-latin">
      {{ ayah.latin }}
    </p>

    <!-- Translation -->
    <p v-if="settings.showTranslation && ayah.translation" class="ayah-translation">
      {{ ayah.translation }}
    </p>

  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  ayah:        { type: Object,  required: true },
  settings:    { type: Object,  required: true },
  highlighted: { type: Boolean, default: false },
})

const { t } = useI18n()
</script>

<style scoped>
.ayah-block {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg2);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: background 0.2s, border-color 0.2s;
}

.ayah-highlighted {
  border-color: var(--teal-mid);
  background: var(--teal-light);
}

.ayah-num-row {
  display: flex;
  align-items: center;
}
.ayah-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--teal-light);
  color: var(--teal);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Arabic */
.ayah-arabic {
  font-family: 'Scheherazade New', 'Amiri', 'KFGQPC Uthmanic Script', serif;
  line-height: 2;
  color: var(--text1);
  margin: 0;
  text-align: right;
}
.ayah-fs-small  .ayah-arabic { font-size: 20px; }
.ayah-fs-medium .ayah-arabic { font-size: 24px; }
.ayah-fs-large  .ayah-arabic { font-size: 30px; }

/* Latin */
.ayah-latin {
  font-style: italic;
  color: var(--text2);
  margin: 0;
  line-height: 1.6;
}
.ayah-fs-small  .ayah-latin { font-size: 12px; }
.ayah-fs-medium .ayah-latin { font-size: 13px; }
.ayah-fs-large  .ayah-latin { font-size: 15px; }

/* Translation */
.ayah-translation {
  color: var(--text1);
  margin: 0;
  line-height: 1.65;
  padding-top: 4px;
  border-top: 1px solid var(--border);
}
.ayah-fs-small  .ayah-translation { font-size: 13px; }
.ayah-fs-medium .ayah-translation { font-size: 14px; }
.ayah-fs-large  .ayah-translation { font-size: 16px; }

</style>
