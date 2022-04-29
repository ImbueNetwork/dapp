import html from "./index.html";
import css from "./index.css";
import type { Proposal } from "../../model";
import * as config from "../../config";
import * as utils from "../../utils";


const template = document.createElement("template");
template.innerHTML = `
<style>${css}</style>
${html}
`;

const CONTENT = Symbol();


export default class Item extends HTMLElement {
    [CONTENT]: DocumentFragment;
    $name: HTMLElement;
    $img: HTMLImageElement;
    $contribute: HTMLAnchorElement;
    proposal: Proposal;

    /**
     * Because this constructor has a param, it cannot be used declaratively
     * in HTML and must be instantiated like:
     *
     * ```javascript
     * const item = new Item(proposal);
     * ```
     */
    constructor(proposal: Proposal) {
        super();
        this.attachShadow({mode:"open"});

        this.proposal = proposal;

        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;
        this.$img =
            this[CONTENT].getElementById("img") as
                HTMLImageElement;
        this.$name =
            this[CONTENT].getElementById("name") as
                HTMLElement;
        this.$contribute =
            this[CONTENT].getElementById("contribute") as
                HTMLAnchorElement;

        this.$img.src = proposal.logo;

        if (proposal.chain_project_id) {
            this.$name.innerText = proposal.name;
        }
        else
        {
            this.$name.innerText = `${proposal.name} (draft)`;
        }

        /**
         * This is for a11y only. Do not use this to do any actual
         * routing.
         */
        this.$contribute.href = `${config.context}${this.href}`;
    }

    get href() {
        if (this.proposal.chain_project_id) {
            return `${config.grantProposalsURL}/detail/${this.proposal.id}`;
        }
        else
        {
            return `${config.grantProposalsURL}/preview`;
        }
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);

        this.$contribute.addEventListener("click", e => {
            e.preventDefault();
            utils.redirect(this.href);
        });
    }
}

window.customElements.define("imbu-proposal-item", Item);
