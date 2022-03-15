import html from "./index.html";
import css from "./index.css";
import type { Proposal } from "../../model";

import "./form";
import ProposalsMilestoneSubmitForm from "./form";

import * as model from "../../model";
import * as utils from "../../utils";
import { ImbueRequest } from "../../dapp";

const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    <style>${css}</style>
    ${html}
`;


export default class SubmitMilestone extends HTMLElement {
    private [CONTENT]: DocumentFragment;

    $form: ProposalsMilestoneSubmitForm;

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$form =
            this[CONTENT].getElementById("milestone-form") as
            ProposalsMilestoneSubmitForm;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
    }

    async init(request: ImbueRequest) {
        return this.$form?.init(request);
    }
}

window.customElements.define("imbu-proposals-submit-milestone", SubmitMilestone);
