import { marked } from "marked";

import "@pojagi/hoquet/lib/dialog/dialog";
import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog, { ActionConfig } from "@pojagi/hoquet/lib/dialog/dialog";
import authDialogContent from "./auth-dialog-content.html";
import { MDCTabBar } from "@material/tab-bar";

import webflowCSSLink from "/webflow-css-link.html";
import materialComponentsLink from "/material-components-link.html";
import materialIconsLink from "/material-icons-link.html";
import templateSrc from "./index.html";
import styles from "./index.css";

import type { GrantProposal, Project, User } from "../../model";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ApiPromise, WsProvider } from "@polkadot/api";
import { getWeb3Accounts, signWeb3Challenge } from "../../utils/polkadot";
import * as config from "../../config";
import * as model from "../../model";
const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    ${webflowCSSLink}
    ${materialComponentsLink}
    ${materialIconsLink}
    <style>${styles}</style>
    ${templateSrc}
`;

export default class Detail extends HTMLElement {
    private _projectId?: string;
    project?: Project;
    address?: string;
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

    $actionButtonContainers: HTMLElement[];
    accounts?: InjectedAccountWithMeta[];
    $dialog: Dialog;
    api?: ApiPromise;
    private [CONTENT]: DocumentFragment;

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] = template.content.cloneNode(true) as DocumentFragment;

        this.$dialog =
        this[CONTENT].getElementById("dialog") as
            Dialog;
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
        this.$actionButtonContainers =
            Array.from(
                this.$contribute.parentElement?.parentElement?.children as
                    HTMLCollection
            ) as HTMLElement[];

    }

    async apiSetup() {
        const webSockAddr = (await fetch(`${config.apiBase}/info`).then(
            resp => resp.json()
        )).imbueNetworkWebsockAddr;
        const provider = new WsProvider(webSockAddr);
        provider.on("error", e => {
            // this.dialog("PolkadotJS API Connection Error", "", {
            //     "dismiss": {label: "Okay"}
            // }, true);
            console.log(e);
        });
        provider.on("disconnected", e => {
            // this.dialog("PolkadotJS API Disconnected", "", {
            //     "dismiss": {label: "Okay"}
            // }, true);
            console.log(e);
        });
        /**
         * TODO: any reason to report this, specifically?
         */
        provider.on("connected", e => {
            // this.dialog("PolkadotJS API Connected", "", {
            //     "dismiss": {label: "Okay"}
            // }, true);
            console.log("Polkadot JS connected", e);
        });

        await ApiPromise.create({provider}).then(api => {
            this.api = api;
        }).catch(e => {
            this.$dialog.create("PolkadotJS API Error", e.message, {
                "dismiss": {label: "Okay"}
            }, true);
        });
    }

    async fetchProject(projectId: string) {
        // fetch project (i.e., rather than Proposal)
        const resp = await fetch(
            `${config.apiBase}/projects/${projectId}`,
            {headers: config.getAPIHeaders}
        );
        if (resp.ok) {
            this.project = await resp.json();
            return this.project;
        }
        // TODO: 404 or dialog UX
    }

    get projectId() {
        if (this._projectId) {
            return this._projectId;
        }
        const projectId = window.location.pathname.split("/")[4];

        if (projectId) {
            this._projectId = projectId;
            return this._projectId;
        }
        return;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
        /**
         * default
         */

        this.bind();
        // this.init();
    }
    
    async init() {
        const projectId = this.projectId;
        if (!projectId) {
            /**
             * FIXME: Just redirect back to listing page? Or
             * better to have a 404 page.
             */

            window.location.href = config.grantProposalsURL;
            return;
        }

        await this.fetchProject(projectId).then(project => {
            if (project) {
                this.renderProject(project);
            } else {
                /**
                 * Same as FIXME above. Do we want a 404 page here, dialog,
                 * or what?
                 */
                window.location.href = config.grantProposalsURL;
                return;
            }
        });

        this.apiSetup();

        getWeb3Accounts().then(accounts => {
            this.accounts = accounts;
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
    
    renderProject(draft: GrantProposal | Project) {
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
