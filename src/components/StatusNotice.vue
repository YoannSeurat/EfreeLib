<script setup>
// Loading, empty and error states.
import BrandMark from '@/components/BrandMark.vue'

defineProps({
  kind: { type: String, default: 'loading' }, // 'loading' | 'empty' | 'error'
  title: { type: String, default: '' },
})
</script>

<template>
  <div v-if="kind === 'loading'" class="el-notice el-notice--loading" role="status">
    <span class="el-loader"><BrandMark loading /></span>
    <p><slot /></p>
  </div>
  <div
    v-else
    :class="['el-notice', kind === 'error' ? 'el-notice--error' : 'el-notice--empty']"
    :role="kind === 'error' ? 'alert' : undefined"
  >
    <h2 v-if="title" class="el-notice__title">{{ title }}</h2>
    <p><slot /></p>
    <slot name="action" />
  </div>
</template>
