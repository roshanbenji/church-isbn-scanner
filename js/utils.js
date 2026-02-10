// js/utils.js

/**
 * Validates if the code is a potential Bookland ISBN (starts with 978 or 979).
 * @param {string} code 
 * @returns {string|null} Cleaned code if valid, null otherwise.
 */
function validateISBN(code) {
    const cleanCode = code.replace(/[^0-9X]/g, "");
    if (cleanCode.startsWith("978") || cleanCode.startsWith("979")) {
        return cleanCode;
    }
    return null;
}

/**
 * Exports the scanned list to a CSV file.
 * @param {Array} scannedISBNS - Array of book objects {isbn, title, author}
 */
function exportToCSV(scannedISBNS) {
    if (scannedISBNS.length === 0) {
        alert("No books scanned yet!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,ISBN,Title,Author\n";
    scannedISBNS.forEach(function (book) {
        const safeTitle = `"${(book.title || "").replace(/"/g, '""')}"`;
        const safeAuthor = `"${(book.author || "").replace(/"/g, '""')}"`;
        csvContent += `${book.isbn},${safeTitle},${safeAuthor}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_church_books.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
