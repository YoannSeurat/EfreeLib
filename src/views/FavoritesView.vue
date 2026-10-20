<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const favoriteBooks = computed(() => store.getters.favoriteBooks)

function toggleFavorite(id) {
  store.dispatch('toggleFavorite', id)
}
</script>

<template>
  <h1>Favorites</h1>

  <p v-if="favoriteBooks.length === 0" class="status-msg">
    You have no favorite books yet.
    <RouterLink to="/library" class="inline-link">View your library</RouterLink>
    to add some.
  </p>

  <div v-else class="books-grid">
    <article v-for="book in favoriteBooks" :key="book.id" class="book-card line">
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
        <button @click="toggleFavorite(book.id)">Remove from favorites</button>
      </div>
    </article>
  </div>
</template>
