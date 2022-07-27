// Import packages
const { ipcRenderer } = require('electron');
const path = require('path');
const { readFile, readdir } = require('fs');

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

// Change Author
function changeAuthor(input) {
    if(event.key === 'Enter'){
        const authorName = input.value;
        const id = input.getAttribute('class');
        let books = JSON.parse(window.localStorage.getItem('books')) || [];
        for(let i = 0; i < books.length; i++){
            if(books[i].id === id){
                books[i].author = authorName;
                break;
            }
        }
        localStorage.setItem('books', JSON.stringify(books));
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
    const lang = path.join(__dirname, `lang/${localStorage.getItem('lang') || 'en'}.json`);
    const {read, readed} = require(lang);

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

// Load language
function loadLang(){
    // Get information about the language
    const lang = localStorage.getItem('lang');
    if (!lang) return

    // Set language in language menu (in settings)
    document.getElementById('lang').value = lang;

    if(lang === 'en') return

    // Language location
    const langDirectory = path.join(__dirname, 'lang');
    const langFile = path.join(langDirectory, `${lang}.json`);

    // Elements
    const elements = ['about', 'all-books', 'favorites', 'collections', 'settings', 'book-list', 'close'];

    // Read the content of the file
    readFile(langFile, 'utf-8', (err, data) => {
        if (err) throw err
        // Content of the file (in object type)
        const content = JSON.parse(data);

        // Convert the all text
        for(let i = 0; i < elements.length; i++){
            const text = content[elements[i]];
            document.getElementById(`${elements[i]}-text`).innerText = text;
        }
    })
}

// Select Language
document.getElementById('lang').onchange = () => {
    const option = document.getElementById('lang').value;
    localStorage.setItem('lang', option);
    window.location.reload();
}

// Load window
window.onload = () => {
    loadList();
    loadLang();
}
