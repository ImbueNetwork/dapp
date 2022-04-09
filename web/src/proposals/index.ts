import html from "./index.html";
import css from "./index.css";

import Pages from "@pojagi/hoquet/lib/pages/pages";
import Route from "@pojagi/hoquet/lib/route/route";

import "../proposals/draft";
import ProposalsDraft from "../proposals/draft";

import "../proposals/listing";
import List from "../proposals/listing";

import "../proposals/detail";
import Detail from "../proposals/detail";

import * as utils from "../utils";
import { DappRequest } from "../dapp";


const template = document.createElement("template");
template.innerHTML = `
<style>${css}</style>
${html}
`;


const CONTENT = Symbol();


export default class Proposals extends HTMLElement {
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
            this.$pages.select("listing");
            (this.$pages.selected as List).init();
            return;
        }

        const route = new Route("/:page", path);

        switch (route.data?.page) {
            case "draft":
                this.$pages.select("draft");
                (this.$pages.selected as ProposalsDraft).route(
                    route.tail,
                    request
                );
                break;
            case "detail":
                this.$pages.select("detail");
                (this.$pages.selected as Detail).init(request);
                break;
            default:
                this.dispatchEvent(utils.badRouteEvent("not-found"));
        }
    }
}

window.customElements.define("imbu-proposals", Proposals);
