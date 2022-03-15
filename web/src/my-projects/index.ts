import html from "./index.html";
import css from "./index.css";

import Pages from "@pojagi/hoquet/lib/pages/pages";
import Route from "@pojagi/hoquet/lib/route/route";



import "../my-projects/listing";
import List from "../my-projects/listing";

import * as utils from "../utils";
import { ImbueRequest } from "../dapp";


const template = document.createElement("template");
template.innerHTML = `
<style>${css}</style>
${html}
`;


const CONTENT = Symbol();


export default class MyProjects extends HTMLElement {
    [CONTENT]: DocumentFragment;
    $pages: Pages;

    constructor() {
        super();
        this.attachShadow({mode:"open"});

        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$pages =
            this[CONTENT].getElementById("pages") as
                Pages;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
    }

    route(path: string | null, request: ImbueRequest) {
        if (!path) {
            this.$pages.select("listing");
            (this.$pages.selected as List).init(request);
            return;
        }

        const route = new Route("/:page", path);

        switch (route.data?.page) {
            default:
                this.dispatchEvent(utils.badRouteEvent("not-found"));
        }
    }
}

window.customElements.define("imbu-my-projects", MyProjects);
