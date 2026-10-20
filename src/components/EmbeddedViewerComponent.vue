<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
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
  previewLink: {
    type: String,
    default: '',
  },
  // Further ISBNs of the same work; the viewer shows the first one Google lets it embed
  otherIsbns: {
    type: Array,
    default: () => [],
  },
  sourceName: {
    type: String,
    default: 'Google Books',
  },
})

const viewerCanvasRef = ref(null)
const isLoading = ref(true)
const isNotFound = ref(false)
const errorMessage = ref('')
let checkInterval = null
let viewerPoll = null
// True once the viewer has been created for the current book, so the load callback and the
// poll below can't both start it
let started = false

function renderViewer() {
  if (!viewerCanvasRef.value || started) return
  started = true

  const identifiers = []
  if (props.bookId) {
    identifiers.push(props.bookId)
  }
  if (props.isbn) {
    identifiers.push(`ISBN:${props.isbn}`)
  }
  for (const code of props.otherIsbns) {
    identifiers.push(`ISBN:${code}`)
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
    errorMessage.value = 'The preview didn’t load. Open the book’s page instead.'
  }
}

function initGoogleBooks() {
  stopTimers()
  started = false
  isLoading.value = true
  isNotFound.value = false
  errorMessage.value = ''

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
        errorMessage.value =
          'The Google Books preview service didn’t load. Check your connection and reload the page.'
      }
    }, 100)
    return
  }

  setupApi()
}

function stopTimers() {
  if (checkInterval) clearInterval(checkInterval)
  if (viewerPoll) clearInterval(viewerPoll)
  checkInterval = null
  viewerPoll = null
}

function setupApi() {
  if (window.google.books.DefaultViewer) {
    renderViewer()
    return
  }

  try {
    window.google.books.load()
  } catch {
    // Ignore if load was already initiated
  }
  try {
    window.google.books.setOnLoadCallback(renderViewer)
  } catch {
    // The poll below still starts the viewer
  }

  // Google's load callback does not always fire (seen on a cold page load), so also watch for
  // the viewer to appear, and give up with a clear message after 10 seconds
  let waited = 0
  if (viewerPoll) clearInterval(viewerPoll)
  viewerPoll = setInterval(() => {
    waited += 100
    if (window.google.books.DefaultViewer) {
      clearInterval(viewerPoll)
      viewerPoll = null
      renderViewer()
    } else if (waited >= 10000) {
      clearInterval(viewerPoll)
      viewerPoll = null
      isLoading.value = false
      errorMessage.value =
        'The Google Books preview service didn’t load. Check your connection and reload the page.'
    }
  }, 100)
}

onMounted(() => {
  initGoogleBooks()
})

onBeforeUnmount(stopTimers)

watch(
  () => [props.bookId, props.isbn, props.otherIsbns.join()],
  () => {
    initGoogleBooks()
  },
)
</script>

<template>
  <section class="details__section" aria-labelledby="preview-title">
    <h2 id="preview-title" class="details__section-title">Read a sample</h2>

    <div v-if="isLoading" class="el-notice el-notice--loading" role="status">
      <span class="el-loader"><BrandMark loading /></span>
      <p>Loading the preview from Google Books…</p>
    </div>

    <div v-if="isNotFound && !isLoading" class="el-notice el-notice--empty">
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

    <div v-if="errorMessage && !isLoading" class="el-notice el-notice--error" role="alert">
      <p>{{ errorMessage }}</p>
    </div>

    <div v-show="!isNotFound && !errorMessage" class="viewer-frame">
      <div ref="viewerCanvasRef" class="viewer-canvas"></div>
    </div>
  </section>
</template>
