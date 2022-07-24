// Import packages
const { ipcRenderer } = require('electron');
const { cp } = require('fs');
const path = require('path');

// Create random id
function createRandomId() {
    const idLength = 3; // ID length
    let id = '';
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Characters
    for (let i = 0; i < idLength; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length)); // add random character to ID
    }

    return id;
}

// Add to the finished books list
function addFinished(checkbox) {
    let bookList = JSON.parse(window.localStorage.getItem('books')); // Get books list from localStorage
    const id = checkbox.getAttribute('id'); // Get ID
    
    // Find book from books list with ID
    for (let i = 0; i < bookList.length; i++) {
        if (bookList[i].id === id) {
            if (checkbox.checked) {
                bookList[i].finished = true;
            } else {
                bookList[i].finished = false;
            }
            break;
        }
    }
    // Change books list
    localStorage.setItem('books', JSON.stringify(bookList));
}

// Load reading list
function loadReadingList() {
    const bookList = window.localStorage.getItem('books');
    let books = JSON.parse(bookList) || [];
    if (books.length > 0) {
        books.forEach(book => {
            let title = book.title;
            let author = book.author;
            let url = book.url;
            let card = document.createElement('div');
            let checked = book.finished ? 'checked' : '';
            const parent = document.getElementById('all-books');
            card.classList.add('col');
            card.classList.add('s12');
            card.classList.add('m3');
            card.innerHTML = `
                <div class="card grey darken-4 darken-1">
                    <div class="card-content white-text">
                        <span class="card-title">${title}</span>
                        <p>Author: ${author}</p>
                        <br/>
                        <p>
                            <label>
                                <input type="checkbox" class="filled-in" onchange="addFinished(this)" id="${book.id}" ${checked}/>
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
        })
    }
}

// Load favorites list
function loadFavorites() {
    const bookList = window.localStorage.getItem('books');
    let books = JSON.parse(bookList) || [];
    if (books.length > 0) {
        books.forEach(book => {
            if (book.favorite) {
                let title = book.title;
                let author = book.author;
                let url = book.url;
                let card = document.createElement('div');
                let checked = book.finished ? 'checked' : '';
                const parent = document.getElementById('favorites');
                card.classList.add('col');
                card.classList.add('s12');
                card.classList.add('m3');
                card.innerHTML = `
                <div class="card grey darken-4 darken-1">
                    <div class="card-content white-text">
                        <span class="card-title">${title}</span>
                        <p>Author: ${author}</p>
                        <br/>
                        <p>
                            <label>
                                <input type="checkbox" class="filled-in" onchange="addFinished(this)" id="${book.id}" ${checked}/>
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
        })
    }
}

// Open File
ipcRenderer.on('file', (event, location) => {
    if (location) {
        const bookList = window.localStorage.getItem('books');
        let books = JSON.parse(bookList) || [];
        let book = {
            id: createRandomId(),
            title: location.replace(/^.*[\\\/]/, ''),
            finished: false,
            favorite: false,
            author: null,
            url: location
        }
        let isExist = false;
        if (books.length > 0) {
            for (let i = 0; i < books.length; i++) {
                if (books[i].url === location) {
                    isExist = true;
                }
            }
        }
        if (!isExist) {
            books.push(book);
            localStorage.setItem('books', JSON.stringify(books));
        }

        let readingUrl = path.join(__dirname, 'reading.html') + `?file=${location}`;
        window.location.href = readingUrl;
    }
})

// Add favorite function
function addFavorite(element) {
    let bookList = JSON.parse(window.localStorage.getItem('books'));
    const id = element.getAttribute('id');
    for (let i = 0; i < bookList.length; i++) {
        if (bookList[i].id === id ) {
            bookList[i].favorite = !bookList[i].favorite;
            if(bookList[i].favorite){
                let title = bookList[i].title;
                let author = bookList[i].author;
                let url = bookList[i].url;
                let card = document.createElement('div');
                let checked = bookList[i].finished ? 'checked' : '';
                const parent = document.getElementById('favorites');
                card.classList.add('col');
                card.classList.add('s12');
                card.classList.add('m3');
                card.innerHTML = `
                <div class="card grey darken-4 darken-1">
                    <div class="card-content white-text">
                        <span class="card-title">${title}</span>
                        <p>Author: ${author}</p>
                        <br/>
                        <p>
                            <label>
                                <input type="checkbox" class="filled-in" onchange="addFinished(this)" id="${bookList[i].id}" ${checked}/>
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
            } else {
                window.location.reload();
            }
            break;
        }
    }
    localStorage.setItem('books', JSON.stringify(bookList));
}

// Add books to favorites
document.getElementById('add').onclick = () => {
    let books = JSON.parse(localStorage.getItem('books')) || [];
    const collection = document.getElementById('book-collection');
    for (let i = 0; i < books.length; i++) {
        const li = document.createElement('li');
        li.classList.add('collection-item');
        li.innerHTML = `
        <div>${books[i].title}<a href="#!" class="secondary-content" id="${books[i].id}" onclick="addFavorite(this)"><i class="material-icons">favorites</i></a></div>
        `
        collection.appendChild(li);
    }
}

// Load window
window.onload = () => {
    loadReadingList();
    loadFavorites();
}
