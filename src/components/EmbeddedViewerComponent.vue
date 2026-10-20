<script setup>
import { ref, computed, watch } from 'vue'
import BrandMark from '@/components/BrandMark.vue'

const props = defineProps({
  bookId: {
    type: String,
    default: '',
  },
  isbn: {
    type: String,
    default: '',
  },
  iaId: {
    type: String,
    default: '',
  },
  previewLink: {
    type: String,
    default: '',
  },
  sourceName: {
    type: String,
    default: 'Open Library',
  },
})

const isLoading = ref(Boolean(props.iaId))

const embedUrl = computed(() => {
  if (!props.iaId) return ''
  return `https://archive.org/embed/${encodeURIComponent(props.iaId)}`
})

function handleIframeLoad() {
  isLoading.value = false
}

watch(
  () => props.iaId,
  (newIaId) => {
    isLoading.value = Boolean(newIaId)
  },
)
</script>

<template>
  <section class="details__section" aria-labelledby="preview-title">
    <h2 id="preview-title" class="details__section-title">Read a sample</h2>

    <div v-if="isLoading && embedUrl" class="el-notice el-notice--loading" role="status">
      <span class="el-loader"><BrandMark loading /></span>
      <p>Loading the preview from {{ sourceName }}…</p>
    </div>

    <div v-if="!embedUrl" class="el-notice el-notice--empty">
      <p>A preview of this book can’t be shown here.</p>
      <a
        v-if="previewLink"
        class="el-btn el-btn--outline"
        :href="previewLink"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open on {{ sourceName }}
      </a>
    </div>

    <div v-if="embedUrl" class="viewer-frame">
      <iframe
        :src="embedUrl"
        title="Open Library Book Preview"
        class="viewer-canvas"
        allowfullscreen
        @load="handleIframeLoad"
      ></iframe>
    </div>
  </section>
</template>
