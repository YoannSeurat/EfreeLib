const GOOGLE_API_KEY = import.meta.env?.VITE_GOOGLE_API_KEY || ''
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes'
const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json'
const OPEN_LIBRARY_WORKS_URL = 'https://openlibrary.org/works'

function stripHtml(html) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

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

  // Fallback placeholder if no cover image is provided
  if (!cover) {
    cover = 'https://picsum.photos/128/192'
  }

  // Extract ISBN (prefer ISBN_13, fallback to ISBN_10)
  const isbnObj =
    info.industryIdentifiers?.find((id) => id.type === 'ISBN_13') ||
    info.industryIdentifiers?.find((id) => id.type === 'ISBN_10') ||
    info.industryIdentifiers?.[0]
  const isbn = isbnObj ? isbnObj.identifier : ''

  const rawDescription =
    info.description || info.searchInfo?.textSnippet || 'No description available.'

  return {
    id: item.id,
    isbn,
    title: info.title || 'Untitled',
    subtitle: info.subtitle || '',
    authors: info.authors ? info.authors.join(', ') : 'Unknown Author',
    year,
    publishedDate: info.publishedDate || 'N/A',
    cover,
    description: stripHtml(rawDescription),
    descriptionHtml: rawDescription,
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
 * Formats an Open Library search document into the same normalized book structure.
 */
export function formatOpenLibraryBook(doc, workDetails = null) {
  if (!doc && !workDetails) return null

  const rawKey = doc?.key || workDetails?.key || ''
  const id = rawKey.replace('/works/', '')

  const year = doc?.first_publish_year
    ? String(doc.first_publish_year)
    : workDetails?.first_publish_date
      ? String(workDetails.first_publish_date).substring(0, 4)
      : 'N/A'

  const coverId = doc?.cover_i || workDetails?.covers?.[0]
  const cover = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : 'https://picsum.photos/128/192'

  let rawDescription = ''
  if (workDetails?.description) {
    rawDescription =
      typeof workDetails.description === 'string'
        ? workDetails.description
        : workDetails.description.value || ''
  } else if (doc?.first_sentence) {
    rawDescription = Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence
  }
  if (!rawDescription) {
    rawDescription = 'No description available.'
  }

  const categories = workDetails?.subjects
    ? workDetails.subjects.slice(0, 6)
    : doc?.subject
      ? doc.subject.slice(0, 6)
      : []

  const openLibraryUrl = rawKey ? `https://openlibrary.org${rawKey}` : ''

  return {
    id,
    isbn: doc?.isbn?.[0] || '',
    title: workDetails?.title || doc?.title || 'Untitled',
    subtitle: workDetails?.subtitle || doc?.subtitle || '',
    authors: doc?.author_name ? doc.author_name.join(', ') : 'Unknown Author',
    year,
    publishedDate: year,
    cover,
    description: stripHtml(rawDescription),
    descriptionHtml: rawDescription,
    pageCount: doc?.number_of_pages_median || null,
    publisher: doc?.publisher?.[0] || '',
    categories,
    averageRating: doc?.ratings_average ? Number(doc.ratings_average.toFixed(1)) : null,
    ratingsCount: doc?.ratings_count || 0,
    previewLink: openLibraryUrl,
    infoLink: openLibraryUrl,
    language: doc?.language?.[0] || '',
    embeddable: Boolean(doc?.isbn?.[0]),
  }
}

/**
 * Fallback search using the Open Library Search API.
 */
async function searchOpenLibrary(query, maxResults = 10, startIndex = 0) {
  const fields = [
    'key',
    'title',
    'subtitle',
    'author_name',
    'first_publish_year',
    'cover_i',
    'isbn',
    'publisher',
    'number_of_pages_median',
    'subject',
    'ratings_average',
    'ratings_count',
    'language',
    'first_sentence',
  ].join(',')

  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(maxResults),
    offset: String(startIndex),
    fields,
  })

  const response = await fetch(`${OPEN_LIBRARY_SEARCH_URL}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const books = (data.docs || []).map((doc) => formatOpenLibraryBook(doc))

  return {
    totalItems: data.numFound || 0,
    books,
  }
}

/**
 * Fallback book details lookup using the Open Library Works & Search APIs.
 */
async function getOpenLibraryBookById(workId) {
  const cleanId = workId.replace('/works/', '')
  const fields = [
    'key',
    'title',
    'subtitle',
    'author_name',
    'first_publish_year',
    'cover_i',
    'isbn',
    'publisher',
    'number_of_pages_median',
    'subject',
    'ratings_average',
    'ratings_count',
    'language',
    'first_sentence',
  ].join(',')

  const searchParams = new URLSearchParams({
    q: `key:/works/${cleanId}`,
    limit: '1',
    fields,
  })

  const [workRes, searchRes] = await Promise.all([
    fetch(`${OPEN_LIBRARY_WORKS_URL}/${cleanId}.json`),
    fetch(`${OPEN_LIBRARY_SEARCH_URL}?${searchParams.toString()}`),
  ])

  if (!workRes.ok) {
    throw new Error(`Open Library API error: ${workRes.status} ${workRes.statusText}`)
  }

  const workDetails = await workRes.json()
  const searchData = searchRes.ok ? await searchRes.json() : null
  const doc = searchData?.docs?.[0] || null

  return formatOpenLibraryBook(doc, workDetails)
}

/**
 * Searches for books using Google Books API, with automatic fallback to Open Library API.
 */
export async function searchBooks(query, maxResults = 10, startIndex = 0) {
  if (!query?.trim()) {
    return { totalItems: 0, books: [] }
  }

  const params = new URLSearchParams({
    q: query.trim(),
    maxResults: String(maxResults),
    startIndex: String(startIndex),
  })
  if (GOOGLE_API_KEY) {
    params.set('key', GOOGLE_API_KEY)
  }

  const url = `${BASE_URL}?${params.toString()}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const books = (data.items || []).map(formatBook)

    return {
      totalItems: data.totalItems || 0,
      books,
    }
  } catch (error) {
    console.warn('Google Books API failed, falling back to Open Library API:', error)
    return await searchOpenLibrary(query, maxResults, startIndex)
  }
}

/**
 * Retrieves details for a specific book by its ID (supports both Google Books IDs and Open Library IDs).
 */
export async function getBookById(volumeId) {
  if (!volumeId) {
    throw new Error('volumeId is required')
  }

  // Open Library work IDs match patterns like OL45804W
  if (/^OL\d+[WM]$/i.test(volumeId)) {
    return await getOpenLibraryBookById(volumeId)
  }

  const url = GOOGLE_API_KEY
    ? `${BASE_URL}/${volumeId}?key=${GOOGLE_API_KEY}`
    : `${BASE_URL}/${volumeId}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status} ${response.statusText}`)
    }

    const item = await response.json()
    return formatBook(item)
  } catch (error) {
    console.error(`Failed to fetch book with ID ${volumeId}:`, error)
    throw error
  }
}
