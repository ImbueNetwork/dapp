import { marked } from "marked";

import "@pojagi/hoquet/lib/dialog/dialog";
import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog, { ActionConfig } from "@pojagi/hoquet/lib/dialog/dialog";
import authDialogContent from "./auth-dialog-content.html";
import { MDCTabBar } from "@material/tab-bar";

import materialComponentsLink from "/material-components-link.html";
import materialIconsLink from "/material-icons-link.html";
import templateSrc from "./index.html";
import styles from "./index.css";

import { fetchProject, DraftProposal, Proposal, User } from "../../model";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ApiPromise, WsProvider } from "@polkadot/api";
import { getWeb3Accounts, signWeb3Challenge } from "../../utils/polkadot";
import * as config from "../../config";
import * as utils from "../../utils";
import type { ImbueRequest } from "../../dapp";


const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    ${materialComponentsLink}
    ${materialIconsLink}
    <style>${styles}</style>
    ${templateSrc}
`;

export default class Detail extends HTMLElement {
    user?: User;
    $contribute: HTMLButtonElement;
    $tabContentContainer: HTMLElement;
    $tabBar: HTMLElement;
    tabBar: MDCTabBar;

    $projectName: HTMLElement;
    $projectWebsite: HTMLElement;
    $projectDescription: HTMLElement;
    $projectLogo: HTMLImageElement;
    $fundsRequired: HTMLElement;
    $milestones: HTMLOListElement;

    private [CONTENT]: DocumentFragment;

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$tabContentContainer =
            this[CONTENT].getElementById("tab-content-container") as
                HTMLElement;
        this.$tabBar =
         this[CONTENT].getElementById("tab-bar") as
            HTMLElement;
        this.tabBar = new MDCTabBar(this.$tabBar);

        this.$contribute =
            this[CONTENT].getElementById("contribute") as
                HTMLButtonElement;
        this.$projectName =
            this[CONTENT].getElementById("project-name") as
                HTMLElement;

        this.$projectWebsite =
            this[CONTENT].getElementById("project-website") as
                HTMLElement;
        this.$projectDescription =
            this[CONTENT].getElementById("project-description") as
                HTMLElement;
        this.$projectLogo =
            this[CONTENT].getElementById("project-logo") as
                HTMLImageElement;
        this.$fundsRequired =
            this[CONTENT].getElementById("funds-required") as
                HTMLElement;
        this.$milestones =
            this[CONTENT].getElementById("milestones") as
                HTMLOListElement;
    }

    get projectId(): string | null {
        const candidate = window.location.pathname.split("/").pop();
        
        if (utils.validProjectId(candidate)) {
            return candidate as string;
        }
        
        return null;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
        this.bind();
    }
    
    async init(request: ImbueRequest) {
        const projectId = this.projectId;
        if (!projectId) {
            /**
             * "bad-route" because a candidate id was found, but it was
             * invalid (i.e., 400)
             */
            this.dispatchEvent(utils.badRouteEvent("bad-route"));
            return;
        }

        await fetchProject(projectId).then(async resp => {
            if (resp.ok) {
                this.renderProject(await resp.json());
            } else if (resp.status === 404) {
                this.dispatchEvent(utils.badRouteEvent("not-found"));
            } else {
                this.dispatchEvent(utils.badRouteEvent("server-error"));
            }
        });
    }

    bind() {
        this.shadowRoot?.addEventListener("MDCTabBar:activated", e => {
            const detail = (e as CustomEvent).detail;
            const $container = this.$tabContentContainer;
            Array.from($container.children).forEach(
                $child => $child.classList.remove("active")
            );
            $container.children[detail.index].classList.add("active");
        });

        this.$contribute.addEventListener("click", e => {
            console.log("***************** cick *****************");

            const contribute = async () => {
                console.log("***************** CONTRIBUTION LOGIC HERE *****************");
            };

            if (!this.user) {
                this.wrapAuthentication(() => {
                    contribute();
                });
            } else {
                contribute();
            }
        });
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
    
    renderProject(draft: DraftProposal | Proposal) {
        if (!draft) {
            throw new Error(
                "Attempt to render nonexistent draft."
            );
        }

        // this.$["about-project"].innerText = proposal.name;
        this.$projectName.innerText = draft.name;
        this.$projectWebsite.innerHTML = `
            <a href="${draft.website}" target="_blank">${
                draft.website
            }</a>
        `;
        this.$projectDescription.innerHTML = marked.parse(draft.description);
        this.$projectLogo.setAttribute("srcset", draft.logo);
        this.$fundsRequired.innerText = String(draft.required_funds / 1e12);

        draft.milestones.forEach(milestone => {
            this.$milestones.appendChild(
                document.createRange().createContextualFragment(`
                    <li class="mdc-deprecated-list-item" tabindex="0">
                        <span class="mdc-deprecated-list-item__ripple"></span>
                        <span class="mdc-deprecated-list-item__graphic">
                            <i class="material-icons">pending_actions</i>
                        </span>
                        <span class="mdc-deprecated-list-item__text">
                            <span class="mdc-deprecated-list-item__primary-text">${
                                milestone.name
                            }</span>
                            <span class="mdc-deprecated-list-item__secondary-text"><!--
                            -->${milestone.percentage_to_unlock}%
                            </span>
                        </span>
                    </li>
                `)
            );
        });
    }


}

window.customElements.define("imbu-proposals-detail", Detail);
