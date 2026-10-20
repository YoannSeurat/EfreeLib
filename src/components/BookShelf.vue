<script setup>
// A section built like the mark: title on a bar, count in the reel column, books on the baseline.
defineProps({
  title: { type: String, required: true },
  meta: { type: String, default: '' },
  // 'grid' wraps book cards; 'row' is one row of covers standing on the baseline
  layout: { type: String, default: 'grid' },
  // Optional id so links can jump here (/library#read)
  anchor: { type: String, default: '' },
})

const id = `shelf-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <section :id="anchor || undefined" class="el-shelf" :aria-labelledby="id">
    <div class="el-shelf__head">
      <h2 :id="id" class="el-shelf__title">{{ title }}</h2>
      <span v-if="meta" class="el-shelf__meta">{{ meta }}</span>
    </div>
    <div :class="layout === 'row' ? 'el-shelf__row' : 'el-shelf__books'">
      <slot />
    </div>
  </section>
</template>
