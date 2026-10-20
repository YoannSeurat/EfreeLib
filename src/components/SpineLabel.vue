<script setup>
import { computed } from 'vue'
import { callNumber } from '@/utils/book.js'

const props = defineProps({
  book: { type: Object, required: true },
})

const parts = computed(() => callNumber(props.book))
</script>

<template>
  <span class="el-spine-label" :aria-label="`Call number ${parts.join(' ')}`">
    <span v-for="part in parts" :key="part">{{ part }}</span>
  </span>
</template>
