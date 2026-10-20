# EfreeLib

**EfreeLib** is a Vue.js web application for searching books via the Google Books API (with automatic fallback to the Open Library API), managing a personal book library, tracking reading status, curating favorites, and adding personal ratings and notes.

---

## Features

- **Book Search (API Integration)**: Search for books by title, author, or keyword with loading indicators, error handling, empty states, duplicate prevention, and **Load more** pagination.
- **Personal Library (`/library`)**:
  - Add and remove books (with deletion confirmation and toast notifications).
  - Mark books as **Read / Unread** and **Favorite / Unfavorite**.
  - **Library Statistics**: View total books, read count, remaining (unread) count, favorites count, and average personal rating.
  - **Filters & Sorting**: Search within your library, filter by read status or favorites, and sort by date added, title, or publication year.
  - **Personal Rating & Notes**: Rate books from 1 to 5 stars and save personal notes/reviews.
- **Favorites (`/favorites`)**: Dedicated view displaying all favorite books retrieved via Vuex getters.
- **Book Details (`/book/:id`)**: Dynamic route displaying full metadata (subtitle, publisher, page count, ISBN, categories, language, full description) and an interactive **Google Books Embedded Viewer**.
- **Data Persistence**: Automatic persistence of library items, reading status, favorites, ratings, notes, and theme preference in `localStorage`.
- **UI/UX**: Dark/Light mode toggle, toast notifications, and responsive desktop/mobile layout.

---

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **State Management**: [Vuex 4](https://vuex.vuejs.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Persistence**: Browser `localStorage`

---

## External API Used

This project uses the **Google Books API** with an automatic fallback to the **Open Library API** for high availability:

1. **Google Books Volumes REST API (`v1`)**
   - Base endpoint: `https://www.googleapis.com/books/v1/volumes`
   - `GET /volumes?q={query}&maxResults={maxResults}&startIndex={startIndex}` — Searches for volumes matching a text query.
   - `GET /volumes/{volumeId}` — Retrieves detailed metadata for a single book by its Google Books ID.
2. **Open Library API (Automatic Fallback)**
   - If the Google Books API is unavailable (`503`) or rate-limited, searches and book details automatically fall back to:
   - `GET https://openlibrary.org/search.json` — Searches for works and metadata.
   - `GET https://openlibrary.org/works/{id}.json` — Retrieves full work details and descriptions.
   - `https://covers.openlibrary.org/b/id/{cover_id}-M.jpg` — Retrieves book cover images.
3. **Google Books Embedded Viewer API**
   - Script: `https://www.google.com/books/jsapi.js`
   - Used in `EmbeddedViewerComponent.vue` (`google.books.DefaultViewer`) to embed an interactive book preview on the `/book/:id` page.

---

## Installation & Setup Instructions

### Prerequisites

- **Node.js** `^22.18.0` or `>=24.12.0`
- **npm** or **pnpm**

### 1. Clone the repository

```bash
git clone https://github.com/YoannSeurat/EfreeLib.git
cd EfreeLib
```

### 2. Install dependencies

```bash
npm install
# or with pnpm:
pnpm install
```

### 3. Configure Environment Variables (Optional)

Create a `.env` file in the root directory if you want to use your own Google Books API key for higher rate limits:

```env
VITE_GOOGLE_API_KEY=your_google_books_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open the local URL displayed in the terminal (typically `http://localhost:5173`).

### 5. Build for production

```bash
npm run build
npm run preview
```

### 6. Lint and format

```bash
npm run lint
npm run format
```
