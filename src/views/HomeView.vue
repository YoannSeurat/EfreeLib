<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchBooks } from '@/services/openLibrary.js'
import { hasCover } from '@/utils/book.js'
import MarkHero from '@/components/MarkHero.vue'
import BookShelf from '@/components/BookShelf.vue'
import BookCard from '@/components/BookCard.vue'
import BookCover from '@/components/BookCover.vue'
import StatusNotice from '@/components/StatusNotice.vue'
import QuoteBand from '@/components/QuoteBand.vue'

const SOURCE_NAME = 'Open Library'
const PAGE_SIZE = 20

const route = useRoute()

// The search itself lives in the URL (?q=), set by the masthead field
const lastQuery = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))
const hasSearched = computed(() => Boolean(lastQuery.value))

const books = ref([])
const totalItems = ref(0)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const errorMessage = ref('')

const canLoadMore = computed(() => books.value.length > 0 && books.value.length < totalItems.value)

async function runSearch() {
  const query = lastQuery.value
  books.value = []
  totalItems.value = 0
  errorMessage.value = ''
  if (!query) return

  isLoading.value = true
  try {
    const result = await searchBooks(query, PAGE_SIZE, 0)
    if (query !== lastQuery.value) return
    books.value = result.books.filter(Boolean)
    totalItems.value = result.totalItems
  } catch (e) {
    errorMessage.value = e.fullMessage || e.message || 'The search failed. Try again.'
  } finally {
    isLoading.value = false
  }
}

async function loadMoreBooks() {
  const query = lastQuery.value
  if (!query || isLoadingMore.value) return

  isLoadingMore.value = true
  errorMessage.value = ''

  try {
    const result = await searchBooks(query, PAGE_SIZE, books.value.length)
    if (query !== lastQuery.value) return
    const existingIds = new Set(books.value.map((b) => b.id))
    const newBooks = result.books.filter((b) => b && !existingIds.has(b.id))
    books.value = [...books.value, ...newBooks]
    if (result.books.length === 0) {
      totalItems.value = books.value.length
    }
  } catch (e) {
    errorMessage.value = e.fullMessage || e.message || 'Failed to load more books. Try again.'
  } finally {
    isLoadingMore.value = false
  }
}

watch(lastQuery, runSearch, { immediate: true })

// A shelf of picks shown before the first search
const picks = ref([])

onMounted(async () => {
  try {
    const result = await searchBooks('subject:fiction', 24, 0)
    picks.value = result.books.filter((book) => book && hasCover(book.cover)).slice(0, 12)
  } catch {
    picks.value = []
  }
})

const resultsMeta = computed(() => {
  const shown = books.value.length
  return `Showing ${shown} of ${totalItems.value.toLocaleString('en-US')} on ${SOURCE_NAME}`
})
</script>

<template>
  <section :class="['home-intro', { 'is-compact': hasSearched }]" aria-label="EfreeLib">
    <MarkHero :compact="hasSearched" />
    <p class="lede home-lede">
      Search millions of volumes, shelve the ones you want, and stamp them when you finish.
    </p>
  </section>

  <StatusNotice v-if="isLoading" kind="loading">
    Searching the catalogue for “{{ lastQuery }}”…
  </StatusNotice>

  <StatusNotice v-else-if="errorMessage" kind="error" title="The catalogue didn’t answer">
    {{ errorMessage }}
    <template #action>
      <button class="el-btn" type="button" @click="runSearch">Search again</button>
    </template>
  </StatusNotice>

  <StatusNotice v-else-if="hasSearched && books.length === 0" kind="empty" title="Nothing matches">
    No volumes match “{{ lastQuery }}” on {{ SOURCE_NAME }}. Check the spelling, or try an author’s
    surname or an ISBN.
  </StatusNotice>

  <template v-else-if="hasSearched">
    <BookShelf :title="`Results for ${lastQuery}`" :meta="resultsMeta" layout="grid">
      <BookCard v-for="book in books" :key="book.id" :book="book" />
    </BookShelf>

    <div v-if="canLoadMore" class="home-more">
      <button
        class="el-btn el-btn--outline"
        type="button"
        :disabled="isLoadingMore"
        @click="loadMoreBooks"
      >
        {{ isLoadingMore ? 'Loading more…' : 'Load more volumes' }}
      </button>
    </div>
  </template>

  <BookShelf
    v-else-if="picks.length"
    title="Featured shelf"
    :meta="`Catalogue picks on ${SOURCE_NAME}`"
    layout="row"
  >
    <RouterLink
      v-for="book in picks"
      :key="book.id"
      :to="`/book/${book.id}`"
      :aria-label="`${book.title} by ${book.authors}`"
    >
      <BookCover :book="book" riso />
    </RouterLink>
  </BookShelf>

  <QuoteBand v-if="!hasSearched" />
</template>
