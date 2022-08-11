import html from "./index.html";
import css from "./index.css";
import type { Proposal } from "../../model";

import "../proposal-item";
import ProposalItem from "../proposal-item";

import * as model from "../../model";
import * as utils from "../../utils";

const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    <style>${css}</style>
    ${html}
`;


export default class List extends HTMLElement {
    private [CONTENT]: DocumentFragment;

    $list: HTMLOListElement;

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$list =
            this[CONTENT].getElementById("list") as
                HTMLOListElement;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
    }

    async init() {
        this.$list.innerHTML = "";

        await this.fetchProjects().then(projects => {
            if (projects) {
                this.renderProjects(projects);
            }
        });
    }

    async fetchProjects() {
        const resp = await model.fetchProjects();
        if (resp.ok) {
            return await resp.json();
        } else {
            // probably only 500+ here since this is a listing route
            this.dispatchEvent(utils.badRouteEvent("server-error"));
        }
    }

    renderProjects(proposals: Proposal[]) {
        proposals.forEach(proposal => {
            this.$list.appendChild(new ProposalItem(proposal));
        });
    }
}

window.customElements.define("imbu-proposals-list", List);
