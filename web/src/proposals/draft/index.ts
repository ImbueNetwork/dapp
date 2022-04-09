import html from "./index.html";
import css from "./index.css";

import Pages from "@pojagi/hoquet/lib/pages/pages";
import Route from "@pojagi/hoquet/lib/route/route";

import "./editor";
import ProposalsDraftEditor from "./editor";

import "./preview";
import ProposalsDraftPreview from "./preview";

import * as config from "../../config";
import * as utils from "../../utils";
import { DappRequest } from "../../dapp";


const template = document.createElement("template");
template.innerHTML = `
<style>${css}</style>
${html}
`;


const CONTENT = Symbol();


export default class ProposalsDraft extends HTMLElement {
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

    route(path: string | null, request: DappRequest) {
        if (!path) {
            this.$pages.select("editor");
            (this.$pages.selected as ProposalsDraftEditor).init(request);
            return;
        }

        const route = new Route("/:page", path);

        switch (route.data?.page) {
            case "preview":
                this.$pages.select("preview");
                (this.$pages.selected as ProposalsDraftPreview).init(request);
                break;
            default:
                this.dispatchEvent(utils.badRouteEvent("not-found"));
        }
    }
}

window.customElements.define("imbu-proposals-draft", ProposalsDraft);
