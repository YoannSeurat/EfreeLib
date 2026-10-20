<script setup>
// The mark carrying the library's numbers: bars are counts, the arc's sweep is the read share,
// rings fill at each third. Geometry is the mark's own.
import { computed } from 'vue'

const props = defineProps({
  shelved: { type: Number, required: true },
  read: { type: Number, required: true },
})

const CX = 339.5
const CY = 171
const R = 162.65
const START = -90
const END = 36.3
const RINGS = [
  [385.5, 60],
  [446.5, 171],
  [385.5, 263],
]

const share = computed(() => (props.shelved ? props.read / props.shelved : 0))

const rows = computed(() =>
  [
    ['SHELVED', props.shelved, ''],
    ['READ', props.read, 'is-read'],
    ['TO READ', props.shelved - props.read, ''],
  ].map(([label, value, cls], i) => ({
    label,
    value,
    cls,
    y: i * 100,
    width: Math.max(15.5, props.shelved ? (291 * value) / props.shelved : 0),
  })),
)

function point(angle) {
  const a = (angle * Math.PI) / 180
  return `${(CX + R * Math.cos(a)).toFixed(2)} ${(CY + R * Math.sin(a)).toFixed(2)}`
}

function arc(from, to) {
  return `M${point(from)} A${R} ${R} 0 0 1 ${point(to)}`
}

const trackPath = arc(START, END)
const readPath = computed(() => arc(START, START + (END - START) * share.value))
const percent = computed(() => Math.round(share.value * 100))
</script>

<template>
  <svg
    class="el-dial"
    viewBox="0 -40 510 445"
    role="img"
    :aria-label="`${read} of ${shelved} books read`"
  >
    <template v-for="row in rows" :key="row.label">
      <text class="lbl" x="0" :y="row.y - 14">{{ row.label }} {{ row.value }}</text>
      <rect class="el-mark__bar is-track" x="0" :y="row.y" width="291" height="15.5" />
      <rect :class="['el-mark__bar', row.cls]" x="0" :y="row.y" :width="row.width" height="15.5" />
    </template>
    <g class="el-mark__reel">
      <path class="el-mark__arc is-track" stroke-width="15.7" :d="trackPath" />
      <path v-if="share > 0" class="el-mark__arc is-read" stroke-width="15.7" :d="readPath" />
      <path
        class="el-mark__hub"
        stroke-width="15.54"
        d="M337.5 118.27 A52.73 52.73 0 0 1 337.5 223.73"
      />
      <circle
        v-for="([cx, cy], i) in RINGS"
        :key="i"
        :class="['el-mark__ring', { 'is-on': share >= (i + 1) / 3 - 1e-9 }]"
        :cx="cx"
        :cy="cy"
        r="20.5"
        stroke-width="15"
      />
    </g>
    <rect class="el-mark__base" x="0" y="300.5" width="510" height="15.5" />
    <text class="lbl" x="0" y="372">READ SO FAR</text>
    <text class="num is-read" x="510" y="392" text-anchor="end">{{ percent }}%</text>
  </svg>
</template>
