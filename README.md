# EfreeLib

**EfreeLib** is a Vue.js web application for searching millions of books via the Open Library API, curating a personal library, tracking reading progress with dated library stamps, managing favourites, and recording personal ratings and notes.

[> Click here to go to the Figma design](https://www.figma.com/design/xLFk4IKKQ5vvfk0K4B90O0/EfreeLib-UX-Design?node-id=0-1&t=eJYVj1eFCIXoA1GP-1)

## Installation & Setup Instructions

### Prerequisites

- **Node.js** `^22.18.0` or `>=24.12.0`
- **npm** or **pnpm**

### Install dependencies

```bash
npm install
# or with pnpm:
pnpm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL shown in the terminal (default: `http://localhost:5173`).

## Features

### Core Features

- **Catalogue Search (`/`)**:
  - Search books by title, author, keyword, or ISBN via the Open Library Search API.
  - Displays book **title**, **author**, **publication year**, and **cover image** (with an automatic typeset cover fallback when no cover exists).
  - Keyboard shortcut (`/`) to jump to the search bar from anywhere, plus live search query echoing on the Home hero mark.
  - Featured shelf of catalogue picks displayed before searching.
- **Personal Library (`/library`)**:
  - Shelve books directly from search results or the book details page (with duplicate prevention).
  - Toggle books between **To read** and **Read** (automatically stamping read books with the completion date, e.g., `20 OCT 2026`).
  - Add or remove books from **Favourites**.
  - Remove books from your library with a **confirmation prompt** (`window.confirm`) to prevent accidental deletion.
- **Favourites (`/favorites`)**:
  - Dedicated view displaying all favourite books retrieved through the `favoriteBooks` Vuex getter.
- **Data Persistence (`localStorage`)**:
  - Library items, reading status, read timestamps, favourites, personal ratings, and personal notes are automatically persisted in `localStorage`.

### Advanced Features

- **Library Statistics & Visual Reading Dial**:
  - Displays total shelved books, read count, remaining (to read) count, favourites count, and average personal rating (`Avg X / 5 ★`), accompanied by the interactive SVG `ReadingDial` progress meter.
- **Filters, Search & Sorting in Library**:
  - Filter shelved books by title/author text search, reading status (`All`, `To read`, `Read`), or `Favourites only`.
  - Sort by **Date added**, **Title**, or **Publication year**.
- **Book Details & Interactive Sample Reader (`/book/:id`)**:
  - Dynamic route displaying full catalogue card metadata (subtitle, author, publisher, publication year, page count, language, subjects, ISBN, community rating, and spine call number).
  - Embeds the interactive **Open Library / Internet Archive BookReader** (`https://archive.org/embed/{iaId}`) when a digital lendable/preview scan is available, with a direct link fallback to Open Library.
- **Personal Rating System (1–5 Stars)**:
  - Rate any shelved book from 1 to 5 stars (click the active star again to clear). Ratings are displayed on both the `/book/:id` page and `/library` book cards, and aggregated into the library's average rating.
- **Personal Notes / Reviews**:
  - Write and save a personal note or short review for any book in your library, persisted in Vuex and `localStorage`.
- **Better API & UI/UX Experience**:
  - Animated SVG loading states, error notices with retry actions, empty states for Search, Library, and Favourites, **"Load more volumes"** pagination, and **toast notifications** when shelving, removing, or saving notes.

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)
- **Routing**: [Vue Router 5](https://router.vuejs.org/)
- **State Management**: [Vuex 4](https://vuex.vuejs.org/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Linting & Formatting**: `oxlint`, `eslint` (`eslint-plugin-vue`), and `oxfmt`
- **Persistence**: Browser `localStorage`

## External API Used

This project uses the **Open Library API** (free, open, no API key required):

1. **Open Library Search API**
   - `GET https://openlibrary.org/search.json?q={query}&limit={maxResults}&offset={startIndex}&fields=...`
   - Used in [`searchBooks()`](src/services/openLibrary.js) to search volumes and retrieve keys, titles, subtitles, authors, first publish year, cover IDs, ISBNs, Internet Archive IDs (`ia`), publishers, median page counts, subjects, languages, and community ratings.
2. **Open Library Works API**
   - `GET https://openlibrary.org/works/{workId}.json`
   - Used in [`getBookById()`](src/services/openLibrary.js) alongside a keyed search lookup to retrieve full work descriptions and subject metadata for the `/book/:id` page.
3. **Open Library Covers API**
   - `https://covers.openlibrary.org/b/id/{coverId}-M.jpg`
   - Used to display book covers, with a custom typeset SVG fallback (`PlainCover.vue`) when a volume has no cover image.
4. **Internet Archive / Open Library BookReader Embed**
   - `https://archive.org/embed/{iaId}`
   - Used in [`EmbeddedViewerComponent.vue`](src/components/EmbeddedViewerComponent.vue) to embed an interactive book preview on `/book/:id`.

