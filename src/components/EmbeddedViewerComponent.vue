<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  bookId: {
    type: String,
    default: '',
  },
  isbn: {
    type: String,
    default: '',
  },
  previewLink: {
    type: String,
    default: '',
  },
})

const viewerCanvasRef = ref(null)
const isLoading = ref(true)
const isNotFound = ref(false)
const errorMessage = ref('')
let checkInterval = null

function renderViewer() {
  if (!viewerCanvasRef.value) return

  const identifiers = []
  if (props.bookId) {
    identifiers.push(props.bookId)
  }
  if (props.isbn) {
    identifiers.push(`ISBN:${props.isbn}`)
  }

  if (identifiers.length === 0) {
    isLoading.value = false
    isNotFound.value = true
    return
  }

  isLoading.value = true
  isNotFound.value = false
  errorMessage.value = ''
  viewerCanvasRef.value.innerHTML = ''

  try {
    const viewer = new window.google.books.DefaultViewer(viewerCanvasRef.value)

    // DefaultViewer can receive a string identifier or an array of identifiers
    const target = identifiers.length === 1 ? identifiers[0] : identifiers

    viewer.load(
      target,
      () => {
        // Not found callback: executed if preview is not available or not embeddable
        isLoading.value = false
        isNotFound.value = true
      },
      () => {
        // Success callback: executed when the viewer loads successfully
        isLoading.value = false
        isNotFound.value = false
      },
    )
  } catch (err) {
    console.error('Failed to initialize Google Books DefaultViewer:', err)
    isLoading.value = false
    errorMessage.value = 'Failed to load book preview.'
  }
}

function initGoogleBooks() {
  // If the Google Books script is not ready yet, wait for it
  if (typeof window.google === 'undefined' || !window.google.books) {
    let attempts = 0
    if (checkInterval) clearInterval(checkInterval)
    checkInterval = setInterval(() => {
      attempts++
      if (typeof window.google !== 'undefined' && window.google.books) {
        clearInterval(checkInterval)
        checkInterval = null
        setupApi()
      } else if (attempts >= 40) {
        clearInterval(checkInterval)
        checkInterval = null
        isLoading.value = false
        errorMessage.value = 'Google Books preview service could not be loaded.'
      }
    }, 100)
    return
  }

  setupApi()
}

function setupApi() {
  if (window.google.books.DefaultViewer) {
    renderViewer()
  } else {
    try {
      window.google.books.load()
    } catch {
      // Ignore if load was already initiated
    }
    window.google.books.setOnLoadCallback(renderViewer)
  }
}

onMounted(() => {
  initGoogleBooks()
})

onBeforeUnmount(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})

watch(
  () => [props.bookId, props.isbn],
  () => {
    initGoogleBooks()
  },
)
</script>

<template>
  <div class="embedded-viewer-section">
    <h3>Book Preview</h3>

    <div v-if="isLoading" class="viewer-status">
      Loading interactive preview from Google Books...
    </div>

    <div v-if="isNotFound && !isLoading" class="viewer-status">
      <p>An interactive preview is not embeddable for this book on Google Books.</p>
    </div>

    <div v-if="errorMessage && !isLoading" class="viewer-status">
      {{ errorMessage }}
    </div>

    <div v-show="!isNotFound && !errorMessage" ref="viewerCanvasRef" class="viewer-canvas"></div>
  </div>
</template>
