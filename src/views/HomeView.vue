<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { searchBooks } from '@/services/openLibrary.js'

const store = useStore()

function isInLibrary(id) {
  return store.getters.isInLibrary(id)
}

function addToLibrary(book) {
  store.dispatch('addBook', book)
}

const searchQuery = ref('')
const activeQuery = ref('')
const books = ref([])
const totalItems = ref(0)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const errorMessage = ref('')
const hasSearched = ref(false)

const canLoadMore = computed(() => books.value.length > 0 && books.value.length < totalItems.value)

async function handleSearch() {
  const query = searchQuery.value.trim()
  if (!query) return

  isLoading.value = true
  errorMessage.value = ''
  hasSearched.value = true
  activeQuery.value = query

  try {
    const result = await searchBooks(query, 10, 0)
    books.value = result.books
    totalItems.value = result.totalItems
  } catch (e) {
    errorMessage.value = 'Failed to fetch books. Please try again.\n' + e
    books.value = []
    totalItems.value = 0
  } finally {
    isLoading.value = false
  }
}

async function loadMoreBooks() {
  if (!activeQuery.value || isLoadingMore.value) return

  isLoadingMore.value = true
  errorMessage.value = ''

  try {
    const result = await searchBooks(activeQuery.value, 10, books.value.length)
    const existingIds = new Set(books.value.map((b) => b.id))
    const newBooks = result.books.filter((b) => b && !existingIds.has(b.id))
    books.value = [...books.value, ...newBooks]
    if (result.books.length === 0) {
      totalItems.value = books.value.length
    }
  } catch (e) {
    errorMessage.value = 'Failed to load more books. Please try again.\n' + e
  } finally {
    isLoadingMore.value = false
  }
}
</script>

<template>
  <h1>EfreeLib</h1>

  <div class="line">
    <label for="search-bar">Search for any book : </label>

    <input id="search-bar" v-model="searchQuery" type="text" @keydown.enter="handleSearch" />

    <button :disabled="isLoading" @click="handleSearch">
      {{ isLoading ? 'Searching...' : 'Search' }}
    </button>
  </div>

  <div id="search-bar-response" class="status-container">
    <p v-if="isLoading">Searching books...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="hasSearched && books.length === 0">No books found.</p>
  </div>

  <div v-if="books.length > 0" class="books-grid">
    <article v-for="book in books" :key="book.id" class="book-card line">
      <div>
        <RouterLink
          :to="`/book/${book.id}`"
          class="book-cover-link"
          :title="`View details for ${book.title}`"
        >
          <img :src="book.cover" :alt="book.title" class="book-cover" />
        </RouterLink>
      </div>
      <div class="book-info">
        <RouterLink :to="`/book/${book.id}`" class="book-title-link">
          <h3>{{ book.title }}</h3>
        </RouterLink>
        <p><strong>Author:</strong> {{ book.authors }}</p>
        <p><strong>Year:</strong> {{ book.year }}</p>
        <p>{{ book.description }}</p>
        <button :disabled="isInLibrary(book.id)" @click="addToLibrary(book)">
          {{ isInLibrary(book.id) ? 'In library' : 'Add to library' }}
        </button>
      </div>
    </article>

    <div v-if="canLoadMore" class="load-more-container">
      <button :disabled="isLoadingMore" @click="loadMoreBooks">
        {{ isLoadingMore ? 'Loading more...' : 'Load more' }}
      </button>
    </div>
  </div>
</template>
