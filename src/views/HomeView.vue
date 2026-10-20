<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchBooks, getFeaturedBooks } from '@/services/books.js'
import { hasCover } from '@/utils/book.js'
import MarkHero from '@/components/MarkHero.vue'
import BookShelf from '@/components/BookShelf.vue'
import BookCard from '@/components/BookCard.vue'
import BookCover from '@/components/BookCover.vue'
import StatusNotice from '@/components/StatusNotice.vue'
import QuoteBand from '@/components/QuoteBand.vue'

const route = useRoute()

// The search itself lives in the URL (?q=), set by the masthead field
const lastQuery = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))
const hasSearched = computed(() => Boolean(lastQuery.value))

const books = ref([])
const totalItems = ref(0)
const sourceName = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function runSearch() {
  const query = lastQuery.value
  books.value = []
  totalItems.value = 0
  errorMessage.value = ''
  if (!query) return

  isLoading.value = true
  try {
    const result = await searchBooks(query, 20)
    if (query !== lastQuery.value) return
    books.value = result.books
    totalItems.value = result.totalItems
    sourceName.value = result.sourceName
  } catch (e) {
    errorMessage.value = e.fullMessage || e.message || 'The search failed. Try again.'
  } finally {
    isLoading.value = false
  }
}

watch(lastQuery, runSearch, { immediate: true })

// A shelf of picks shown before the first search
const picks = ref([])
const picksSource = ref('')

onMounted(async () => {
  try {
    const result = await getFeaturedBooks(24)
    picks.value = result.books.filter((book) => hasCover(book.cover)).slice(0, 12)
    picksSource.value = result.sourceName
  } catch {
    picks.value = []
  }
})

const resultsMeta = computed(() => {
  const shown = books.value.length
  return `Showing ${shown} of ${totalItems.value.toLocaleString('en-US')} on ${sourceName.value}`
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
    No volumes match “{{ lastQuery }}” on {{ sourceName }}. Check the spelling, or try an author’s
    surname or an ISBN.
  </StatusNotice>

  <BookShelf
    v-else-if="hasSearched"
    :title="`Results for ${lastQuery}`"
    :meta="resultsMeta"
    layout="grid"
  >
    <BookCard v-for="book in books" :key="book.id" :book="book" />
  </BookShelf>

  <BookShelf
    v-else-if="picks.length"
    title="This month"
    :meta="`Trending on ${picksSource}`"
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
