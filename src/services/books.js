// The one place the app gets books from. Google Books first; if it is out of quota or down,
// Open Library answers instead, so search and book pages keep working without an API key.
import { cached } from './cache.js'
import { ApiError, withRetry } from './apiError.js'
import * as google from './googleBooks.js'
import * as openLibrary from './openLibrary.js'

const COOLDOWN_MS = 10 * 60 * 1000
const COOLDOWN_KEY = `efreelib-google-cooldown:${google.hasGoogleKey ? 'key' : 'anon'}`

let announced = false

/** After Google reports its quota is used up, skip it for a while instead of failing again. */
function googleCoolingDown() {
  try {
    return Number(sessionStorage.getItem(COOLDOWN_KEY)) > Date.now()
  } catch {
    return false
  }
}

function startCooldown() {
  try {
    sessionStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS))
  } catch {
    // Without storage we simply try Google again next time
  }
  if (!announced) {
    announced = true
    console.info(
      google.hasGoogleKey
        ? 'Google Books quota used up for now; using Open Library.'
        : 'Google Books anonymous quota used up; using Open Library. ' +
            'Add a free key as VITE_GOOGLE_API_KEY in .env to use Google Books fully.',
    )
  }
}

function normalizeQuery(query) {
  const q = (query || '').trim()
  // A bare ISBN searches best as one
  return /^(?:\d[\d-]{8,}[\dXx])$/.test(q) ? `isbn:${q.replace(/-/g, '')}` : q
}

function bothFailed(googleError, openLibraryError) {
  const quota = googleError?.quota
  return new ApiError(`${googleError?.message}; ${openLibraryError?.message}`, {
    network: googleError?.network && openLibraryError?.network,
    // Not a network problem, but still worth trying again later
    status: googleError?.network && openLibraryError?.network ? 0 : 503,
    userMessage: quota
      ? 'Google Books has reached its request limit and Open Library did not answer either.'
      : 'Neither Google Books nor Open Library answered.',
  })
}

/** Returns { totalItems, books, sourceName }. */
export function searchBooks(query, maxResults = 20, startIndex = 0) {
  const q = normalizeQuery(query)
  if (!q) return Promise.resolve({ totalItems: 0, books: [], sourceName: google.SOURCE_NAME })

  return cached(`search:${q}:${maxResults}:${startIndex}`, async () => {
    let googleError = null

    if (!googleCoolingDown()) {
      try {
        return await withRetry(() => google.searchBooks(q, maxResults, startIndex))
      } catch (error) {
        googleError = error
        if (error.quota) startCooldown()
      }
    }

    try {
      return await withRetry(() => openLibrary.searchBooks(q, maxResults, startIndex))
    } catch (openLibraryError) {
      throw googleError ? bothFailed(googleError, openLibraryError) : openLibraryError
    }
  })
}

/** A shelf of books for the Home page: this month's trending titles. Returns the same shape
 *  as searchBooks. Open Library answers this one quickly, so it goes first. */
export function getFeaturedBooks(limit = 24) {
  return cached(
    `featured:${limit}`,
    async () => {
      try {
        return await withRetry(() => openLibrary.getTrending(limit))
      } catch (openLibraryError) {
        if (googleCoolingDown()) throw openLibraryError
        try {
          return await google.searchBooks('subject:fiction', limit)
        } catch (googleError) {
          if (googleError.quota) startCooldown()
          throw bothFailed(googleError, openLibraryError)
        }
      }
    },
    30 * 60 * 1000,
  )
}

/** Returns one book. Open Library ids ("ol:…") go straight to Open Library. */
export function getBookById(id) {
  if (!id) return Promise.reject(new Error('id is required'))

  return cached(`book:${id}`, () =>
    withRetry(() =>
      openLibrary.isOpenLibraryId(id) ? openLibrary.getBookById(id) : google.getBookById(id),
    ),
  )
}
