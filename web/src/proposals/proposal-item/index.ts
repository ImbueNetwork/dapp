import html from "./index.html";
import css from "./index.css";
import type { Project } from "../../model";

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

    constructor(proposal?: Project) {
        super();
        this.attachShadow({mode:"open"});

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

        if (proposal) {
            this.$img.src = proposal.logo;
            this.$name.innerText = proposal.name;
            this.$contribute.href = `/dapp/proposals/detail/${proposal.id}`;
        }
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
    }
}

window.customElements.define("imbu-proposal-item", Item);
