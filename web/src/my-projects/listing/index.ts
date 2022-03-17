import html from "./index.html";
import css from "./index.css";

import "../../proposals/proposal-item";
import ProposalItem from "../../proposals/proposal-item";
import { Proposal, User } from "../../model";
import * as model from "../../model";
import * as utils from "../../utils";
import * as config from "../../config";
import type { ImbueRequest, polkadotJsApiInfo } from "../../dapp";
import authDialogContent from "../../dapp/auth-dialog-content.html";

const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    <style>${css}</style>
    ${html}
`;


export default class List extends HTMLElement {
    user?: User | null;
    apiInfo?: polkadotJsApiInfo;

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

    async init(request: ImbueRequest) {
        this.apiInfo = await request.apiInfo;
        this.user = await request.user;

        this.$list.innerHTML = "";

        await this.fetchUserProjects().then(projects => {
            if (projects) {
                this.renderProjects(projects);
            }
        });

         // Are we logged in?
         if (!this.user) {
            this.wrapAuthentication(() => {
                location.reload()
            });
        }
    }


    wrapAuthentication(action: CallableFunction) {
        const callback = (state: any) => {
            this.user = state.user;
            console.log(state);
            console.log(state.user);
            action();
        }


        this.dispatchEvent(new CustomEvent(
            config.event.authenticationRequired,
            {
                bubbles: true,
                composed: true,
                detail: {
                    callback,
                    content: authDialogContent,
                    actions: {
                        dismiss: {
                            handler: () => {},
                            label: "Continue using local storage"
                        }
                    }
                },
            }
        ));
    }


    async fetchUserProjects() {
        const resp = await model.fetchUserProjects(this.user?.id!);
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

window.customElements.define("imbu-my-projects-list", List);
