<template>
  <svg :width="size" :height="size" :style="{ transform: 'rotate(-90deg)' }">
    <circle
      :cx="size / 2" :cy="size / 2" :r="r"
      fill="none"
      stroke="var(--teal-light)"
      :stroke-width="stroke"
    />
    <circle
      :cx="size / 2" :cy="size / 2" :r="r"
      fill="none"
      :stroke="color"
      :stroke-width="stroke"
      :stroke-dasharray="circ"
      :stroke-dashoffset="offset"
      stroke-linecap="round"
      style="transition: stroke-dashoffset 0.8s ease-out"
    />
    <text
      :x="size / 2" :y="size / 2"
      text-anchor="middle"
      dominant-baseline="central"
      :style="{
        transform: `rotate(90deg)`,
        transformOrigin: `${size / 2}px ${size / 2}px`,
        fill: 'var(--text1)',
        fontSize: size * 0.22 + 'px',
        fontWeight: 700,
        fontFamily: 'Inter, system-ui',
      }"
    >{{ pct }}%</text>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pct:    { type: Number, default: 0 },
  size:   { type: Number, default: 120 },
  stroke: { type: Number, default: 10 },
  color:  { type: String, default: 'var(--teal)' },
})

const r    = computed(() => (props.size - props.stroke) / 2)
const circ = computed(() => 2 * Math.PI * r.value)
const offset = computed(() => circ.value - (props.pct / 100) * circ.value)
</script>
