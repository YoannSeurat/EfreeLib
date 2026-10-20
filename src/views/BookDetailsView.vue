<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getBookById } from '@/services/books.js'
import { isOpenLibraryId } from '@/services/openLibrary.js'
import EmbeddedViewerComponent from '@/components/EmbeddedViewerComponent.vue'
import BookCover from '@/components/BookCover.vue'
import CatalogCard from '@/components/CatalogCard.vue'
import ReadStamp from '@/components/ReadStamp.vue'
import StatusNotice from '@/components/StatusNotice.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const book = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

async function fetchBookDetails() {
  const bookId = route.params.id
  if (!bookId) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    book.value = await getBookById(bookId)
  } catch (error) {
    // The catalogue is out of reach, but a book on the shelf still has its own copy
    const copy = store.getters.libraryBooks.find((b) => b.id === bookId)
    if (copy) {
      book.value = {
        subtitle: '',
        isbn: '',
        publisher: '',
        pageCount: null,
        language: '',
        averageRating: null,
        ratingsCount: 0,
        previewLink: '',
        sourceName: isOpenLibraryId(bookId) ? 'Open Library' : 'Google Books',
        ...copy,
      }
    } else {
      book.value = null
      errorMessage.value = error.fullMessage || error.message || 'The book could not be loaded.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBookDetails()
})

watch(
  () => route.params.id,
  () => {
    fetchBookDetails()
  },
)

const saved = computed(() =>
  book.value ? store.getters.libraryBooks.find((b) => b.id === book.value.id) : null,
)
const inLibrary = computed(() => Boolean(saved.value))
const isRead = computed(() => saved.value?.read ?? false)
const isFavorite = computed(() => saved.value?.favorite ?? false)

function addToLibrary() {
  store.dispatch('addBook', book.value)
}

function toggleRead() {
  store.dispatch('toggleRead', book.value.id)
}

function toggleFavorite() {
  store.dispatch('toggleFavorite', book.value.id)
}

function removeFromLibrary() {
  store.dispatch('removeBook', book.value.id)
}
</script>

<template>
  <div class="details">
    <button class="el-btn el-btn--quiet details__back" type="button" @click="router.back()">
      Back
    </button>

    <StatusNotice v-if="isLoading" kind="loading">Fetching the catalogue card…</StatusNotice>

    <StatusNotice v-else-if="errorMessage" kind="error" title="This book didn’t load">
      {{ errorMessage }}
      <template #action>
        <button class="el-btn" type="button" @click="fetchBookDetails">Try again</button>
      </template>
    </StatusNotice>

    <template v-else-if="book">
      <div class="details__grid">
        <div class="details__main">
          <h1 class="details__title spine-l">{{ book.title }}</h1>
          <p v-if="book.subtitle" class="details__subtitle">{{ book.subtitle }}</p>
          <p class="details__byline byline">{{ book.authors }}</p>

          <div class="details__actions">
            <button v-if="!inLibrary" class="el-btn" type="button" @click="addToLibrary">
              Shelve
            </button>
            <template v-else>
              <button class="el-btn" type="button" @click="toggleRead">
                {{ isRead ? 'Mark as unread' : 'Mark as read' }}
              </button>
              <button
                class="el-ring-btn"
                type="button"
                :aria-pressed="isFavorite ? 'true' : 'false'"
                :aria-label="isFavorite ? 'Remove from favourites' : 'Add to favourites'"
                @click="toggleFavorite"
              ></button>
              <button class="el-btn el-btn--quiet" type="button" @click="removeFromLibrary">
                Remove from shelf
              </button>
            </template>
            <Transition name="stamp">
              <ReadStamp v-if="isRead" :read-at="saved?.readAt || ''" />
            </Transition>
          </div>

          <CatalogCard :book="book" />
        </div>

        <div class="details__aside">
          <div class="details__stand">
            <BookCover :book="book" large />
          </div>
          <a
            v-if="book.previewLink"
            class="label"
            :href="book.previewLink"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on {{ book.sourceName || 'Google Books' }}
          </a>
        </div>
      </div>

      <section class="details__section" aria-labelledby="about-title">
        <h2 id="about-title" class="details__section-title">About this book</h2>
        <!-- Descriptions arrive as simple HTML: Google's own, or Open Library text escaped in the service -->
        <div class="details__description body" v-html="book.description"></div>
      </section>

      <EmbeddedViewerComponent
        :book-id="isOpenLibraryId(book.id) ? '' : book.id"
        :isbn="book.isbn"
        :other-isbns="book.otherIsbns || []"
        :preview-link="book.previewLink"
        :source-name="book.sourceName || 'Google Books'"
      />
    </template>
  </div>
</template>
