import html from "./index.html";
import css from "./index.css";

import Pages from "@pojagi/hoquet/lib/pages/pages";
import Route from "@pojagi/hoquet/lib/route/route";


import ".//edit";
import Edit from ".//edit";

import * as utils from "../utils";
import {getPage} from "../utils";
import {ImbueRequest} from "../dapp";

import ".//my-account";
import MyAccount from ".//my-account";
import NoProposal from "./no-proposal";
import * as config from "../config";


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

    async route(path: string | null, request: ImbueRequest) {
        // Are we logged in?
        const user = await request.user;
        if (!user) {
            this.wrapAuthentication(() => {
                location.reload()
            });

            return;
        }

        if (!path) {
            await getPage<MyAccount>(this.$pages, "my-account").init(request);
            this.$pages.select("my-account");
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

    wrapAuthentication(action: CallableFunction) {
        const callback = (state: any) => {
            action();
        }

        this.dispatchEvent(new CustomEvent(
            config.event.authenticationRequired,
            {
                bubbles: true,
                composed: true,
                detail: {
                    callback
                },
            }
        ));
    }
}

window.customElements.define("imbu-user-dashboard", Dashboard);
