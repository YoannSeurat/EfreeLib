<script setup>
// Typeset cover for books Google Books has no image for: the mark printed in two inks.
import { computed } from 'vue'
import BrandMark from '@/components/BrandMark.vue'
import { coverVariant } from '@/utils/book.js'

const props = defineProps({
  bookId: { type: String, default: '' },
  title: { type: String, required: true },
  author: { type: String, default: '' },
  large: { type: Boolean, default: false },
})

// Whole mark, reel close up, lower ring with the arc's end and the baseline
const CROPS = ['-40 -40 590 396', '150 -60 380 380', '250 110 270 220']
const crop = computed(() => CROPS[coverVariant(props.bookId || props.title)])
</script>

<template>
  <div
    :class="['el-plain-cover', { 'el-plain-cover--lg': large }]"
    role="img"
    :aria-label="author ? `${title} by ${author}` : title"
  >
    <BrandMark
      print
      class="el-plain-cover__art"
      :view-box="crop"
      preserve-aspect-ratio="xMidYMid slice"
    />
    <p class="el-plain-cover__title">{{ title }}</p>
    <p v-if="author" class="el-plain-cover__author">{{ author }}</p>
    <slot />
  </div>
</template>
