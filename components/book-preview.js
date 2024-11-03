export class BookPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Create elements
        const wrapper = document.createElement('button');
        const image = document.createElement('img');
        const info = document.createElement('div');
        const title = document.createElement('h3');
        const author = document.createElement('div');

        // Set attributes and classes
        wrapper.classList.add('preview');
        image.classList.add('preview__image');
        info.classList.add('preview__info');

        // Append elements
        info.appendChild(title);
        info.appendChild(author);
        wrapper.appendChild(image);
        wrapper.appendChild(info);
        this.shadowRoot.append(wrapper);

        // Styles
        const style = document.createElement('style');
        style.textContent = `
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

                .preview_hidden {
                display: none;
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
                box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
                    0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
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
                color: rgba(var(--color-dark), 0.8)
                }

                .preview__author {
                color: rgba(var(--color-dark), 0.4);
                }
            }
        `;

        this.shadowRoot.appendChild(style);
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['data-id', 'data-image', 'data-title', 'data-author'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    render() {
        const id = this.getAttribute('data-id');
        const image = this.getAttribute('data-image');
        const title = this.getAttribute('data-title');
        const author = this.getAttribute('data-author');

        // Set content
        this.shadowRoot.querySelector('img').src = image;
        this.shadowRoot.querySelector('h3').textContent = title;
        this.shadowRoot.querySelector('.preview__author').textContent = author;

        // Set data attribute for click handling
        this.setAttribute('data-preview', id);
    }
}

// Define the custom element
customElements.define('book-preview', BookPreview);