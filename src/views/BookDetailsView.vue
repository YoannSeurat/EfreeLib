<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getBookById } from '@/services/openLibrary.js'
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
const noteDraft = ref('')

async function fetchBookDetails() {
  const rawId = route.params.id
  if (!rawId) return
  const bookId = String(rawId).replace(/^ol:/, '')

  isLoading.value = true
  errorMessage.value = ''

  try {
    book.value = await getBookById(bookId)
    noteDraft.value = store.getters.getBookNote(book.value?.id || bookId)
  } catch (error) {
    // The catalogue is out of reach, but a book on the shelf still has its own copy
    const copy = store.getters.libraryBooks.find((b) => b.id === bookId || b.id === rawId)
    if (copy) {
      book.value = {
        subtitle: '',
        isbn: '',
        iaId: '',
        publisher: '',
        pageCount: null,
        language: '',
        averageRating: null,
        ratingsCount: 0,
        previewLink: `https://openlibrary.org/works/${bookId}`,
        ...copy,
      }
      noteDraft.value = store.getters.getBookNote(copy.id)
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
const personalRating = computed(() => (book.value ? store.getters.getBookRating(book.value.id) : 0))

const descriptionParagraphs = computed(() => {
  const raw = book.value?.description || 'No description available.'
  const body = String(raw).split(/\r?\n\s*-{4,}/)[0]
  const parts = body
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s*\r?\n\s*/g, ' ').trim())
    .filter(Boolean)
  return parts.length ? parts : ['No description available.']
})

function addToLibrary() {
  if (!book.value) return
  store.dispatch('addBook', book.value)
  noteDraft.value = store.getters.getBookNote(book.value.id)
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

function setRating(star) {
  if (!book.value) return
  store.dispatch('setRating', { id: book.value.id, rating: star })
}

function saveNote() {
  if (!book.value) return
  const trimmed = noteDraft.value.trim()
  noteDraft.value = trimmed
  store.dispatch('setNote', { id: book.value.id, note: trimmed })
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

          <div v-if="inLibrary" class="details__personal" aria-label="Personal notes and rating">
            <div class="details__rating">
              <span class="details__section-title">Your rating</span>
              <div class="el-stars" role="group" aria-label="Rate this book from 1 to 5 stars">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  :class="['el-star-btn', { 'is-active': star <= personalRating }]"
                  :aria-label="`Rate ${star} out of 5`"
                  :aria-pressed="star <= personalRating ? 'true' : 'false'"
                  @click="setRating(star)"
                >
                  {{ star <= personalRating ? '★' : '☆' }}
                </button>
                <span v-if="personalRating" class="label">{{ personalRating }} / 5</span>
              </div>
            </div>

            <form class="details__note" @submit.prevent="saveNote">
              <label class="details__section-title" for="book-personal-note">Personal note</label>
              <div class="details__note-row">
                <input
                  id="book-personal-note"
                  v-model="noteDraft"
                  type="text"
                  class="el-input"
                  placeholder="Write a personal note or review…"
                />
                <button class="el-btn el-btn--outline" type="submit">Save note</button>
              </div>
            </form>
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
            Open on Open Library
          </a>
        </div>
      </div>

      <section class="details__section" aria-labelledby="about-title">
        <h2 id="about-title" class="details__section-title">About this book</h2>
        <div class="details__description body">
          <p v-for="(paragraph, idx) in descriptionParagraphs" :key="idx">{{ paragraph }}</p>
        </div>
      </section>

      <EmbeddedViewerComponent
        :book-id="book.id"
        :isbn="book.isbn"
        :ia-id="book.iaId || ''"
        :preview-link="book.previewLink"
        source-name="Open Library"
      />
    </template>
  </div>
</template>
