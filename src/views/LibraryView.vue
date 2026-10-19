<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import BookShelf from '@/components/BookShelf.vue'
import BookCard from '@/components/BookCard.vue'
import ReadingDial from '@/components/ReadingDial.vue'
import StatusNotice from '@/components/StatusNotice.vue'

const store = useStore()

const books = computed(() => store.getters.libraryBooks)
const count = computed(() => store.getters.libraryCount)
const readCount = computed(() => store.getters.readCount)

const toRead = computed(() => books.value.filter((book) => !book.read))
const read = computed(() =>
  books.value
    .filter((book) => book.read)
    .sort((a, b) => (b.readAt || '').localeCompare(a.readAt || '')),
)

function volumes(n) {
  return `${n} volume${n === 1 ? '' : 's'}`
}
</script>

<template>
  <header class="page-head">
    <h1 class="page-head__title spine-xl">Your library</h1>
    <p class="page-head__aside label">{{ volumes(count) }}, {{ readCount }} read</p>
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

    <BookShelf v-if="toRead.length" anchor="to-read" title="To read" :meta="volumes(toRead.length)">
      <BookCard v-for="book in toRead" :key="book.id" :book="book" />
    </BookShelf>

    <BookShelf v-if="read.length" anchor="read" title="Read" :meta="volumes(read.length)">
      <BookCard v-for="book in read" :key="book.id" :book="book" />
    </BookShelf>
  </template>
</template>
