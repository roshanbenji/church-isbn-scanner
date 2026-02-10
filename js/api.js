// js/api.js

/**
 * Fetches book details from Open Library or Google Books.
 * @param {string} isbn 
 * @returns {Promise<Object>} Book details {title, author, cover}
 */
async function fetchBookDetails(isbn) {
    // Try Open Library first
    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
        const data = await response.json();
        const key = `ISBN:${isbn}`;

        if (data[key]) {
            return {
                title: data[key].title,
                author: data[key].authors ? data[key].authors[0].name : "Unknown Author",
                cover: data[key].cover ? data[key].cover.medium : null
            };
        }
    } catch (e) {
        console.warn("Open Library failed, trying fallback...", e);
    }

    // Fallback: Google Books
    try {
        const gResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const gData = await gResponse.json();

        if (gData.items && gData.items.length > 0) {
            const info = gData.items[0].volumeInfo;
            return {
                title: info.title,
                author: info.authors ? info.authors[0] : "Unknown Author",
                cover: info.imageLinks ? info.imageLinks.thumbnail : null
            };
        }
    } catch (e) {
        console.warn("Google Books failed too", e);
    }

    return { title: "Unknown Book", author: "Details not found", cover: null };
}
