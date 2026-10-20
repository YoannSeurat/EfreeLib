# EfreeLib

**EfreeLib** is a Vue.js web application for searching books via the Open Library API, managing a personal book library, tracking reading status, curating favorites, and adding personal ratings and notes.

## Features

- **Book Search (API Integration)**: Search for books by title, author, or keyword with loading indicators, error handling, empty states, duplicate prevention, and **Load more** pagination.
- **Personal Library (`/library`)**:
  - Add and remove books (with deletion confirmation and toast notifications).
  - Mark books as **Read / Unread** and **Favorite / Unfavorite**.
  - **Library Statistics**: View total books, read count, remaining (unread) count, favorites count, and average personal rating.
  - **Filters & Sorting**: Search within your library, filter by read status or favorites, and sort by date added, title, or publication year.
  - **Personal Rating & Notes**: Rate books from 1 to 5 stars and save personal notes/reviews.
- **Favorites (`/favorites`)**: Dedicated view displaying all favorite books retrieved via Vuex getters.
- **Book Details (`/book/:id`)**: Dynamic route displaying full metadata (subtitle, publisher, page count, ISBN, categories, language, full description) and an interactive **Open Library / Internet Archive Embedded Book Preview**.
- **Data Persistence**: Automatic persistence of library items, reading status, favorites, ratings, notes, and theme preference in `localStorage`.
- **UI/UX**: Dark/Light mode toggle, toast notifications, and responsive desktop/mobile layout.

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **State Management**: [Vuex 4](https://vuex.vuejs.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Persistence**: Browser `localStorage`

## External API Used

This project uses the **Open Library API** (completely free, no API key required):

1. **Open Library Search API**
   - `GET https://openlibrary.org/search.json?q={query}&limit={maxResults}&offset={startIndex}&fields=...` — Searches for books matching a text query and retrieves title, authors, publication year, ISBN, publisher, page count, ratings, and cover ID.
2. **Open Library Works API**
   - `GET https://openlibrary.org/works/{workId}.json` — Retrieves detailed metadata and full descriptions for a single book on the `/book/:id` page.
3. **Open Library Covers API**
   - `https://covers.openlibrary.org/b/id/{cover_id}-M.jpg` — Retrieves book cover images.
4. **Open Library / Internet Archive BookReader Embed**
   - `https://archive.org/embed/{ia_id}` — Used in `EmbeddedViewerComponent.vue` to embed an interactive book preview on the `/book/:id` page.

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

### 3. Run the development server

```bash
npm run dev
```

Open the local URL displayed in the terminal (typically `http://localhost:5173`).

### 4. Build for production

```bash
npm run build
npm run preview
```

### 5. Lint and format

```bash
npm run lint
npm run format
```
