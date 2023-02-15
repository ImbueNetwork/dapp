import html from "./index.html";
import css from "./index.css";

import "../../proposals/proposal-item";
import ProposalItem from "../../proposals/proposal-item";
import {Proposal, User} from "../../model";
import * as config from "../../config";
import type {ImbueApiInfo, ImbueRequest} from "../../dapp";
import NoProposal from "../no-proposal";

const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    <style>${css}</style>
    ${html}
`;


export default class MyAccount extends HTMLElement {
    user?: User | null;
    apiInfo?: ImbueApiInfo | undefined;

    private [CONTENT]: DocumentFragment;

    $projects: HTMLOListElement;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$projects =
            this[CONTENT].getElementById("projects-list") as
                HTMLOListElement;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
    }

    async init(request: ImbueRequest) {
        this.apiInfo = await request.apiInfo;
        this.user = await request.user;

        this.$projects.innerHTML = "";

        // Are we logged in?
        if (!this.user) {
            this.wrapAuthentication(() => {
                location.reload()
            });
        } else {
            const userProject = await request.userProject;
            if (userProject) {
                this.renderProjects([userProject]);
            } else {
                this.$projects.appendChild(new NoProposal());
            }
        }
    }


    wrapAuthentication(action: CallableFunction) {
        const callback = (state: any) => {
            this.user = state.user;
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

    renderProjects(proposals: Proposal[]) {
        proposals.forEach(proposal => {
            this.$projects.appendChild(new ProposalItem(proposal));
        });
    }
}

window.customElements.define("imbu-my-account", MyAccount);
