// @ts-check
import { authors } from '../data.js';

/**
 * Custom BookPreview Web Component
 */
export class BookPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._book = null; // Initialize book property
    }

    set book(book) {
        this._book = book;
        this.render();
    }

    get book() {
        return this._book;
    }

    /**
     * Renders the book preview template in the shadow DOM.
     */
    render() {
        if (!this._book) return; // Prevent rendering if no book data is available

        const { author: authorId, id, image, title } = this.book;
        const authorName = this.populateAuthors(authorId); // Get the author's name

        // Render the template
        this.shadowRoot.innerHTML = this.createTemplate(id, image, title, authorName);
    }

    /**
     * Populates the author's name from the authors data.
     * @param {string} authorId - The author ID.
     * @returns {string} The author's name or a fallback message if not found.
     */
    populateAuthors(authorId) {
        return authors[authorId] || 'Unknown Author'; // Fallback message if author not found
    }

    /**
     * Creates the HTML template for the book preview.
     * @param {string} id - The book ID.
     * @param {string} image - The book cover image URL.
     * @param {string} title - The book title.
     * @param {string} authorName - The author's name.
     * @returns {string} The HTML string for the book preview.
     */
    createTemplate(id, image, title, authorName) {
        return `
            <style>
                .preview {
                    border-width: 0;
                    width: 100%;
                    font-family: Roboto, sans-serif;
                    padding: 0.5rem 1rem;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    text-align: left;
                    border-radius: 8px;
                    border: 1px solid rgba(var(--color-dark), 0.15);
                    background: rgba(var(--color-light), 1);
                }
                @media (min-width: 60rem) {
                    .preview {
                        padding: 1rem;
                    }
                }
                .preview:hover {
                    background: rgba(var(--color-blue), 0.05);
                }
                .preview__image {
                    width: 48px;
                    height: 70px;
                    object-fit: cover;
                    background: grey;
                    border-radius: 2px;
                    box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2),
                                0 1px 1px 0 rgba(0, 0, 0, 0.1),
                                0 1px 3px 0 rgba(0, 0, 0, 0.1);
                }
                .preview__info {
                    padding: 1rem;
                }
                .preview__title {
                    margin: 0 0 0.5rem;
                    font-weight: bold;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    color: rgba(var(--color-dark), 0.8);
                }
                .preview__author {
                    color: rgba(var(--color-dark), 0.4);
                }
            </style>
            <button class="preview" data-preview="${id}" aria-label="${title} by ${authorName}">
                <img class="preview__image" src="${image}" alt="Cover image of ${title}" />
                <div class="preview__info">
                    <h3 class="preview__title">${title}</h3>
                    <div class="preview__author">
                        <slot name="data-search-overlay">${authorName}</slot>
                    </div>
                </div>
            </button>
        `;
    }

    /**
     * Called when the element is added to the DOM.
     */
    connectedCallback() {
        this.populateAuthorsDropdown();
        this.render();
        this.addEventListeners();
    }

    /**
     * Populates the authors dropdown.
     */
    populateAuthorsDropdown() {
        const authorsHtml = document.createDocumentFragment();
        const selectElement = document.querySelector('select[data-search-authors]'); // Select the target dropdown

        if (selectElement) {
            const firstAuthorElement = document.createElement('option');
            firstAuthorElement.value = 'any';
            firstAuthorElement.innerText = 'All Authors';
            authorsHtml.appendChild(firstAuthorElement);

            Object.entries(authors).forEach(([id, name]) => {
                const element = document.createElement('option');
                element.value = id;
                element.innerText = name;
                authorsHtml.appendChild(element);
            });

            selectElement.appendChild(authorsHtml); // Append authors to the select dropdown
        }
    }

    /**
     * Adds event listeners to handle interactions.
     */
    addEventListeners() {
        this.shadowRoot.querySelector('.preview').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('book-preview-clicked', {
                detail: { id: this.book.id },
                bubbles: true,
                composed: true,
            }));
        });
    }
}

// Define the custom element
customElements.define('book-preview', BookPreview);
