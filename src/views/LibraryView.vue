<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const books = computed(() => store.getters.libraryBooks)
const count = computed(() => store.getters.libraryCount)
const readCount = computed(() => store.getters.readCount)
const unreadCount = computed(() => store.getters.unreadCount)
const favoriteCount = computed(() => store.getters.favoriteCount)
const averageRating = computed(() => store.getters.averageRating)

const librarySearch = ref('')
const statusFilter = ref('all')
const favoriteOnly = ref(false)
const sortBy = ref('addedAt')

const noteDrafts = reactive({})

function getDraftNote(book) {
  if (noteDrafts[book.id] === undefined) {
    return book.note || ''
  }
  return noteDrafts[book.id]
}

function updateDraftNote(id, value) {
  noteDrafts[id] = value
}

function saveNote(book) {
  const note = getDraftNote(book).trim()
  noteDrafts[book.id] = note
  store.dispatch('setNote', { id: book.id, note })
}

const filteredBooks = computed(() => {
  const query = librarySearch.value.trim().toLowerCase()

  const filtered = books.value.filter((book) => {
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

  return [...filtered].sort((a, b) => {
    if (sortBy.value === 'title') {
      return (a.title || '').localeCompare(b.title || '')
    }
    if (sortBy.value === 'year') {
      const yearA = parseInt(a.year, 10) || 0
      const yearB = parseInt(b.year, 10) || 0
      return yearB - yearA
    }
    const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0
    const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0
    return dateB - dateA
  })
})

function removeFromLibrary(book) {
  const confirmed = window.confirm(
    `Are you sure you want to remove "${book.title}" from your library?`,
  )
  if (!confirmed) return
  store.dispatch('removeBook', book.id)
}

function toggleRead(id) {
  store.dispatch('toggleRead', id)
}

function toggleFavorite(id) {
  store.dispatch('toggleFavorite', id)
}

function setRating(id, rating) {
  store.dispatch('setRating', { id, rating })
}
</script>

<template>
  <h1>Personal Library</h1>

  <p v-if="count === 0" class="status-msg">
    Your library is empty. <RouterLink to="/" class="inline-link">Search for books</RouterLink> to
    add some.
  </p>

  <div v-else class="books-grid">
    <!-- Library Statistics -->
    <div class="library-stats line">
      <span><strong>Total:</strong> {{ count }}</span>
      <span><strong>Read:</strong> {{ readCount }}</span>
      <span><strong>Remaining:</strong> {{ unreadCount }}</span>
      <span><strong>Favorites:</strong> {{ favoriteCount }}</span>
      <span>
        <strong>Avg. Rating:</strong>
        {{ averageRating !== null ? `${averageRating} / 5 ★` : 'N/A' }}
      </span>
    </div>

    <!-- Filters and Sorting -->
    <div class="library-controls line">
      <input
        v-model="librarySearch"
        type="text"
        placeholder="Search in library..."
        aria-label="Search in library"
      />

      <label>
        Status:
        <select v-model="statusFilter">
          <option value="all">All</option>
          <option value="read">Read</option>
          <option value="unread">Unread</option>
        </select>
      </label>

      <label class="line">
        <input v-model="favoriteOnly" type="checkbox" />
        Favorites only
      </label>

      <label>
        Sort by:
        <select v-model="sortBy">
          <option value="addedAt">Date added</option>
          <option value="title">Title</option>
          <option value="year">Year</option>
        </select>
      </label>
    </div>

    <p v-if="filteredBooks.length === 0" class="status-msg">
      No books in your library match the selected filters.
    </p>

    <article v-for="book in filteredBooks" :key="book.id" class="book-card line">
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

        <!-- Personal Rating (1 to 5) -->
        <div class="rating-row line">
          <strong>Your rating:</strong>
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="star-btn"
            :title="`Rate ${star} out of 5`"
            @click="setRating(book.id, star)"
          >
            {{ star <= (book.rating || 0) ? '★' : '☆' }}
          </button>
          <span v-if="book.rating">{{ book.rating }} / 5</span>
        </div>

        <!-- Personal Note -->
        <div class="note-row line">
          <input
            type="text"
            class="note-input"
            placeholder="Write a personal note or review..."
            :value="getDraftNote(book)"
            @input="updateDraftNote(book.id, $event.target.value)"
            @keydown.enter="saveNote(book)"
          />
          <button type="button" @click="saveNote(book)">Save note</button>
        </div>

        <div class="line">
          <button @click="toggleRead(book.id)">
            {{ book.read ? 'Mark as unread' : 'Mark as read' }}
          </button>
          <button @click="toggleFavorite(book.id)">
            {{ book.favorite ? 'Remove from favorites' : 'Add to favorites' }}
          </button>
          <button @click="removeFromLibrary(book)">Remove</button>
        </div>
      </div>
    </article>
  </div>
</template>
