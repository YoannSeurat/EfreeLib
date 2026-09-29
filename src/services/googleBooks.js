const GOOGLE_API_KEY = import.meta.env?.VITE_GOOGLE_API_KEY || '';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Formats a raw Google Books volume object into a clean, normalized structure.
 * Extracts the required fields: Title, Author, Year, Cover, Description, ID.
 */
export function formatBook(item) {
  if (!item) return null;

  const info = item.volumeInfo || {};

  // Extract published year
  const year = info.publishedDate ? info.publishedDate.substring(0, 4) : 'N/A';

  // Ensure HTTPS for images to avoid mixed-content issues in browser
  let cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
  if (cover.startsWith('http://')) {
    cover = cover.replace('http://', 'https://');
  }

  // Fallback placeholder if no cover image is provided
  if (!cover) {
    cover = 'https://picsum.photos/128/192';
  }

  return {
    id: item.id,
    title: info.title || 'Untitled',
    authors: info.authors ? info.authors.join(', ') : 'Unknown Author',
    year,
    cover,
    description: info.description || info.searchInfo?.textSnippet || 'No description available.',
    pageCount: info.pageCount || null,
    publisher: info.publisher || 'Unknown Publisher',
    categories: info.categories || [],
    averageRating: info.averageRating || null,
    ratingsCount: info.ratingsCount || 0,
    previewLink: info.previewLink || '',
  };
}

/**
 * Searches for books using a text query.
 */
export async function searchBooks(query, maxResults = 10, startIndex = 0) {
  if (!query?.trim()) {
    return { totalItems: 0, books: [] };
  }

  const params = new URLSearchParams({
    q: query.trim(),
    maxResults: String(maxResults),
    startIndex: String(startIndex),
    key: GOOGLE_API_KEY,
  });

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const books = (data.items || []).map(formatBook);

    return {
      totalItems: data.totalItems || 0,
      books,
    };
  } catch (error) {
    console.error('Failed to search books:', error);
    throw error;
  }
}

/**
 * Retrieves details for a specific book by its Google Books ID.
 * Useful for the dynamic route /book/:id.
 */
export async function getBookById(volumeId) {
  if (!volumeId) {
    throw new Error('volumeId is required');
  }

  const url = `${BASE_URL}/${volumeId}?key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status} ${response.statusText}`);
    }

    const item = await response.json();
    return formatBook(item);
  } catch (error) {
    console.error(`Failed to fetch book with ID ${volumeId}:`, error);
    throw error;
  }
}