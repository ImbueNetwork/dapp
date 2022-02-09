import "../form/form";

import html from "./page.html";
import css from "./page.css";

const template = document.createElement("template");
template.innerHTML = `
<style>${css}</style>
${html}
`;
const CONTENT = Symbol();


export default class Page extends HTMLElement {
    [CONTENT]: DocumentFragment;

    constructor() {
        super();
        this.attachShadow({mode:"open"});

        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
    }
}

window.customElements.define("imbu-grant-submission-page", Page);
