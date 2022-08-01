//FIXME: Add collection list to books instead of collection list and improve site performance. 

// Materialize Auto Init
M.AutoInit();

// Import packages
const { ipcRenderer } = require('electron');
const path = require('path');

// Id
let id = null;

// Add to collection
function addToCollection(element) {
    const bookList = JSON.parse(window.localStorage.getItem('books')) || []; // Book List
    const bookId = element.getAttribute('id'); // Book Id
    let collectionList = JSON.parse(window.localStorage.getItem('collections')) || []; // Collection List
    for (let i = 0; i < collectionList.length; i++) {
        if (collectionList[i].id === id) {
            for (let j = 0; j < bookList.length; j++) {
                if (bookList[j].id === bookId) {
                    collectionList[i].books.push(bookList[j]);
                    localStorage.setItem('collections', JSON.stringify(collectionList));
                    window.location.reload();
                }
            }
        }
    }
}

// Load Book List
function loadBookList() {
    const collection = document.getElementById('book-collection');
    const bookList = JSON.parse(localStorage.getItem('books')) || [];

    if (collection.innerHTML.length === 18) {
        for (let i = 0; i < bookList.length; i++) {
            const li = document.createElement('li');
            li.classList.add('collection-item');
            li.innerHTML = `
                        <div>${bookList[i].title}<a href="#!" class="secondary-content" id="${bookList[i].id}" onclick="addToCollection(this)"><i class="material-icons">add</i></a></div>
                    `
            collection.appendChild(li);
        }
    }
}

document.getElementById('add').onclick = () => {
    loadBookList();
}

// Add multiple or single classes to element
function addClass(element, classes) {
    if (Array.isArray(classes)) {
        for (let i = 0; i < classes.length; i++) {
            element.classList.add(classes[i]);
        }
    } else {
        element.classList.add(classes);
    }
}


// Change Author
function changeAuthor(input) {
    //FIXME: Change Author for collection books too
    if (event.key === 'Enter') {
        const authorName = input.value;
        const id = input.getAttribute('class');
        let books = JSON.parse(window.localStorage.getItem('books')) || [];
        for (let i = 0; i < books.length; i++) {
            if (books[i].id === id) {
                books[i].author = authorName;
                break;
            }
        }
        localStorage.setItem('books', JSON.stringify(books));
    }
}

// Create Card
function createCard({ id, title, author, url, finished }, parent) {
    // Check if book finished
    const checked = finished ? 'checked' : '';

    // Create card element
    let card = document.createElement('div');
    const classes = ['col', 's12', 'm3']
    addClass(card, classes);
    const lang = path.join(__dirname, `lang/${localStorage.getItem('lang') || 'en'}.json`);
    const { read, readed } = require(lang);

    //TODO: Add photo change option
    card.innerHTML = `
                <div class="card">
                    <div class="card-image waves-effect waves-block waves-light">
                        <img class="activator" src="./book.jpeg">
                    </div>
                    <div class="card-content">
                        <span class="card-title activator grey-text text-darken-4">${title}<i
                                class="material-icons right">more_vert</i></span>
                        <p><a href="${path.join(__dirname, 'reading.html') + `?file=${url}`}">${read}</a></p>
                    </div>
                    <div class="card-reveal">
                        <span class="card-title grey-text text-darken-4">${title}<i class="material-icons right">close</i></span>
                        <p>Author: ${author}</p>
                        <div class="input-field col s12">
                            <input id="author" type="text" class="${id}" onkeydown="changeAuthor(this)">
                            <label for="author">Author</label>
                        </div>
                        <p>
                            <label>
                                <input type="checkbox" class="filled-in" onchange="addFinished(this)" id="${id}" ${checked} />
                                <span>${readed}</span>
                            </label>
                        </p>
                    </div>
                </div>`;

    parent.appendChild(card);
}

// Load Book Collection
function loadBookCollection(id) {
    let collectionList = JSON.parse(localStorage.getItem('collections')) || []; // Collection List
    const parent = document.getElementById('collection');
    for (let i = 0; i < collectionList.length; i++) {
        if (collectionList[i].id === id) {
            for (let j = 0; j < collectionList[i].books.length; j++) {
                createCard(collectionList[i].books[j], parent);
            }
            break;
        }
    }
}

// Load
window.onload = () => {
    const params = new URLSearchParams(window.location.search); // Get parameters from the url
    id = params.get('id'); // Get collection id (`?id='collection_id'`)
    loadBookCollection(id);
}

// Home Page
ipcRenderer.on('home', () => {
    // Set location to the index.html
    window.location.href = path.join(__dirname, 'index.html');
})