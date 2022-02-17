import { marked } from "marked";
import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog, { ActionConfig } from "@pojagi/hoquet/lib/dialog/dialog";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { MDCTabBar } from "@material/tab-bar";
import type { SignerResult, SubmittableExtrinsic } from "@polkadot/api/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import type { ISubmittableResult } from "@polkadot/types/types";

import webflowCSSLink from "../../../../webflow-css-link.html";
import materialComponentsLink from "../../../../material-components-link.html";
import materialIconsLink from "../../../../material-icons-link.html";
import templateSrc from "./page.html";
import authDialogContent from "./auth-dialog-content.html";
import localDraftDialogContent from "./local-draft-dialog-content.html";
import styles from "./page.css";
import type { GrantProposal, Project, User } from "../../../model";

import "../../../auth-dialog/auth-dialog";
import type AuthDialog from "../../../auth-dialog/auth-dialog";

import { getWeb3Accounts, signWeb3Challenge } from "../../../utils/polkadot";
import * as config from "../../../config";
import * as model from "../../../model";


const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    ${webflowCSSLink}
    ${materialComponentsLink}
    ${materialIconsLink}
    <style>${styles}</style>
    ${templateSrc}
`;

export default class ProposalsDetailPage extends HTMLElement {
    private _projectId?: string;
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

    $actionButtonContainers: HTMLElement[];
    $contribute: HTMLButtonElement;

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

    toggleActionButton(which: string, force: boolean) {
        ((this as any)[`$${which}`] as HTMLElement).parentElement
            ?.classList.toggle("hidden", !force);
        this._rebalanceActionButtons();
    }

    private _rebalanceActionButtons() {
        const $visible = this.$actionButtonContainers.filter($el => {
            return !$el.classList.contains("hidden");
        });
        $visible.forEach($el => {
            ($el as HTMLElement).style.width = String(
                (100 / $visible.length) - 1
            ) + "%";
        });
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

        const isLocalDraft = projectId === "local-draft";


        /**
         * We await this here because if there's no draft, we don't want to
         * bother with any other confusing and/or expensive tasks.
         */
        await this.fetchDraft(projectId).then(draft => {
            if (draft) {
                this.renderDraft(draft);
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
            this.dialog("PolkadotJS API Error", e.message, {
                "dismiss": {label: "Okay"}
            }, true);
        });
    }

    // Should return finalised projects
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
            window.location.href = `${config.grantProposalsURL}/draft`;
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


        this.$contribute.addEventListener("click", e => {
            const contribute = async () => {
                // coontribution logic
                console.log("**************** contribution logic goes here ****************");
            };

            if (!this.user) {
                this.launchAuthDialog(contribute);
            } else {
                 contribute();
            }
        });


    }

    launchAuthDialog(callback?: CallableFunction) {
        this.dialog(
            "You must be signed in to continue",
            authDialogContent,
            {
                google: {
                    handler: () => {
                        window.location.href = `${
                            config.googleAuthEndpoint
                        }?n=${
                            window.location.href
                        }`;
                    }
                },
                web3: {
                    handler: () =>
                        this.web3AuthWorkflow("begin", {callback}),
                },
                dismiss: {
                    label: "Continue using local storage",
                    handler: () => {},
                }
        }, true);
    }

    accountChoice() {
        const accountActionEntry = (resolve: CallableFunction) => (
            account: InjectedAccountWithMeta,
        ) => [
            account.address,
            {
                label: `${
                    account.meta.name
                } (${account.meta.source})`,
                isPrimary: true,
                handler: () => {
                    resolve(account);
                }
            }
        ];

        return new Promise((resolve, _reject) => {
            // do we have accounts?
            if (!this.accounts) {
                this.dialog(
                    "No accounts found", "",
                    {dismiss: {label: "Okay"}},
                    true
                );
                resolve(void 0);
            } else if (this.accounts.length === 1) {
                resolve(this.accounts[0]);
            } else {
                return this.dialog(
                    "Choose the account you'd like to use.",
                    "",
                    {
                        ...Object.fromEntries(this.accounts.map(
                            accountActionEntry(resolve)
                        )),
                        cancel: {label: "Cancel"}
                    }
                );
            }
        });
    }

    async web3AuthWorkflow(
        event: string = "begin",
        state?: Record<string, any>
    ): Promise<void> {
        switch(event) {
        case "done":
        {
            const callback = state?.callback;
            console.log("STATE", state);
            if (callback instanceof Function) {
                callback(state);
            }
        } break;
        case "signed":
        {
            // post to callback
            const signature = state?.signature as
                SignerResult;
            const account = state?.account as
                InjectedAccountWithMeta;
            const user = state?.user as
                User;

            const resp = await fetch(
                `/auth/web3/${account.meta.source}/callback`,
                {
                    headers: config.postAPIHeaders,
                    method: "post",
                    body: JSON.stringify({
                        signature: signature.signature,
                        address: account.address,
                    })
                }
            );
            if (resp.ok) {
                // authenticated. Set user.
                this.user = user;
                return this.web3AuthWorkflow("done", state);
            } else {
                // TODO: UX for 401
            }
        } break;
        case "account-chosen":
        {
            const account = state?.account as
                InjectedAccountWithMeta;

            const resp = await fetch(
                `/auth/web3/${account.meta.source}/`,
                {
                    headers: config.postAPIHeaders,
                    method: "post",
                    body: JSON.stringify(account)
                }
            );

            if (resp.ok) {
                // could be 200 or 201
                const { user, web3Account } = await resp.json();
                const signature = await signWeb3Challenge(
                    account, web3Account.challenge
                );
                if (signature) {
                    return this.web3AuthWorkflow(
                        "signed",
                        {...state, signature, user}
                    );
                } else {
                    // TODO: UX for no way to sign challenge?
                }
            }
        } break;
        case "begin":
        {
            const account = await this.accountChoice();

            if (account) {
                return this.web3AuthWorkflow(
                    "account-chosen",
                    {...state, account},
                );
            }
        } break;
        default:
            console.warn(`Invalid web3AuthWorkflow event: ${event}`);
        }
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

window.customElements.define("imbu-proposal-detail-page", ProposalsDetailPage);
