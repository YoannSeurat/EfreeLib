import { createStore } from "vuex";

const STORAGE_KEY = "efreelib-library";

function stripHtmlTags(text) {
  if (!text) return "";
  return String(text).replace(/<[^>]*>/g, "");
}

function loadLibrary() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return items.map((book) => ({
      ...book,
      description: stripHtmlTags(book.description),
      rating: book.rating ?? 0,
      note: book.note ?? "",
    }));
  } catch {
    return [];
  }
}

function saveLibrary(library) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

let toastTimer = null;

const store = createStore({
  state: () => ({
    library: loadLibrary(),
    toastMessage: "",
    searchQuery: "",
  }),

  getters: {
    libraryBooks: (state) => state.library,
    favoriteBooks: (state) => state.library.filter((book) => book.favorite),
    libraryCount: (state) => state.library.length,
    readCount: (state) => state.library.filter((book) => book.read).length,
    unreadCount: (state) => state.library.filter((book) => !book.read).length,
    favoriteCount: (state) => state.library.filter((book) => book.favorite).length,
    averageRating: (state) => {
      const rated = state.library.filter((book) => book.rating >= 1 && book.rating <= 5);
      if (rated.length === 0) return null;
      const sum = rated.reduce((acc, book) => acc + Number(book.rating), 0);
      return Number((sum / rated.length).toFixed(1));
    },
    isInLibrary: (state) => (id) => state.library.some((book) => book.id === id),
    isRead: (state) => (id) => state.library.find((book) => book.id === id)?.read ?? false,
    isFavorite: (state) => (id) => state.library.find((book) => book.id === id)?.favorite ?? false,
    getBookRating: (state) => (id) => state.library.find((book) => book.id === id)?.rating ?? 0,
    getBookNote: (state) => (id) => state.library.find((book) => book.id === id)?.note ?? "",
    toastMessage: (state) => state.toastMessage,
  },

  mutations: {
    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query;
    },
    ADD_BOOK(state, book) {
      state.library.push(book);
    },
    REMOVE_BOOK(state, id) {
      state.library = state.library.filter((book) => book.id !== id);
    },
    SET_READ(state, { id, read }) {
      const book = state.library.find((b) => b.id === id);
      if (!book) return;
      book.read = read;
      book.readAt = read ? new Date().toISOString() : null;
    },
    SET_FAVORITE(state, { id, favorite }) {
      const book = state.library.find((b) => b.id === id);
      if (book) book.favorite = favorite;
    },
    SET_RATING(state, { id, rating }) {
      const book = state.library.find((b) => b.id === id);
      if (book) book.rating = rating;
    },
    SET_NOTE(state, { id, note }) {
      const book = state.library.find((b) => b.id === id);
      if (book) book.note = note;
    },
    SET_TOAST(state, message) {
      state.toastMessage = message;
    },
  },

  actions: {
    showToast({ commit }, message) {
      commit("SET_TOAST", message);
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        commit("SET_TOAST", "");
      }, 3000);
    },
    addBook({ commit, dispatch, getters, state }, book) {
      if (!book?.id || getters.isInLibrary(book.id)) return;
      commit("ADD_BOOK", {
        id: book.id,
        title: book.title,
        authors: book.authors,
        year: book.year,
        cover: book.cover,
        description: stripHtmlTags(book.description),
        categories: book.categories || [],
        iaId: book.iaId || "",
        previewLink: book.previewLink || "",
        read: false,
        readAt: null,
        favorite: false,
        rating: 0,
        note: "",
        addedAt: new Date().toISOString(),
      });
      saveLibrary(state.library);
      dispatch("showToast", `"${book.title}" added to your library.`);
    },
    removeBook({ commit, dispatch, state }, id) {
      const book = state.library.find((item) => item.id === id);
      const title = book?.title || "Book";
      commit("REMOVE_BOOK", id);
      saveLibrary(state.library);
      dispatch("showToast", `"${title}" removed from your library.`);
    },
    toggleRead({ commit, getters, state }, id) {
      if (!getters.isInLibrary(id)) return;
      commit("SET_READ", { id, read: !getters.isRead(id) });
      saveLibrary(state.library);
    },
    toggleFavorite({ commit, getters, state }, id) {
      if (!getters.isInLibrary(id)) return;
      commit("SET_FAVORITE", { id, favorite: !getters.isFavorite(id) });
      saveLibrary(state.library);
    },
    setRating({ commit, getters, state }, { id, rating }) {
      if (!getters.isInLibrary(id)) return;
      const current = getters.getBookRating(id);
      const nextRating = current === rating ? 0 : rating;
      commit("SET_RATING", { id, rating: nextRating });
      saveLibrary(state.library);
    },
    setNote({ commit, dispatch, getters, state }, { id, note }) {
      if (!getters.isInLibrary(id)) return;
      commit("SET_NOTE", { id, note });
      saveLibrary(state.library);
      dispatch("showToast", "Personal note saved.");
    },
  },
});

export default store;
