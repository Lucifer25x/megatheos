// Import packages
const { ipcRenderer } = require('electron');
const path = require('path');

// Create random ID
function createRandomId() {
    const [idLength, chars] = [3, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"]; // ID Length and Characters
    let id = '';
    for (let i = 0; i < idLength; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length)); // add random character to ID
    }
    return id;
}

// Add to the finished books list
function addFinished(checkbox) {
    let bookList = JSON.parse(window.localStorage.getItem('books')); // Get books list from localStorage
    const id = checkbox.getAttribute('id'); // Get ID attribute of checkbox

    // Find book from books list with ID
    for (let i = 0; i < bookList.length; i++) {
        if (bookList[i].id === id) {
            // If the checkbox is checked, the book is finished, otherwise the book is not finished.
            bookList[i].finished = checkbox.checked;
            break;
        }
    }
    // Change books list
    localStorage.setItem('books', JSON.stringify(bookList));
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

// Create card
function createCard({id, title, author, url, finished}, parent) {
    // Check if book finished
    const checked = finished ? 'checked' : '';

    // Create card element
    let card = document.createElement('div');
    const classes = ['col', 's12', 'm3']
    addClass(card, classes);
    card.innerHTML = `
                <div class="card grey darken-4 darken-1">
                    <div class="card-content white-text">
                        <span class="card-title">${title}</span>
                        <p>Author: ${author}</p>
                        <br/>
                        <p>
                            <label>
                                <input type="checkbox" class="filled-in" onchange="addFinished(this)" id="${id}" ${checked}/>
                                <span>Finished</span>
                            </label>
                        </p>
                    </div>
                    <div class="card-action">
                        <a href="${path.join(__dirname, 'reading.html') + `?file=${url}`}">Read the book</a>
                        <a href="#">Edit Info</a>
                    </div>
                </div>`

    parent.appendChild(card);
}

// Load reading list and favorites
function loadList() {
    // Parent elements of the lists
    const [readingListParent, favoritesListParent] = [document.getElementById('all-books'), document.getElementById('favorites')];

    // If there are 'books' in localStorage it will copy it, otherwise it will create empty array
    let books = JSON.parse(window.localStorage.getItem('books')) || [];

    for (let i = 0; i < books.length; i++) {
        // Add to the reading list
        createCard(books[i], readingListParent);

        // Add to the favorites list
        if (books[i].favorite) {
            createCard(books[i], favoritesListParent);
        }
    }
}

// Open File
ipcRenderer.on('file', (event, location) => {
    if (location) {
        // If there are 'books' in localStorage it will copy it, otherwise it will create empty array
        let books = JSON.parse(window.localStorage.getItem('books')) || [];

        // Book element for the list
        let book = {
            id: createRandomId(),
            title: location.replace(/^.*[\\\/]/, ''),
            finished: false,
            favorite: false,
            author: null,
            url: location
        }

        //  Check if the book exists
        let isExist = false;
        for (let i = 0; i < books.length; i++) {
            if (books[i].url === location) {
                isExist = true;
            }
        }
        if (!isExist) {
            books.push(book);
            localStorage.setItem('books', JSON.stringify(books));
        }

        const readingUrl = path.join(__dirname, 'reading.html') + `?file=${location}`;
        window.location.href = readingUrl;
    }
})

// Add favorite function
function addFavorite(element) {
    let bookList = JSON.parse(window.localStorage.getItem('books'));
    const id = element.getAttribute('id');
    for (let i = 0; i < bookList.length; i++) {
        if (bookList[i].id === id) {
            // If the book is not a favorite, make 'favorite' true, otherwise set 'favorite' false
            bookList[i].favorite = !bookList[i].favorite;
            window.location.reload();
            break;
        }
    }
    localStorage.setItem('books', JSON.stringify(bookList));
}

// Add books to favorites
document.getElementById('add').onclick = () => {
    let books = JSON.parse(localStorage.getItem('books')) || [];
    const collection = document.getElementById('book-collection');
    if(collection.innerHTML.length === 18){
        for (let i = 0; i < books.length; i++) {
            const li = document.createElement('li');
            addClass(li, 'collection-item')
            li.innerHTML = `
            <div>${books[i].title}<a href="#!" class="secondary-content" id="${books[i].id}" onclick="addFavorite(this)"><i class="material-icons">favorites</i></a></div>
            `
            collection.appendChild(li);
        }
    }
}

// Load window
window.onload = () => {
    loadList();
}
