import { ApiError, fetchJson } from './apiError.js'

// Open Library needs no API key and allows browser requests, so it backs up Google Books.
// Its books get ids like "ol:OL59110W" so they can be told apart from Google ids.

export const SOURCE_NAME = 'Open Library'
const SITE = 'https://openlibrary.org'
const ID_PREFIX = 'ol:'

// Fields for result lists. ISBNs are left out: a work can list hundreds of them.
const LIST_FIELDS = [
  'key',
  'title',
  'subtitle',
  'author_name',
  'first_publish_year',
  'cover_i',
  'subject',
  'language',
  'ratings_average',
  'ratings_count',
].join(',')

// A work lists data from every edition, so its own ISBN, publisher and language are a
// jumble of translations. Asking for English (lang=eng) with these edition fields returns
// the best English edition's details instead.
const DETAIL_FIELDS = [
  LIST_FIELDS,
  'number_of_pages_median',
  'isbn',
  'editions',
  'editions.isbn',
  'editions.publisher',
  'editions.language',
].join(',')

// Catalogue housekeeping tags that say nothing about what a book is about
const JUNK_SUBJECTS =
  /accessible book|protected daisy|in library|large type|open library|lending library|internet archive|overdrive|^reading level/i

export function isOpenLibraryId(id) {
  return typeof id === 'string' && id.startsWith(ID_PREFIX)
}

function coverUrl(coverId, size) {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : ''
}

/** Open Library descriptions are plain text, often with blank-line paragraphs and a trailing
 *  "-----" block of source links. Returns safe HTML: escaped, one <p> per paragraph. */
export function plainTextToHtml(text) {
  if (!text) return ''
  const escape = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const body = String(text).split(/\r?\n\s*-{4,}/)[0]
  return body
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.replace(/\s*\r?\n\s*/g, ' ').trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escape(paragraph)}</p>`)
    .join('')
}

/** Formats an Open Library search document into the same shape as a Google Books book. */
export function formatDoc(doc, { large = false, description = '' } = {}) {
  if (!doc?.key) return null

  // The matching edition, when the request asked for one (see DETAIL_FIELDS)
  const edition = doc.editions?.docs?.[0] || {}

  const workId = doc.key.replace('/works/', '')
  const categories = (doc.subject || []).filter((s) => !JUNK_SUBJECTS.test(s)).slice(0, 4)
  const year = doc.first_publish_year ? String(doc.first_publish_year) : 'N/A'
  const clean = (list) => (list || []).map((code) => code.replace(/-/g, ''))
  const codes = clean(edition.isbn || doc.isbn)
  const isbn =
    codes.find((code) => code.length === 13) || codes.find((code) => code.length === 10) || ''

  // Other editions of the same work, so the preview can try each until one is readable
  const otherIsbns = [...new Set(clean(doc.isbn).filter((code) => code.length === 13))]
    .filter((code) => code !== isbn)
    .slice(0, 12)

  return {
    id: ID_PREFIX + workId,
    source: 'openlibrary',
    sourceName: SOURCE_NAME,
    isbn,
    otherIsbns,
    title: doc.title || 'Untitled',
    subtitle: doc.subtitle || '',
    authors: doc.author_name?.length ? doc.author_name.join(', ') : 'Unknown Author',
    year,
    publishedDate: year,
    cover: coverUrl(doc.cover_i, large ? 'L' : 'M'),
    description: description || 'No description available.',
    pageCount: doc.number_of_pages_median || null,
    publisher: edition.publisher?.[0] || '',
    categories,
    averageRating: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : null,
    ratingsCount: doc.ratings_count || 0,
    previewLink: `${SITE}/works/${workId}`,
    infoLink: `${SITE}/works/${workId}`,
    language: edition.language?.[0] || doc.language?.[0] || '',
    // Open Library has no Google preview of its own; the viewer is tried by ISBN
    embeddable: Boolean(isbn),
  }
}

/** Returns { totalItems, books, sourceName } for a text query. */
export async function searchBooks(query, maxResults = 10, startIndex = 0) {
  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(maxResults),
    offset: String(startIndex),
    fields: LIST_FIELDS,
  })
  const data = await fetchJson(`${SITE}/search.json?${params.toString()}`, SOURCE_NAME)

  return {
    totalItems: data.numFound || 0,
    books: (data.docs || []).map((doc) => formatDoc(doc)).filter(Boolean),
    sourceName: SOURCE_NAME,
  }
}

/** What readers are picking up this month. Fast, and needs no query. */
export async function getTrending(limit = 24) {
  const data = await fetchJson(`${SITE}/trending/monthly.json?limit=${limit}`, SOURCE_NAME)
  return {
    totalItems: data.works?.length || 0,
    books: (data.works || []).map((doc) => formatDoc(doc)).filter(Boolean),
    sourceName: SOURCE_NAME,
  }
}

/** Returns one book by its "ol:" id: its search record plus the work's description. */
export async function getBookById(id) {
  if (!isOpenLibraryId(id)) throw new Error('Not an Open Library id')
  const workId = id.slice(ID_PREFIX.length)
  if (!/^OL\d+W$/.test(workId)) {
    throw new ApiError('Bad Open Library id', {
      status: 404,
      userMessage: 'That book could not be found.',
    })
  }

  const params = new URLSearchParams({
    q: `key:/works/${workId}`,
    limit: '1',
    lang: 'eng',
    fields: DETAIL_FIELDS,
  })

  const [search, work] = await Promise.all([
    fetchJson(`${SITE}/search.json?${params.toString()}`, SOURCE_NAME),
    // The description is optional: a missing work record must not fail the page
    fetchJson(`${SITE}/works/${workId}.json`, SOURCE_NAME).catch(() => null),
  ])

  const doc = search.docs?.[0]
  if (!doc) {
    throw new ApiError('Open Library has no such work', {
      status: 404,
      userMessage: 'That book could not be found.',
    })
  }

  const raw = typeof work?.description === 'string' ? work.description : work?.description?.value
  return formatDoc(doc, { large: true, description: plainTextToHtml(raw) })
}
