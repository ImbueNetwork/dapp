import { marked } from "marked";

import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { MDCTabBar } from "@material/tab-bar";

import webflowCSSLink from "../../../../webflow-css-link.html";
import materialComponentsLink from "../../../../material-components-link.html";
import materialIconsLink from "../../../../material-icons-link.html";
import templateSrc from "./page.html";
import authDialogContent from "./auth-dialog-content.html";
import styles from "./page.css";
import type { GrantProposal, Project, User } from "../../../model";

import "../../../auth-dialog/auth-dialog";
import type AuthDialog from "../../../auth-dialog/auth-dialog";
import "../../../../lib/imbue/dialog/dialog";
import type Dialog from "../../../../lib/imbue/dialog/dialog";

import { getWeb3Accounts } from "../../../utils/polkadot";
import * as config from "../../../config";
import { ActionConfig } from "../../../../lib/imbue/dialog/dialog";


const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    ${webflowCSSLink}
    ${materialComponentsLink}
    ${materialIconsLink}
    <style>${styles}</style>
    ${templateSrc}
`;


class GrantProposalsDetailPage extends HTMLElement {
    draft?: GrantProposal | Project;
    // project?: {};
    address?: string;
    user?: User;
    private [CONTENT]: DocumentFragment;

    $tabBar: HTMLElement;
    tabBar: MDCTabBar;
    $authDialog: AuthDialog;
    $dialog: Dialog;
    $tabContentContainer: HTMLElement;
    $edit: HTMLButtonElement;
    $save: HTMLButtonElement;
    $finalize: HTMLButtonElement;

    $projectName: HTMLElement;
    $projectWebsite: HTMLElement;
    $projectDescription: HTMLElement;
    $projectLogo: HTMLImageElement;
    $fundsRequired: HTMLElement;
    $milestones: HTMLOListElement;

    accounts?: InjectedAccountWithMeta[];


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
        this.$edit =
            this[CONTENT].getElementById("edit") as
                HTMLButtonElement;
        this.$save =
            this[CONTENT].getElementById("save") as
                HTMLButtonElement;
        this.$finalize =
            this[CONTENT].getElementById("finalize") as
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

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);

        const projectId = this.projectId;
        
        if (!projectId) {
            window.location.href = config.grantProposalsURL;
            return;
        }

        this.fetchDraft(projectId).then(draft => {
            if (draft) {
                this.renderDraft(draft);
            }
        });

        getWeb3Accounts().then(accounts => {
            this.accounts = accounts;
        });

        fetch(`${config.apiBase}/user`).then(async resp => {
            if (resp.ok) {
                this.user = await resp.json();
            } else {
                // this.launchAuthDialog();
            }
        });

        this.bind();
    }

    async fetchDraft(projectId: string) {
        if (this.draft) {
            return this.draft;
        }

        if (projectId === "local-draft") {
            const draftSrc =
                window.localStorage["imbu-draft-proposal:local-draft"];
            
            if (draftSrc) {
                const draft: GrantProposal = JSON.parse(draftSrc);
                this.draft = draft;
                return this.draft;
            }
            // redirect to "new" grant submission, because there isn't a reason
            // to be here without something to view.
            window.location.href = config.grantSubmissionURL;
            return;
        }

        // fetch project (i.e., rather than Proposal)
        const resp = await fetch(
            `${config.apiBase}/projects/${projectId}`,
            {headers: config.getAPIHeaders}
        );
        if (resp.ok) {
            this.draft = await resp.json();
            return this.draft;
        }
        // TODO: 404 or dialog UX
    }

    get projectId() {
        const entry = window.location.search
            .split("?")[1]
            .split("&")
            .map(str => str.split("="))
            .find(([k,_]) => k === "id");
            
        if (entry) {
            return entry[1];
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

        this.$edit.addEventListener("click", e => {
            window.location.href = `/grant-submission/${this.projectId}`;
        });
    }

    launchAuthDialog() {
        this.dialog(
            "Action required",
            authDialogContent, {
            "google": {
                handler: () => {
                    window.location.href = `${
                        config.googleAuthEndpoint
                    }?n=${
                        window.location.href
                    }`;
                }
            }
        }, false);
    }

    dialog(
        title: string,
        content: string,
        actions: Record<string,ActionConfig>,
        isDismissable = false
    ) {
        this.$dialog.create(
            title,
            content,
            actions,
            isDismissable,
        );
    }

    updateActionButtons() {
        if (this.user) {
            // <div class="action-button-container">
            //     <button href="javascript:void(0)" id="edit" class="edit button">
            //         Edit
            //     </button>
            // </div>
            // <div class="action-button-container">
            //     <button href="javascript:void(0)" id="finalize" class="button primary">
            //         Finalize!
            //     </button>
            // </div>
        }
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
            <a href=${draft.website} target="_blank">${
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

window.customElements.define("imbu-grant-proposals-detail-page", GrantProposalsDetailPage);
