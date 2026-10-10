<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookById } from '@/services/googleBooks.js'
import EmbeddedViewerComponent from '@/components/EmbeddedViewerComponent.vue'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()

const book = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

async function fetchBookDetails() {
  const bookId = route.params.id
  if (!bookId) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await getBookById(bookId)
    book.value = data
  } catch (error) {
    errorMessage.value =
      'Failed to load book details. Please try again. ' + (error.message || error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBookDetails()
})

watch(
  () => route.params.id,
  () => {
    fetchBookDetails()
  },
)

const store = useStore()

function isInLibrary(id) {
  return store.getters.isInLibrary(id)
}

function addToLibrary(book) {
  store.dispatch('addBook', book)
}

function isRead(id) {
  return store.getters.isRead(id)
}

function toggleRead(id) {
  store.dispatch('toggleRead', id)
}
</script>

<template>
  <div class="book-details-page">
    <button class="back-btn" @click="router.back()">← Back</button>

    <div v-if="isLoading" class="status-msg">Loading book details...</div>
    <div v-else-if="errorMessage" class="status-msg error-msg">{{ errorMessage }}</div>

    <div v-else-if="book" class="book-details">
      <div class="book-header">
        <img :src="book.cover" :alt="book.title" class="details-cover" />
        <div class="header-info">
          <h2>{{ book.title }}</h2>
          <p v-if="book.subtitle" class="book-subtitle">
            <em>{{ book.subtitle }}</em>
          </p>
          <p><strong>Author(s):</strong> {{ book.authors }}</p>
          <p><strong>Published:</strong> {{ book.year }}</p>
          <p v-if="book.publisher"><strong>Publisher:</strong> {{ book.publisher }}</p>
          <p v-if="book.pageCount"><strong>Pages:</strong> {{ book.pageCount }}</p>
          <p v-if="book.language"><strong>Language:</strong> {{ book.language.toUpperCase() }}</p>
          <p v-if="book.categories?.length">
            <strong>Categories:</strong> {{ book.categories.join(', ') }}
          </p>
          <p v-if="book.isbn"><strong>ISBN:</strong> {{ book.isbn }}</p>
          <p v-if="book.averageRating">
            <strong>Rating:</strong> {{ book.averageRating }} / 5 ({{ book.ratingsCount }} reviews)
          </p>
          <p v-if="book.previewLink">
            <a :href="book.previewLink" target="_blank" rel="noopener noreferrer">
              View on Google Books ↗
            </a>
          </p>
        </div>
      </div>

      <div class="line">
        <button :disabled="isInLibrary(book.id)" @click="addToLibrary(book)">
          {{ isInLibrary(book.id) ? 'In library' : 'Add to library' }}
        </button>
        <button v-if="isInLibrary(book.id)" @click="toggleRead(book.id)">
          {{ isRead(book.id) ? 'Mark as unread' : 'Mark as read' }}
        </button>
      </div>

      <div class="book-description">
        <h3>Description</h3>
        <div class="description-text" v-html="book.description"></div>
      </div>

      <!-- Embedded Google Books Viewer -->
      <EmbeddedViewerComponent
        :book-id="book.id"
        :isbn="book.isbn"
        :preview-link="book.previewLink"
      />
    </div>
  </div>
</template>
