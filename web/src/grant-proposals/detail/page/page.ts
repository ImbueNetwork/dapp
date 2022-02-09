import { marked } from "marked";
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


class GrantProposalsDetailPage extends HTMLElement {
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
        this.$actionButtonContainers =
            Array.from(
                this.$save.parentElement?.parentElement?.children as HTMLCollection
            ) as HTMLElement[];
    }


    // set toggleSave(force: boolean) {
    //     this.$save.parentElement
    //         ?.classList.toggle("hidden", !force);
    //     this._rebalanceActionButtons();
    // }

    toggleActionButton(which: string, force: boolean) {
        ((this as any)[`$${which}`] as HTMLElement).parentElement
            ?.classList.toggle("hidden", !force);
        this._rebalanceActionButtons();
    }

    set toggleSave(force: boolean) {
        this.toggleActionButton("save", force);
    }
    set toggleFinalize(force: boolean) {
        this.toggleActionButton("finalize", force);
    }
    set toggleEdit(force: boolean) {
        this.toggleActionButton("edit", force);
    }

    /**
     * FIXME: do this with CSS-flex-only solution
     */
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
        this.toggleSave = false;

        this.bind();
        this.init();
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

        this.toggleSave = isLocalDraft;

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
                if (user?.id) {
                    this.user = user;
                    /**
                     * Toggling save false because if user is logged in, we
                     * automatically save and refresh for them.
                     */
                    this.toggleSave = false;
                    /**
                     * Should only be able to edit or finalize if user
                     * is the usr_id on the project.
                     */
                    if (!isLocalDraft && this.user?.id !== this.draft?.usr_id) {
                        this.toggleFinalize = false;
                        this.toggleEdit = false;
                    }

                    if (isLocalDraft) {
                        // save and redirect to legit URL
                        if (!this.draft) {
                            // TODO: shouldn't happen, but UX if it does
                            return;
                        }

                        fetch(
                            `${config.apiBase}/projects/`,
                            {
                                method: "post",
                                headers: config.postAPIHeaders,
                                body: JSON.stringify({proposal: this.draft}),
                            },
                        ).then(async resp => {
                            if (resp.ok) {
                                // redirect
                                const project = await resp.json();
                                window.location.href = `${
                                    config.grantProposalsURL
                                }/preview?id=${project.id}`
                            } else {
                                // TODO: dialog or 500 page
                            }
                        })
                    }
                }
            } else if (!isLocalDraft) {
                /**
                 * Legit draft exists but not logged in.
                 *
                 * Buttons: all will simply launch the authDialog, because user
                 * has no session. Not even edit will work.
                 * 
                 * FIXME: not sure if there's any additional UX needed here.
                 * Maybe the auth dialog should just preemptively load.
                 */
                // this.launchAuthDialog();
            }
        });

        if (isLocalDraft) {
            /**
             * `localStorage` draft. User may or may not be logged in.
             * 
             * This is a special case where the user was probably
             * redirected here from the grant-submission form to "preview"
             * their draft. But there's nothing stopping someone from arriving
             * here directly (i.e., potentially even logged in).
             * 
             * All `local-draft` it means in any case is that they have an
             * unsaved draft in `localStorage` and they specifically navigated
             * here to view it and edit/save/finalize.
             * 
             * So, in this case, we want to provide a nice and simple
             * dialog that explains that their draft is only saved
             * temporarily in the browser's local storage. Don't mention
             * authentication at this point. We can launch that dialog
             * when they click "save" or "finalize!".
             * 
             * Here we want to give them both an "edit" and a "save" button.
             */
            this.dialog(
                "Note",
                localDraftDialogContent,
                {
                    "dismiss": {
                        label: "Got it",
                        handler: () => {}
                    }
                },
                false
            );
        }
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

        this.$edit.addEventListener("click", e => {
            const edit = () => {
                window.location.href = `/grant-submission/${this.projectId}`;
            };

            if (this.projectId === "local-draft" || this.user) {
                edit();
            } else {
                this.launchAuthDialog(edit);
            }
        });

        this.$save.addEventListener("click", e => {
            const save = async () => {
                if (this.draft) {
                    const resp = await model.postGrantProposal(this.draft);
                    if (resp.ok) {
                        const project = await resp.json();
                        window.location.href = `${
                            config.grantProposalsURL
                        }/preview?id=${project.id}`;
                    } else {
                        // TODO: UX for bad request posting draft
                        console.warn("Bad request posting draft", this.draft);
                    }
                } else {
                    // shouldn't happen?
                }
            };

            if (!this.user) {
                this.launchAuthDialog(save);
            } else {
                /**
                 * Save and redirect back to legit projectId? Or do we want to
                 * bring them back here so that they can decide whether or not
                 * to save?
                 * 
                 * I think we should just handle it in the background --
                 * user logs in, and gets redirected back here to `local-draft`
                 * but we detect that from the URL and then go through a save
                 * workflow (the same one we would do in this else block),
                 * which would redirect them to this "preview" page, but with a
                 * legit `projectId` instead of `local-draft`.
                 */
                 save();
            }
        });

        this.$finalize.addEventListener("click", e => {
            if (this.projectId === "local-draft" || this.user) {
                this.finalizeWorkflow();
            }
        });
    }

    async finalizeWorkflow(
        event: string = "begin",
        state?: Record<string,any>
    ): Promise<void> {
        switch(event) {
        case "account-chosen":
        {
            const extrinsic = state?.extrinsic as
                SubmittableExtrinsic<"promise", ISubmittableResult>;
            const account = state?.account as
                InjectedAccountWithMeta;
            const injector = await web3FromSource(account.meta.source);

            const txHash = await extrinsic.signAndSend(
                account.address,
                {signer: injector.signer},
                ({ status }) => {
                    console.log(status);
                    this.finalizeWorkflow(status.type);
                    if (status.isInBlock) {
                        const $inBlock = this.shadowRoot?.getElementById("in-block") as HTMLElement;
                        $inBlock.innerText = `Completed at block hash #${status.asInBlock.toString()}`;
                        $inBlock.classList.remove("hidden");
                        console.log(`Completed at block hash #${status.asInBlock.toString()}`);
                    } else {
                        console.log(`Current status: ${status.type}`);
                    }
                }
            );
            console.log(`Transaction hash: ${txHash}`);
        } break;
        case "extrinsic-created":
        {
            const account = await this.accountChoice();

            if (account) {
                return this.finalizeWorkflow(
                    "account-chosen",
                    {...state, account},
                );
            }
        } break;
        case "begin":
        {
            if (!this.draft) {
                // FIXME: UX
                return;
            }

            const extrinsic = this.api?.tx.imbueProposals.createProject(
                this.draft.name,
                this.draft.logo,
                this.draft.description,
                this.draft.website,
                this.draft.milestones,
                this.draft.required_funds,
            );

            if (!extrinsic) {
                // FIXME: UX
                return;
            }

            return this.finalizeWorkflow(
                "extrinsic-created",
                {...state, extrinsic},
            );
        } break;
        default:
            this.toggleEdit = false;
            this.toggleSave = false;
            this.$finalize.disabled = true;
            if (event === "Finalized") {
                this.$finalize.classList.remove("blob");
                this.$finalize.classList.add("finalized");
            } else {
                this.$finalize.classList.add("blob");
            }
            this.$finalize.innerText = event;
            console.warn("Invalid finalize workflow state.");
        }
    }


    /**
     * The user needs to be notified that they can't do anything
     * if they aren't credentialed except view the preview.
     * 
     * So they have two options at this point:
     * 
     * 1. Create a web 2.0 based account and log in
     *      - this will save the draft via the API in the
     *        background.
     * 2. Download the polkadot-js extension and create at least
     *    one web3 account. Then they can either:
     *      - Authenticate with their web3 account (saving the
     *        draft in the background)
     *      - Finalize the project without creating an account
     */
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

window.customElements.define("imbu-grant-proposals-detail-page", GrantProposalsDetailPage);
