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

export default class NoProposal extends HTMLElement {
  [CONTENT]: DocumentFragment;
  $btn: HTMLButtonElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this[CONTENT] = template.content.cloneNode(true) as DocumentFragment;
    this.$btn = this[CONTENT].getElementById(
      "create-a-proposal"
    ) as HTMLButtonElement;
  }

  connectedCallback() {
    this.shadowRoot?.appendChild(this[CONTENT]);

    this.$btn.addEventListener("click", (e) => {
      e.preventDefault();
      utils.redirect("/proposals/draft");
    });
  }
}

window.customElements.define("imbu-no-proposal", NoProposal);
