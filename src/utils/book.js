const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/**
 * Library call number for the spine label: subject, author, year.
 * Example: Nineteen Eighty-Four by George Orwell (Fiction, 1949) -> ['FIC', 'ORW', '1949']
 */
export function callNumber(book) {
  const letters = (text) =>
    (text || '')
      .normalize('NFD')
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 3)
      .toUpperCase()

  const subject = letters(book?.categories?.[0]) || 'GEN'
  const firstAuthor = (book?.authors || '').split(',')[0].trim()
  const surname = firstAuthor.split(/\s+/).pop()
  const author = firstAuthor === 'Unknown Author' ? 'ANO' : letters(surname) || 'ANO'
  const year = /^\d{4}$/.test(book?.year || '') ? book.year : ''

  return [subject, author, year].filter(Boolean)
}

/** Date as printed on the Read stamp: 19 OCT 2026 */
export function stampDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const day = String(date.getDate()).padStart(2, '0')
  return `${day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

/** True when the cover is a real image (older saved books may hold the old random placeholder). */
export function hasCover(url) {
  return Boolean(url) && !url.includes('picsum.photos')
}

/** Picks one of the three typeset-cover crops, stable for a given book id. */
export function coverVariant(id) {
  let sum = 0
  for (const char of id || '') sum += char.charCodeAt(0)
  return sum % 3
}
