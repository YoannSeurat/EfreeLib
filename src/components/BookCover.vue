<script setup>
// A book's cover standing on a shelf: the real image, or a typeset cover when there is none.
import { computed } from 'vue'
import PlainCover from '@/components/PlainCover.vue'
import ReadStamp from '@/components/ReadStamp.vue'
import { hasCover } from '@/utils/book.js'

const props = defineProps({
  book: { type: Object, required: true },
  large: { type: Boolean, default: false },
  // Riso duotone: grey on pink until hovered. One shelf per page at most.
  riso: { type: Boolean, default: false },
  // Show the Read stamp
  stamped: { type: Boolean, default: false },
  readAt: { type: String, default: '' },
})

const showImage = computed(() => hasCover(props.book.cover))
</script>

<template>
  <div v-if="showImage" :class="['el-cover', { 'el-cover--lg': large, 'el-cover--riso': riso }]">
    <img :src="book.cover" :alt="`Cover of ${book.title}`" loading="lazy" />
    <Transition name="stamp">
      <ReadStamp v-if="stamped" :read-at="readAt" />
    </Transition>
  </div>
  <PlainCover v-else :book-id="book.id" :title="book.title" :author="book.authors" :large="large">
    <Transition name="stamp">
      <ReadStamp v-if="stamped" :read-at="readAt" />
    </Transition>
  </PlainCover>
</template>
