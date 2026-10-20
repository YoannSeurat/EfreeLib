const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json'
const OPEN_LIBRARY_WORKS_URL = 'https://openlibrary.org/works'

const SEARCH_FIELDS = [
  'key',
  'title',
  'subtitle',
  'author_name',
  'first_publish_year',
  'cover_i',
  'isbn',
  'ia',
  'publisher',
  'number_of_pages_median',
  'subject',
  'ratings_average',
  'ratings_count',
  'language',
  'first_sentence',
].join(',')

function stripHtml(html) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

/**
 * Formats an Open Library document and optional work details into a clean, normalized structure.
 * Extracts the required fields: Title, Author, Year, Cover, Description, ID.
 */
export function formatBook(doc, workDetails = null) {
  if (!doc && !workDetails) return null

  const rawKey = doc?.key || workDetails?.key || ''
  const id = rawKey.replace('/works/', '')

  // Extract published year
  const year = doc?.first_publish_year
    ? String(doc.first_publish_year)
    : workDetails?.first_publish_date
      ? String(workDetails.first_publish_date).substring(0, 4)
      : 'N/A'

  // Extract cover image from Open Library Covers API, with fallback placeholder
  const coverId = doc?.cover_i || workDetails?.covers?.[0]
  const cover = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : 'https://picsum.photos/128/192'

  // Extract description
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
  const iaId = doc?.ia?.[0] || ''

  return {
    id,
    isbn: doc?.isbn?.[0] || '',
    iaId,
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
    embeddable: Boolean(iaId),
  }
}

/**
 * Searches for books using the Open Library Search API.
 */
export async function searchBooks(query, maxResults = 10, startIndex = 0) {
  if (!query?.trim()) {
    return { totalItems: 0, books: [] }
  }

  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(maxResults),
    offset: String(startIndex),
    fields: SEARCH_FIELDS,
  })

  const url = `${OPEN_LIBRARY_SEARCH_URL}?${params.toString()}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const books = (data.docs || []).map((doc) => formatBook(doc))

    return {
      totalItems: data.numFound || 0,
      books,
    }
  } catch (error) {
    console.error('Failed to search books on Open Library:', error)
    throw error
  }
}

/**
 * Retrieves details for a specific book by its Open Library work ID.
 * Useful for the dynamic route /book/:id.
 */
export async function getBookById(workId) {
  if (!workId) {
    throw new Error('workId is required')
  }

  const cleanId = workId.replace('/works/', '')

  const searchParams = new URLSearchParams({
    q: `key:/works/${cleanId}`,
    limit: '1',
    fields: SEARCH_FIELDS,
  })

  try {
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

    return formatBook(doc, workDetails)
  } catch (error) {
    console.error(`Failed to fetch book with ID ${workId} from Open Library:`, error)
    throw error
  }
}
