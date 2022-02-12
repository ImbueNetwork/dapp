import "../form/form";

import html from "./page.html";
import css from "./page.css";
import GrantSubmissionForm from "../form/form";

const template = document.createElement("template");
template.innerHTML = `
<style>${css}</style>
${html}
`;
const CONTENT = Symbol();


export default class Page extends HTMLElement {
    [CONTENT]: DocumentFragment;
    $form: GrantSubmissionForm

    constructor() {
        super();
        this.attachShadow({mode:"open"});

        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$form =
            this[CONTENT].getElementById("form") as
                GrantSubmissionForm;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
    }

    init() {
        return this.$form?.init();
    }
}

window.customElements.define("imbu-grant-submission-page", Page);
