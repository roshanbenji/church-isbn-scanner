// js/app.js

let scannedISBNS = [];
let isScanning = false;
let pendingISBN = null;
let pendingBookData = null;




// --- Logic Functions ---

async function onScanSuccess(code) {
    if (!isScanning) return;

    // 1. Basic format validation
    const cleanCode = validateISBN(code);
    if (!cleanCode) return;

    // Pause scanning while we process
    isScanning = false;



    // 2. Fetch Book Info
    const bookInfo = await fetchBookDetails(cleanCode);

    // 3. Show Confirmation Loop
    showConfirmModal(cleanCode, bookInfo);
}

function showConfirmModal(isbn, bookInfo) {
    pendingISBN = isbn;
    pendingBookData = bookInfo;

    document.getElementById("modal-title").innerText = bookInfo.title || "Unknown Title";
    document.getElementById("modal-author").innerText = bookInfo.author || "";

    const coverImg = document.getElementById("modal-cover");
    if (bookInfo.cover) {
        coverImg.src = bookInfo.cover;
        coverImg.style.display = "block";
        coverImg.style.margin = "0 auto 10px auto";
    } else {
        coverImg.style.display = "none";
    }

    document.getElementById("confirm-modal").style.display = "flex";
}

function confirmScan(shouldAdd) {
    document.getElementById("confirm-modal").style.display = "none";

    if (shouldAdd && pendingISBN) {
        scannedISBNS.push({
            isbn: pendingISBN,
            title: pendingBookData.title,
            author: pendingBookData.author
        });
        updateList();
    }

    pendingISBN = null;
    pendingBookData = null;

    // Resume scanning after short delay
    setTimeout(() => { isScanning = true; }, 1000);
}

function updateList() {
    const listElement = document.getElementById("isbn-list");
    const countElement = document.getElementById("count");

    listElement.innerHTML = "";

    // Map original indices (delete logic preserved)
    const booksWithIndices = scannedISBNS.map((book, index) => ({ book, index }));

    // Re-draw list in reverse order
    booksWithIndices.reverse().forEach(({ book, index }) => {
        let li = document.createElement("li");
        li.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <span style="font-weight:bold;">${book.title}</span>
                <span style="font-size:0.85em; color:#666;">${book.author}</span>
                <span class="isbn-text" style="font-size:0.8em;">${book.isbn}</span>
            </div>
            <button onclick="deleteBook(${index})" style="background:none; border:none; cursor:pointer; font-size:1.2em; color:red; width:auto; padding:0 10px;">❌</button>
        `;
        listElement.appendChild(li);
    });

    countElement.innerText = scannedISBNS.length;
}

function deleteBook(index) {
    if (confirm("Delete this book?")) {
        scannedISBNS.splice(index, 1);
        updateList();
    }
}

function clearList() {
    if (confirm("Are you sure you want to clear the list?")) {
        scannedISBNS = [];
        updateList();
    }
}

// --- Initialization ---

function startScanner() {


    // 2. Hide Overlay
    document.getElementById("start-overlay").style.display = "none";

    // 3. Start Quagga
    initQuagga(onScanSuccess);
    isScanning = true;
}

// Cleanup when leaving page
window.onbeforeunload = () => {
    stopScanner();
};

// Expose functions to global scope for HTML event handlers
window.startScanner = startScanner;
window.confirmScan = confirmScan;
window.deleteBook = deleteBook;
window.exportToCSV = () => exportToCSV(scannedISBNS); // Wrapper to pass data
window.clearList = clearList;
