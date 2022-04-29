import html from "./index.html";
import css from "./index.css";

import Pages from "@pojagi/hoquet/lib/pages/pages";
import Route from "@pojagi/hoquet/lib/route/route";


import ".//edit";
import Edit from ".//edit";

import * as utils from "../utils";
import { ImbueRequest } from "../dapp";

import ".//my-account";
import MyAccount from ".//my-account";


const template = document.createElement("template");
template.innerHTML = `
<style>${css}</style>
${html}
`;


const CONTENT = Symbol();


export default class Dashboard extends HTMLElement {
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
            this.$pages.select("my-account");
            (this.$pages.selected as MyAccount).init(request);
            return;
        }

        const route = new Route("/:page", path);

        switch (route.data?.page) {
            case "edit":
                this.$pages.select("edit");
                (this.$pages.selected as Edit).init(request);
                break;
            default:
                this.dispatchEvent(utils.badRouteEvent("not-found"));
        }
    }
}

window.customElements.define("imbu-user-dashboard", Dashboard);
