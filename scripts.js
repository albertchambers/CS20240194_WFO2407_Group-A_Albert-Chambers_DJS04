// @ts-check

import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';
import { BookPreview } from './components/book-preview.js';

let page = 1; // Current page number
let matches = books; // Holds the current list of matched books

// DOM elements to interact with
const elements = {
    listItems: document.querySelector('[data-list-items]'),
    listButton: document.querySelector('[data-list-button]'),
    searchOverlay: document.querySelector('[data-search-overlay]'),
    searchTitle: document.querySelector('[data-search-title]'),
    searchForm: document.querySelector('[data-search-form]'),
    settingsOverlay: document.querySelector('[data-settings-overlay]'),
    settingsForm: document.querySelector('[data-settings-form]'),
    message: document.querySelector('[data-list-message]'),
    cancelSearch: document.querySelector('[data-search-cancel]'),
    cancelSettings: document.querySelector('[data-settings-cancel]'),
    headerSearch: document.querySelector('[data-header-search]'),
    headerSettings: document.querySelector('[data-header-settings]'),
    listClose: document.querySelector('[data-list-close]'),
    listBlur: document.querySelector('[data-list-blur]'),
    listImage: document.querySelector('[data-list-image]'),
    listTitle: document.querySelector('[data-list-title]'),
    listSubtitle: document.querySelector('[data-list-subtitle]'),
    listDescription: document.querySelector('[data-list-description]'),
};

/** Renders the initial set of books on page load. */
const renderInitialBooks = () => {
    try {
        const initialBooks = matches.slice(0, BOOKS_PER_PAGE);
        const fragment = document.createDocumentFragment();

        initialBooks.forEach(bookData => {
            const previewElement = document.createElement('book-preview');
            previewElement.setAttribute('id', bookData.id);
            previewElement.setAttribute('title', bookData.title);
            previewElement.setAttribute('author', authors[bookData.author] || 'Unknown Author');
            previewElement.setAttribute('image', bookData.image);
            previewElement.addEventListener('click', showBookDetails); // Ensure this function is defined

            fragment.appendChild(previewElement);
        });

        elements.listItems.appendChild(fragment);
        page = 1; // Start page counter after initial render
        updateListButton(); // Ensure this function updates the button state correctly
    } catch (error) {
        console.error('Error rendering books:', error); // Improved error handling
    }
};

/** Sets up the genres dropdown. */
const setupGenres = () => {
    const genreHtml = createSelectOptions(genres, 'any', 'All Genres');
    document.querySelector('[data-search-genres]')?.appendChild(genreHtml);
};

/** Sets up the authors dropdown. */
const setupAuthors = () => {
    const authorsHtml = createSelectOptions(authors, 'any', 'All Authors');
    document.querySelector('[data-search-authors]')?.appendChild(authorsHtml);
};

/**
 * Creates select options for dropdowns.
 * @param {Object} data - The data to create options from.
 * @param {string} defaultValue - The default value for the select.
 * @param {string} defaultText - The default text for the select.
 * @returns {DocumentFragment}
 */
const createSelectOptions = (data, defaultValue, defaultText) => {
    const fragment = document.createDocumentFragment();
    const firstElement = document.createElement('option');
    firstElement.value = defaultValue;
    firstElement.innerText = defaultText;
    fragment.appendChild(firstElement);

    for (const [id, name] of Object.entries(data)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        fragment.appendChild(element);
    }
    return fragment;
};

/** Sets the initial theme based on user preference. */
const setInitialTheme = () => {
    try {
        const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';

        if (elements.listButton instanceof HTMLElement) {
            elements.listButton.innerText = `Show more (${books.length - BOOKS_PER_PAGE})`;
        }

        updateTheme(theme);

        const themeSettingElement = document.querySelector('[data-settings-theme]');
        if (themeSettingElement instanceof HTMLInputElement) {
            themeSettingElement.value = theme;
        }
    } catch (error) {
        console.error("Error setting initial theme:", error);
    }
};

/**
 * Updates the theme of the page.
 * @param {string} theme - The current theme ('day' or 'night').
 */
const updateTheme = (theme) => {
    const colorSettings = theme === 'night'
        ? { dark: '255, 255, 255', light: '10, 10, 20' }
        : { dark: '10, 10, 20', light: '255, 255, 255' };

    document.documentElement.style.setProperty('--color-dark', colorSettings.dark);
    document.documentElement.style.setProperty('--color-light', colorSettings.light);
};

