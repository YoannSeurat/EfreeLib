<script setup>
// A book on a shelf: cover, title, author, and its shelf state or the Shelve action.
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import BookCover from '@/components/BookCover.vue'

const props = defineProps({
  book: { type: Object, required: true },
  riso: { type: Boolean, default: false },
})

const store = useStore()

const saved = computed(() => store.getters.libraryBooks.find((b) => b.id === props.book.id))
const inLibrary = computed(() => Boolean(saved.value))
const isRead = computed(() => saved.value?.read ?? false)
const isFavorite = computed(() => saved.value?.favorite ?? false)
const link = computed(() => `/book/${props.book.id}`)

// Plays the drop-onto-the-shelf animation right after Shelve
const landing = ref(false)

function shelve() {
  store.dispatch('addBook', props.book)
  landing.value = true
  setTimeout(() => (landing.value = false), 700)
}

function toggleFavorite() {
  store.dispatch('toggleFavorite', props.book.id)
}
</script>

<template>
  <article :class="['el-book', { 'is-landing': landing }]">
    <RouterLink :to="link" class="el-book__cover-link" tabindex="-1" aria-hidden="true">
      <BookCover :book="book" :riso="riso" :stamped="isRead" :read-at="saved?.readAt || ''" />
    </RouterLink>
    <div class="el-book__body">
      <h3 class="el-book__title">
        <RouterLink :to="link">{{ book.title }}</RouterLink>
      </h3>
      <p class="el-book__author">{{ book.authors }}</p>
      <div class="el-book__foot">
        <button v-if="!inLibrary" class="el-btn el-btn--outline" type="button" @click="shelve">
          Shelve
        </button>
        <template v-else>
          <span v-if="isRead" class="el-tag el-tag--read"><span class="el-ring"></span>Read</span>
          <span v-else class="el-tag el-tag--unread"><span class="el-ring"></span>To read</span>
          <button
            class="el-ring-btn"
            type="button"
            :aria-pressed="isFavorite ? 'true' : 'false'"
            :aria-label="
              isFavorite
                ? `Remove ${book.title} from favourites`
                : `Add ${book.title} to favourites`
            "
            @click="toggleFavorite"
          ></button>
        </template>
      </div>
    </div>
  </article>
</template>
