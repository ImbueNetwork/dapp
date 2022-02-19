import html from "./index.html";
import css from "./index.css";
import type { Project } from "../../model";

import "../proposal-item";
import ProposalItem from "../proposal-item";

import * as config from "../../config";


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
        const resp = await fetch(
            `${config.apiBase}/projects/`,
            {headers: config.getAPIHeaders}
        );
        if (resp.ok) {
            return await resp.json();
        }
    }

    renderProjects(projects: Project[]) {

        // for (let i of [1,1,1,1,1,1,1,1,1,1])
        projects.forEach(project => {
            this.$list.appendChild(new ProposalItem(project));
        });
    }
}

window.customElements.define("imbu-proposals-list", List);
