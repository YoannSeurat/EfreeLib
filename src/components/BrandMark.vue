<script setup>
// The EfreeLib mark split into its parts. Coordinates match public/logo.svg exactly:
// 510 x 316 units, every stroke 15.5. Bars = structure, reel = state and motion, baseline = shelf.
import { computed } from 'vue'

const props = defineProps({
  // Turn the reel once when mounted
  spin: { type: Boolean, default: false },
  // Draw the bars and baseline in from the left when mounted
  draw: { type: Boolean, default: false },
  // Keep the reel turning (loading)
  loading: { type: Boolean, default: false },
  // Two-ink print variant, for typeset covers only
  print: { type: Boolean, default: false },
  // Indexes (0, 1, 2) of rings filled pink
  ringsOn: { type: Array, default: () => [] },
  viewBox: { type: String, default: '0 0 510 316' },
  preserveAspectRatio: { type: String, default: undefined },
  // Accessible name; leave empty when the mark is decorative
  label: { type: String, default: '' },
})

const RINGS = [
  [385.5, 60],
  [446.5, 171],
  [385.5, 263],
]

const classes = computed(() => [
  'el-mark',
  {
    'el-mark--spin-once': props.spin,
    'el-mark--draw': props.draw,
    'el-mark--loading': props.loading,
    'el-mark--print': props.print,
  },
])
</script>

<template>
  <svg
    :class="classes"
    :viewBox="viewBox"
    :preserveAspectRatio="preserveAspectRatio"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  >
    <rect class="el-mark__bar" x="0" y="0" width="291" height="15.5" />
    <rect class="el-mark__bar" x="0" y="100" width="291" height="15.5" />
    <rect class="el-mark__bar" x="0" y="200" width="291" height="15.5" />
    <g class="el-mark__reel">
      <path
        class="el-mark__arc"
        stroke-width="15.7"
        d="M339.5 8.35 A162.65 162.65 0 0 1 470.58 267.29"
      />
      <path
        class="el-mark__hub"
        stroke-width="15.54"
        d="M337.5 118.27 A52.73 52.73 0 0 1 337.5 223.73"
      />
      <circle
        v-for="([cx, cy], i) in RINGS"
        :key="i"
        :class="['el-mark__ring', { 'is-on': ringsOn.includes(i) }]"
        :cx="cx"
        :cy="cy"
        r="20.5"
        stroke-width="15"
      />
    </g>
    <rect class="el-mark__base" x="0" y="300.5" width="510" height="15.5" />
  </svg>
</template>
