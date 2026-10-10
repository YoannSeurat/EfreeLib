import { createStore } from 'vuex'

const STORAGE_KEY = 'efreelib-library'

function loadLibrary() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveLibrary(library) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library))
}

const store = createStore({
  state: () => ({
    library: loadLibrary(),
  }),

  getters: {
    libraryBooks: (state) => state.library,
    libraryCount: (state) => state.library.length,
    isInLibrary: (state) => (id) => state.library.some((book) => book.id === id),
  },

  mutations: {
    ADD_BOOK(state, book) {
      state.library.push(book)
    },
    REMOVE_BOOK(state, id) {
      state.library = state.library.filter((book) => book.id !== id)
    },
  },

  actions: {
    addBook({ commit, getters, state }, book) {
      if (!book?.id || getters.isInLibrary(book.id)) return
      commit('ADD_BOOK', {
        id: book.id,
        title: book.title,
        authors: book.authors,
        year: book.year,
        cover: book.cover,
        description: book.description,
        addedAt: new Date().toISOString(),
      })
      saveLibrary(state.library)
    },
    removeBook({ commit, state }, id) {
      commit('REMOVE_BOOK', id)
      saveLibrary(state.library)
    },
  },
})

export default store
