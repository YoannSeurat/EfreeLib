<script setup>
import { ref } from 'vue'
import { searchBooks } from '@/services/googleBooks.js'

const searchQuery = ref('')
const books = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const hasSearched = ref(false)

async function searchBooks_searchbar() {
  if (!searchQuery.value.trim()) return

  isLoading.value = true
  errorMessage.value = ''
  hasSearched.value = true

  try {
    const result = await searchBooks(searchQuery.value)
    books.value = result.books
  } catch (e) {
    errorMessage.value = 'Failed to fetch books. Please try again.\n' + e
    books.value = []
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <h1>EfreeLib</h1>

  <div class="line">
    <label for="search-bar">Search for any book : </label>

    <input
      id="search-bar"
      v-model="searchQuery"
      type="text"
      @keydown.enter="searchBooks_searchbar"
    />

    <button :disabled="isLoading" @click="searchBooks_searchbar">
      {{ isLoading ? 'Searching...' : 'Search' }}
    </button>
  </div>

  <div id="search-bar-response" class="status-container">
    <p v-if="isLoading">Searching books...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="hasSearched && books.length === 0">No books found.</p>
  </div>

  <div v-if="books.length > 0" class="books-grid">
    <article v-for="book in books" :key="book.id" class="book-card">
      <RouterLink
        :to="`/book/${book.id}`"
        class="book-cover-link"
        :title="`View details for ${book.title}`"
      >
        <img :src="book.cover" :alt="book.title" class="book-cover" />
      </RouterLink>
      <div class="book-info">
        <RouterLink :to="`/book/${book.id}`" class="book-title-link">
          <h3>{{ book.title }}</h3>
        </RouterLink>
        <p><strong>Author:</strong> {{ book.authors }}</p>
        <p><strong>Year:</strong> {{ book.year }}</p>
        <p>{{ book.description }}</p>
      </div>
    </article>
  </div>
</template>
