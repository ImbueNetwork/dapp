import { marked } from "marked";
import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog, { ActionConfig } from "@pojagi/hoquet/lib/dialog/dialog";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { MDCTabBar } from "@material/tab-bar";
import type { SignerResult, SubmittableExtrinsic } from "@polkadot/api/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import type { ISubmittableResult } from "@polkadot/types/types";

import webflowCSSLink from "../../../webflow-css-link.html";
import materialComponentsLink from "../../../material-components-link.html";
import materialIconsLink from "../../../material-icons-link.html";
import templateSrc from "./page.html";
import authDialogContent from "./auth-dialog-content.html";
import localDraftDialogContent from "./local-draft-dialog-content.html";
import styles from "./page.css";
import type { GrantProposal, Project, User } from "../../model";

import "../../auth-dialog/auth-dialog";
import type AuthDialog from "../../auth-dialog/auth-dialog";

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


export default class ProposalsListPage extends HTMLElement {
    private _projectId?: string;
    projects?: GrantProposal | Project[];
    // project?: {};
    address?: string;
    user?: User;
    private [CONTENT]: DocumentFragment;

    $tabBar: HTMLElement;
    tabBar: MDCTabBar;
    $authDialog: AuthDialog;
    $dialog: Dialog;
    $tabContentContainer: HTMLElement;

    $projectName: HTMLElement;
    $projectWebsite: HTMLElement;
    $projectDescription: HTMLElement;
    $projectLogo: HTMLImageElement;
    $fundsRequired: HTMLElement;
    $milestones: HTMLOListElement;

    accounts?: InjectedAccountWithMeta[];
    api?: ApiPromise;


    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] = template.content.cloneNode(true) as DocumentFragment

        this.$tabBar =
        this[CONTENT].getElementById("tab-bar") as
            HTMLElement;
        this.tabBar = new MDCTabBar(this.$tabBar);
        this.$authDialog =
            this[CONTENT].getElementById("auth-dialog") as
                AuthDialog;
        this.$dialog =
            this[CONTENT].getElementById("dialog") as
                Dialog;
        this.$tabContentContainer =
            this[CONTENT].getElementById("tab-content-container") as
                HTMLElement;
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


    // set toggleSave(force: boolean) {



    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
        /**
         * default
         */

        this.bind();
        // this.init();
    }

    async init() {
        await this.fetchProjects().then(projects => {
            console.log(projects);
            // projects.forEach(project => {
            //     /**
            //      * We await this here because if there's no draft, we don't want to
            //      * bother with any other confusing and/or expensive tasks.
            //      */
            //     await this.fetchProject(project.id).then(draft => {
            //         if (draft) {
            //             this.renderDraft(draft);
            //         } else {
            //             /**
            //              * Same as FIXME above. Do we want a 404 page here, dialog,
            //              * or what?
            //              */
            //             window.location.href = config.grantProposalsURL;
            //             return;
            //         }
            //     });
            // });
        });



        /**
         * From here on out we know a draft exists in one form or another. So
         * we go about the business of communicating state and enabling
         * features.
         */

        this.apiSetup();

        getWeb3Accounts().then(accounts => {
            this.accounts = accounts;
        });

        await fetch(`${config.apiBase}/user`).then(async resp => {
            if (resp.ok) {
                /**
                 * User is logged in with a session.
                 * 
                 * XXX: We have to assume that since the user is logged in at
                 * this point, there's no reason to "save" -- only edit or
                 * finalize.
                 */
                const user = await resp.json();

            }
        });

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

    }


    async fetchProjects() {
        // fetch project (i.e., rather than Proposal)
        const resp = await fetch(
            `${config.apiBase}/projects/`,
            {headers: config.getAPIHeaders}
        );
        if (resp.ok) {
            this.projects = await resp.json();
            return this.projects;
        }
    }


    get projectId() {
        if (this._projectId) {
            return this._projectId;
        }

        const entry = window.location.search
            .split("?")[1]
            ?.split("&")
            .map(str => str.split("="))
            .find(([k,_]) => k === "id");
            
        if (entry) {
            this._projectId = entry[1];
            return this._projectId;
        }
        return;
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
    }

    renderDraft(draft: GrantProposal | Project) {
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

window.customElements.define("imbu-proposals-list-page", ProposalsListPage);
