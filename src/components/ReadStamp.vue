<script setup>
import { computed } from 'vue'
import { stampDate } from '@/utils/book.js'

const props = defineProps({
  // ISO date the book was marked read; older saved books have none
  readAt: { type: String, default: '' },
})

const date = computed(() => stampDate(props.readAt))
</script>

<template>
  <span class="el-stamp" :aria-label="date ? `Read on ${date}` : 'Read'">
    Read<small v-if="date">{{ date }}</small>
  </span>
</template>
