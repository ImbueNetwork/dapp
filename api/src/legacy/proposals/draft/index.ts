import html from "./index.html";
import css from "./index.css";

import "./form";
import ProposalsDraftEditorForm from "./form";
import {ImbueRequest} from "../../dapp";


const template = document.createElement("template");
template.innerHTML = `
<style>${css}</style>
${html}
`;
const CONTENT = Symbol();


export default class Editor extends HTMLElement {
    [CONTENT]: DocumentFragment;
    $form: ProposalsDraftEditorForm

    constructor() {
        super();
        this.attachShadow({mode: "open"});

        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$form =
            this[CONTENT].getElementById("form") as
                ProposalsDraftEditorForm;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
    }

    init(request: ImbueRequest) {
        return this.$form?.init(request);
    }
}

window.customElements.define("imbu-proposals-draft-editor", Editor);