/** Sets up event listeners for various elements. */
const setupEventListeners = () => {
    elements.cancelSearch.addEventListener('click', () => closeOverlay(elements.searchOverlay));
    elements.cancelSettings.addEventListener('click', () => closeOverlay(elements.settingsOverlay));
    elements.headerSearch.addEventListener('click', () => openOverlay(elements.searchOverlay, elements.searchTitle));
    elements.headerSettings.addEventListener('click', () => openOverlay(elements.settingsOverlay));
    elements.listClose.addEventListener('click', () => closeOverlay(document.querySelector('[data-list-active]')));
    elements.settingsForm.addEventListener('submit', handleSettingsSubmit);
    elements.searchForm.addEventListener('submit', handleSearchSubmit);
    elements.listButton.addEventListener('click', loadMoreBooks);
    elements.listItems.addEventListener('click', showBookDetails);
};

/**
 * Opens a specified overlay and focuses on a given element.
 * @param {HTMLElement} overlay - The overlay element to open.
 * @param {HTMLElement} focusElement - The element to focus on.
 */
const openOverlay = (overlay, focusElement) => {
    overlay.open = true;
    if (focusElement) focusElement.focus();
};

/** Closes a specified overlay.
 * @param {HTMLElement} overlay - The overlay element to close.
 */
const closeOverlay = (overlay) => {
    overlay.open = false;
};

/**
 * Handles the submission of the settings form.
 * @param {Event} event - The form submission event.
 */
const handleSettingsSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    updateTheme(theme);
    closeOverlay(elements.settingsOverlay);
};

/**
 * Handles the submission of the search form.
 * @param {Event} event - The form submission event.
 */
const handleSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    matches = filterBooks(filters);
    renderFilteredBooks();
};

/**
 * Filters books based on search criteria.
 * @param {Object} filters - The filters to apply.
 * @returns {Array}
 */
const filterBooks = (filters) => {
    return books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return titleMatch && authorMatch && genreMatch;
    });
};

/** Renders filtered books after search.
 * Handles the case when no matches are found.
 */
const renderFilteredBooks = () => {
    try {
        if (matches.length < 1) {
            elements.message.classList.add('list__message_show');
        } else {
            elements.message.classList.remove('list__message_show');
        }

        elements.listItems.innerHTML = '';
        const newItems = document.createDocumentFragment();
        for (const bookData of matches.slice(0, BOOKS_PER_PAGE)) {
            const previewElement = new BookPreview();
            previewElement.setAttribute('id', bookData.id);
            previewElement.setAttribute('title', bookData.title);
            previewElement.setAttribute('author', authors[bookData.author] || 'Unknown Author');
            previewElement.setAttribute('image', bookData.image);

            newItems.appendChild(previewElement);
        }
        elements.listItems.appendChild(newItems);
        updateListButton();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeOverlay(elements.searchOverlay);
    } catch (error) {
        console.error("Error rendering filtered books:", error);
    }
};

/** Loads more books when the button is clicked. */
const loadMoreBooks = () => {
    try {
        const fragment = document.createDocumentFragment();
        const start = page * BOOKS_PER_PAGE;
        const end = (page + 1) * BOOKS_PER_PAGE;

        for (const bookData of matches.slice(start, end)) {
            const previewElement = new BookPreview();
            previewElement.setAttribute('id', bookData.id);
            previewElement.setAttribute('title', bookData.title);
            previewElement.setAttribute('author', authors[bookData.author] || 'Unknown Author');
            previewElement.setAttribute('image', bookData.image);

            fragment.appendChild(previewElement);
        }

        if (fragment.childNodes.length > 0) {
            elements.listItems.appendChild(fragment);
            page++;
            updateListButton();
        } else {
            alert('No more books to load.');
        }
    } catch (error) {
        console.error("Error loading more books:", error);
    }
};

/** Updates the visibility and text of the load more button. */
const updateListButton = () => {
    if (matches.length > (page * BOOKS_PER_PAGE)) {
        elements.listButton.classList.remove('hidden');
        elements.listButton.innerText = `Show more (${matches.length - (page * BOOKS_PER_PAGE)})`;
    } else {
        elements.listButton.classList.add('hidden');
    }
};

/** Shows details of a selected book. */
const showBookDetails = (event) => {
    const bookId = event.target.id; // Assuming that the book preview is clicked
    console.log('Clicked Book ID:', bookId); // Debugging output

    const bookData = books.find(book => book.id === bookId); // Compare as strings or convert if necessary

    if (bookData) {
        elements.listImage.src = bookData.image;
        elements.listTitle.innerText = bookData.title;
        elements.listSubtitle.innerText = authors[bookData.author] || 'Unknown Author';
        elements.listDescription.innerText = bookData.description;
        document.querySelector('[data-list-active]').open = true; // Opens the details overlay
    } else {
        console.error(`Book not found: ID ${bookId} does not match any books in the collection.`);
    }
};

// Initial function calls
renderInitialBooks();
setupGenres();
setupAuthors();
setInitialTheme();
setupEventListeners();
