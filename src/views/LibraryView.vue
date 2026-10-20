<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import BookShelf from '@/components/BookShelf.vue'
import BookCard from '@/components/BookCard.vue'
import ReadingDial from '@/components/ReadingDial.vue'
import StatusNotice from '@/components/StatusNotice.vue'

const store = useStore()

const books = computed(() => store.getters.libraryBooks)
const count = computed(() => store.getters.libraryCount)
const readCount = computed(() => store.getters.readCount)
const favoriteCount = computed(() => store.getters.favoriteCount)
const averageRating = computed(() => store.getters.averageRating)

const librarySearch = ref('')
const statusFilter = ref('all')
const favoriteOnly = ref(false)
const sortBy = ref('addedAt')

function sortBooks(list, defaultReadSort = false) {
  return [...list].sort((a, b) => {
    if (sortBy.value === 'title') {
      return (a.title || '').localeCompare(b.title || '')
    }
    if (sortBy.value === 'year') {
      const yearA = parseInt(a.year, 10) || 0
      const yearB = parseInt(b.year, 10) || 0
      return yearB - yearA
    }
    if (defaultReadSort && a.readAt && b.readAt) {
      return b.readAt.localeCompare(a.readAt)
    }
    const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0
    const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0
    return dateB - dateA
  })
}

const filteredBooks = computed(() => {
  const query = librarySearch.value.trim().toLowerCase()

  return books.value.filter((book) => {
    if (query) {
      const matchesTitle = book.title?.toLowerCase().includes(query)
      const matchesAuthor = book.authors?.toLowerCase().includes(query)
      if (!matchesTitle && !matchesAuthor) return false
    }

    if (statusFilter.value === 'read' && !book.read) return false
    if (statusFilter.value === 'unread' && book.read) return false
    if (favoriteOnly.value && !book.favorite) return false

    return true
  })
})

const toRead = computed(() => sortBooks(filteredBooks.value.filter((book) => !book.read)))
const read = computed(() =>
  sortBooks(
    filteredBooks.value.filter((book) => book.read),
    true,
  ),
)

function volumes(n) {
  return `${n} volume${n === 1 ? '' : 's'}`
}
</script>

<template>
  <header class="page-head">
    <h1 class="page-head__title spine-xl">Your library</h1>
    <p class="page-head__aside label">
      {{ volumes(count) }} · {{ readCount }} read · {{ favoriteCount }} favourite{{
        favoriteCount === 1 ? '' : 's'
      }}<template v-if="averageRating !== null"> · Avg {{ averageRating }} / 5 ★</template>
    </p>
  </header>

  <StatusNotice v-if="count === 0" kind="empty" title="Your shelf is empty">
    Search for a book and press Shelve to keep it here.
    <template #action>
      <RouterLink to="/" class="el-btn el-btn--outline">Search the catalogue</RouterLink>
    </template>
  </StatusNotice>

  <template v-else>
    <section class="library-summary" aria-label="Reading progress">
      <ReadingDial :shelved="count" :read="readCount" />
      <p class="library-summary__note label">
        Mark a book as read and it gets stamped with the date.
      </p>
    </section>

    <section class="library-controls" aria-label="Filter and sort library">
      <input
        v-model="librarySearch"
        type="search"
        class="el-input library-controls__search"
        placeholder="Filter by title or author…"
        aria-label="Search in library"
      />

      <label class="library-controls__field label">
        <span>Status</span>
        <select v-model="statusFilter" class="el-select">
          <option value="all">All</option>
          <option value="unread">To read</option>
          <option value="read">Read</option>
        </select>
      </label>

      <label class="library-controls__field label">
        <span>Sort by</span>
        <select v-model="sortBy" class="el-select">
          <option value="addedAt">Date added</option>
          <option value="title">Title</option>
          <option value="year">Year</option>
        </select>
      </label>

      <label class="library-controls__check label">
        <input v-model="favoriteOnly" type="checkbox" />
        <span>Favourites only</span>
      </label>
    </section>

    <StatusNotice
      v-if="filteredBooks.length === 0"
      kind="empty"
      title="Nothing on your shelf matches"
    >
      Try clearing the search or changing the active filter.
    </StatusNotice>

    <BookShelf v-if="toRead.length" anchor="to-read" title="To read" :meta="volumes(toRead.length)">
      <BookCard v-for="book in toRead" :key="book.id" :book="book" />
    </BookShelf>

    <BookShelf v-if="read.length" anchor="read" title="Read" :meta="volumes(read.length)">
      <BookCard v-for="book in read" :key="book.id" :book="book" />
    </BookShelf>
  </template>
</template>
