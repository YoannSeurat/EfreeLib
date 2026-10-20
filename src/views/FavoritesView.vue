<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import BookShelf from '@/components/BookShelf.vue'
import BookCard from '@/components/BookCard.vue'
import StatusNotice from '@/components/StatusNotice.vue'

const store = useStore()

const favorites = computed(() => store.getters.favoriteBooks)
const count = computed(() => store.getters.favoriteCount)
</script>

<template>
  <header class="page-head">
    <h1 class="page-head__title spine-xl">Favourites</h1>
    <p class="page-head__aside label">{{ count }} favourite{{ count === 1 ? '' : 's' }}</p>
  </header>

  <StatusNotice v-if="count === 0" kind="empty" title="No favourites yet">
    Press the ring beside a book on your shelf to add it here.
    <template #action>
      <RouterLink to="/library" class="el-btn el-btn--outline">Go to your library</RouterLink>
    </template>
  </StatusNotice>

  <BookShelf v-else title="Kept close" :meta="`${count} on this shelf`">
    <BookCard v-for="book in favorites" :key="book.id" :book="book" />
  </BookShelf>
</template>
