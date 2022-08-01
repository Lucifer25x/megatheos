// Import packages
const { ipcRenderer } = require('electron');
const path = require('path');

window.onload = () => {
    const preview = document.getElementById('preview'); // Iframe
    const params = new URLSearchParams(window.location.search); // Get parameters from the url
    const file = params.get('file'); // Get file path from url (`?file='location'`)
    preview.src = file; // Set iframe source
    preview.width = window.innerWidth; // Set iframe width
    preview.height = window.innerHeight; // Set iframe height
}

// Home Page
ipcRenderer.on('home', () => {
    // Set location to the index.html
    window.location.href = path.join(__dirname, 'index.html');
})