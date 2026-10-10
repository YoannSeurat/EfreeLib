<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const books = computed(() => store.getters.libraryBooks)
const count = computed(() => store.getters.libraryCount)

function removeFromLibrary(id) {
  store.dispatch('removeBook', id)
}
</script>

<template>
  <h1>Personal Library</h1>

  <p v-if="count === 0" class="status-msg">
    Your library is empty. <RouterLink to="/" class="inline-link">Search for books</RouterLink> to
    add some.
  </p>

  <div v-else class="books-grid">
    <p class="status-msg">{{ count }} book{{ count > 1 ? 's' : '' }} in your library</p>

    <article v-for="book in books" :key="book.id" class="book-card line">
      <div>
        <RouterLink :to="`/book/${book.id}`" :title="`View details for ${book.title}`">
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
        <button @click="removeFromLibrary(book.id)">Remove</button>
      </div>
    </article>
  </div>
</template>
