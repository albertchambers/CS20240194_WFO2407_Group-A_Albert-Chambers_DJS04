// @ts-check

import { books, genres, BOOKS_PER_PAGE } from './data.js';
import { BookPreview } from './components/book-preview.js';

// Initialize state variables
let page = 1;
let matches = books;

// Define query selectors in an object for easy reference
const selectors = {
    listItems: document.querySelector('[data-list-items]'),
    searchCancel: document.querySelector('[data-search-cancel]'),
    settingsCancel: document.querySelector('[data-settings-cancel]'),
    headerSearch: document.querySelector('[data-header-search]'),
    headerSettings: document.querySelector('[data-header-settings]'),
    listClose: document.querySelector('[data-list-close]'),
    settingsForm: document.querySelector('[data-settings-form]'),
    searchForm: document.querySelector('[data-search-form]'),
    listButton: document.querySelector('[data-list-button]'),
    listMessage: document.querySelector('[data-list-message]'),
    searchOverlay: document.querySelector('[data-search-overlay]'),
    settingsOverlay: document.querySelector('[data-settings-overlay]'),
    listActive: document.querySelector('[data-list-active]'),
    listBlur: document.querySelector('[data-list-blur]'),
    listImage: document.querySelector('[data-list-image]'),
    listTitle: document.querySelector('[data-list-title]'),
    listSubtitle: document.querySelector('[data-list-subtitle]'),
    listDescription: document.querySelector('[data-list-description]'),
    settingsTheme: document.querySelector('[data-settings-theme]'),
    searchGenres: document.querySelector('[data-search-genres]'),
    searchAuthors: document.querySelector('[data-search-authors]'),
};

// Function to render initial books
const renderInitialBooks = () => {
    const starting = document.createDocumentFragment();
    matches.slice(0, BOOKS_PER_PAGE).forEach(book => {
        const bookPreview = new BookPreview(); // Create an instance of the BookPreview Web Component
        bookPreview.book = book; // Set the book property
        starting.appendChild(bookPreview);
    });
    selectors.listItems.appendChild(starting);
};

// Function to populate genres dropdown
const populateGenres = () => {
    const genreHtml = document.createDocumentFragment();
    const firstGenreElement = document.createElement('option');
    firstGenreElement.value = 'any';
    firstGenreElement.innerText = 'All Genres';
    genreHtml.appendChild(firstGenreElement);

    for (const [id, name] of Object.entries(genres)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        genreHtml.appendChild(element);
    }

    selectors.searchGenres.appendChild(genreHtml);
};

// Function to set theme based on user preference
const setTheme = () => {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeValue = isDarkMode ? 'night' : 'day';
    
    document.querySelector('[data-settings-theme]').value = themeValue;
    document.documentElement.style.setProperty('--color-dark', isDarkMode ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', isDarkMode ? '10, 10, 20' : '255, 255, 255');
};

// Function to update "Show more" button
const updateShowMoreButton = () => {
    const remainingBooks = matches.length - (page * BOOKS_PER_PAGE);
    selectors.listButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
    `;
    selectors.listButton.disabled = remainingBooks <= 0;
};

// Function to setup event listeners
const setupEventListeners = () => {
    selectors.searchCancel.addEventListener('click', () => {
        selectors.searchOverlay.open = false;
    });

    selectors.settingsCancel.addEventListener('click', () => {
        selectors.settingsOverlay.open = false;
    });

    selectors.headerSearch.addEventListener('click', () => {
        selectors.searchOverlay.open = true;
        document.querySelector('[data-search-title]').focus();
    });

    selectors.headerSettings.addEventListener('click', () => {
        selectors.settingsOverlay.open = true;
    });

    selectors.listClose.addEventListener('click', () => {
        selectors.listActive.open = false;
    });

    selectors.settingsForm.addEventListener('submit', handleSettingsSubmit);

    selectors.searchForm.addEventListener('submit', handleSearchSubmit);

    selectors.listButton.addEventListener('click', loadMoreBooks);

    selectors.listItems.addEventListener('click', handleBookClick);
};

// Handler for settings form submission
const handleSettingsSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    
    const isNightMode = theme === 'night';
    document.documentElement.style.setProperty('--color-dark', isNightMode ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', isNightMode ? '10, 10, 20' : '255, 255, 255');
    
    selectors.settingsOverlay.open = false;
};

// Handler for search form submission
const handleSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = books.filter(book => 
        (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (filters.author === 'any' || book.author === filters.author) &&
        (filters.genre === 'any' || book.genres.includes(filters.genre))
    );

    page = 1;
    matches = result;

    if (result.length < 1) {
        selectors.listMessage.classList.add('list__message_show');
    } else {
        selectors.listMessage.classList.remove('list__message_show');
    }

    renderFilteredBooks(result);
    updateShowMoreButton();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    selectors.searchOverlay.open = false;
};

// Render filtered books based on search results
const renderFilteredBooks = (result) => {
    selectors.listItems.innerHTML = '';
    const newItems = document.createDocumentFragment();
    result.slice(0, BOOKS_PER_PAGE).forEach(book => {
        const bookPreview = new BookPreview();
        bookPreview.book = book; // Set the book property
        newItems.appendChild(bookPreview);
    });
    selectors.listItems.appendChild(newItems);
};

// Load more books on button click
const loadMoreBooks = () => {
    const fragment = document.createDocumentFragment();
    matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE).forEach(book => {
        const bookPreview = new BookPreview();
        bookPreview.book = book;
        fragment.appendChild(bookPreview);
    });
    selectors.listItems.appendChild(fragment);
    page += 1;
    updateShowMoreButton();
};

// Handle book click event to display details
const handleBookClick = (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    const active = pathArray.find(node => node?.dataset?.preview && books.find(book => book.id === node.dataset.preview));

    if (active) {
        const book = books.find(book => book.id === active.dataset.preview);
        displayBookDetails(book);
    }
};

// Display the details of the clicked book
const displayBookDetails = (book) => {
    selectors.listActive.open = true;
    selectors.listBlur.src = book.image;
    selectors.listImage.src = book.image;
    selectors.listTitle.innerText = book.title;
    selectors.listSubtitle.innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
    selectors.listDescription.innerText = book.description;
};

// Initialize the application
const initializeApp = () => {
    renderInitialBooks();
    populateGenres();
    setTheme();
    updateShowMoreButton();
    setupEventListeners();
};

initializeApp();
