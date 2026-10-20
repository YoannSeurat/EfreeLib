<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  bookId: {
    type: String,
    default: "",
  },
  isbn: {
    type: String,
    default: "",
  },
  iaId: {
    type: String,
    default: "",
  },
  previewLink: {
    type: String,
    default: "",
  },
});

const isLoading = ref(Boolean(props.iaId));

const embedUrl = computed(() => {
  if (!props.iaId) return "";
  return `https://archive.org/embed/${encodeURIComponent(props.iaId)}`;
});

function handleIframeLoad() {
  isLoading.value = false;
}

watch(
  () => props.iaId,
  (newIaId) => {
    isLoading.value = Boolean(newIaId);
  },
);
</script>

<template>
  <div class="embedded-viewer-section">
    <h3>Book Preview</h3>

    <div v-if="isLoading && embedUrl" class="viewer-status">
      Loading interactive preview from Open Library...
    </div>

    <div v-if="!embedUrl" class="viewer-status">
      <p>An interactive preview is not embeddable for this book on Open Library.</p>
      <p v-if="previewLink">
        <a :href="previewLink" target="_blank" rel="noopener noreferrer" class="inline-link">
          Open preview on Open Library ↗
        </a>
      </p>
    </div>

    <iframe
      v-if="embedUrl"
      :src="embedUrl"
      title="Open Library Book Preview"
      class="viewer-canvas"
      allowfullscreen
      @load="handleIframeLoad"
    ></iframe>
  </div>
</template>
