import { fetchJson } from './apiError.js'

const GOOGLE_API_KEY = import.meta.env?.VITE_GOOGLE_API_KEY || ''
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

export const SOURCE_NAME = 'Google Books'

/** True when a key is configured (VITE_GOOGLE_API_KEY in .env). Without one, every request
 *  shares Google's small anonymous quota, which is often used up. */
export const hasGoogleKey = Boolean(GOOGLE_API_KEY)

/**
 * Formats a raw Google Books volume object into a clean, normalized structure.
 * Extracts the required fields: Title, Author, Year, Cover, Description, ID.
 */
export function formatBook(item) {
  if (!item) return null

  const info = item.volumeInfo || {}

  // Extract published year
  const year = info.publishedDate ? info.publishedDate.substring(0, 4) : 'N/A'

  // Ensure HTTPS for images to avoid mixed-content issues in browser
  let cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ''
  if (cover.startsWith('http://')) {
    cover = cover.replace('http://', 'https://')
  }

  // No cover image: leave it empty so the UI prints a typeset cover instead

  // Extract ISBN (prefer ISBN_13, fallback to ISBN_10)
  const isbnObj =
    info.industryIdentifiers?.find((id) => id.type === 'ISBN_13') ||
    info.industryIdentifiers?.find((id) => id.type === 'ISBN_10') ||
    info.industryIdentifiers?.[0]
  const isbn = isbnObj ? isbnObj.identifier : ''

  return {
    id: item.id,
    source: 'google',
    sourceName: SOURCE_NAME,
    isbn,
    title: info.title || 'Untitled',
    subtitle: info.subtitle || '',
    authors: info.authors ? info.authors.join(', ') : 'Unknown Author',
    year,
    publishedDate: info.publishedDate || 'N/A',
    cover,
    description: info.description || info.searchInfo?.textSnippet || 'No description available.',
    pageCount: info.pageCount || null,
    publisher: info.publisher || '',
    categories: info.categories || [],
    averageRating: info.averageRating || null,
    ratingsCount: info.ratingsCount || 0,
    previewLink: info.previewLink || '',
    infoLink: info.infoLink || '',
    language: info.language || '',
    embeddable: item.accessInfo?.embeddable ?? true,
  }
}

/**
 * Searches for books using a text query.
 * Returns { totalItems, books, sourceName }.
 */
export async function searchBooks(query, maxResults = 10, startIndex = 0) {
  if (!query?.trim()) {
    return { totalItems: 0, books: [], sourceName: SOURCE_NAME }
  }

  const params = new URLSearchParams({
    q: query.trim(),
    maxResults: String(maxResults),
    startIndex: String(startIndex),
    printType: 'books',
  })
  // Only send a key when there is one: an empty `key=` is not the same as none
  if (GOOGLE_API_KEY) params.set('key', GOOGLE_API_KEY)

  const data = await fetchJson(`${BASE_URL}?${params.toString()}`, SOURCE_NAME)

  return {
    totalItems: data.totalItems || 0,
    books: (data.items || []).map(formatBook),
    sourceName: SOURCE_NAME,
  }
}

/**
 * Retrieves details for a specific book by its Google Books ID.
 * Useful for the dynamic route /book/:id.
 */
export async function getBookById(volumeId) {
  if (!volumeId) {
    throw new Error('volumeId is required')
  }

  const url = GOOGLE_API_KEY
    ? `${BASE_URL}/${encodeURIComponent(volumeId)}?key=${GOOGLE_API_KEY}`
    : `${BASE_URL}/${encodeURIComponent(volumeId)}`

  return formatBook(await fetchJson(url, SOURCE_NAME))
}
