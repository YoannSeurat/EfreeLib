// Small response cache: sessionStorage with an expiry, plus de-duplication of identical
// requests that are still in flight. Keeps repeat searches and page visits from spending
// API quota.

const PREFIX = 'efreelib-cache:'
const DEFAULT_TTL = 15 * 60 * 1000

const inflight = new Map()

function read(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key)
    if (!raw) return undefined
    const entry = JSON.parse(raw)
    if (entry.expires < Date.now()) {
      sessionStorage.removeItem(PREFIX + key)
      return undefined
    }
    return entry.value
  } catch {
    return undefined
  }
}

function write(key, value, ttl) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ expires: Date.now() + ttl, value }))
  } catch {
    // Storage full or blocked: drop our old entries and carry on without caching this one
    try {
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => sessionStorage.removeItem(k))
    } catch {
      // Nothing more to do
    }
  }
}

/**
 * Returns the cached value for `key`, or runs `loader` once and caches what it resolves with.
 * Rejections are never cached.
 */
export function cached(key, loader, ttl = DEFAULT_TTL) {
  const hit = read(key)
  if (hit !== undefined) return Promise.resolve(hit)
  if (inflight.has(key)) return inflight.get(key)

  const promise = loader()
    .then((value) => {
      write(key, value, ttl)
      return value
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, promise)
  return promise
}
