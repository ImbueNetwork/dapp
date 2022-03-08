import { marked } from "marked";
import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog, { ActionConfig } from "@pojagi/hoquet/lib/dialog/dialog";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { MDCTabBar } from "@material/tab-bar";
import type { SignerResult, SubmittableExtrinsic } from "@polkadot/api/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import type { ISubmittableResult } from "@polkadot/types/types";

import materialComponentsLink from "/material-components-link.html";
import materialIconsLink from "/material-icons-link.html";
import html from "./index.html";
import localDraftDialogContent from "./local-draft-dialog-content.html";
import authDialogContent from "./auth-dialog-content.html";
import css from "./index.css";
import type { DraftProposal, Proposal, User } from "../../../model";

import { getWeb3Accounts, signWeb3Challenge } from "../../../utils/polkadot";
import * as config from "../../../config";
import * as model from "../../../model";
import * as utils from "../../../utils";
import { ImbueRequest, polkadotJsApiInfo } from "../../../dapp";


const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    ${materialComponentsLink}
    ${materialIconsLink}
    <style>${css}</style>
    ${html}
`;


export default class Preview extends HTMLElement {
    draft?: DraftProposal | Proposal;
    address?: string;
    user?: User | null;
    private [CONTENT]: DocumentFragment;

    $tabBar: HTMLElement;
    tabBar: MDCTabBar;
    $dialog: Dialog;
    $tabContentContainer: HTMLElement;

    $actionButtonContainers: HTMLElement[];
    $edit: HTMLAnchorElement;
    $save: HTMLButtonElement;
    $finalize: HTMLButtonElement;

    $projectName: HTMLElement;
    $projectWebsite: HTMLElement;
    $projectDescription: HTMLElement;
    $projectLogo: HTMLImageElement;
    $fundsRequired: HTMLElement;
    $milestones: HTMLOListElement;

    accounts?: InjectedAccountWithMeta[];
    apiInfo?: polkadotJsApiInfo;


    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] = template.content.cloneNode(true) as DocumentFragment

        this.$tabBar =
        this[CONTENT].getElementById("tab-bar") as
            HTMLElement;
        this.tabBar = new MDCTabBar(this.$tabBar);
        this.$dialog =
            this[CONTENT].getElementById("dialog") as
                Dialog;
        this.$tabContentContainer =
            this[CONTENT].getElementById("tab-content-container") as
                HTMLElement;

        this.$edit =
            this[CONTENT].getElementById("edit") as
                HTMLAnchorElement;
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
                this.$save.parentElement?.parentElement?.children as
                    HTMLCollection
            ) as HTMLElement[];
    }

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

        /**
         * This is just for a11y. Do not use this value unless you know what
         * you're doing.
         */
        this.$edit.href = `${config.context}${
            config.grantProposalsURL
        }/draft?id=${this.projectId}`;
    }

    async init(request: ImbueRequest) {
        
        const projectId = this.projectId;

        if (!projectId) {
            /**
             * FIXME: Just redirect back to listing page? Or
             * better to have a 404 page.
             */
            utils.redirect(config.grantProposalsURL);
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
                this.dispatchEvent(utils.badRouteEvent("not-found"));
                return;
            }
        });

        this.accounts = await request.accounts;
        this.user = await request.user;
        this.apiInfo = await request.apiInfo;

        if (this.user) {
            /**
             * User is logged in with a session.
             * 
             * XXX: We have to assume that since the user is logged in at
             * this point, there's no reason to "save" -- only edit or
             * finalize.
             */

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

                model.postDraftProposal(this.draft).then(async resp => {
                    if (resp.ok) {
                        // redirect
                        const project = await resp.json();
                        utils.redirect(`${
                            config.grantProposalsURL
                        }/draft/preview?id=${
                            project.id
                        }`);
                    } else {
                        this.dispatchEvent(utils.badRouteEvent("server-error"));
                        return;
                    }
                })
            }
        }

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
            this.$dialog.create(
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

    errorNotification(e: Error) {
        console.log(e);
        this.dispatchEvent(new CustomEvent(
            config.event.notification,
            {
                bubbles: true,
                composed: true,
                detail: {
                    title: e.name,
                    content: e.message,
                    actions: {},
                    isDismissable: true,
                }
            }
        ));
    }

    async fetchDraft(projectId: string) {
        if (this.draft) {
            return this.draft;
        }

        if (projectId === "local-draft") {
            const draftSrc =
                window.localStorage[config.proposalsDraftLocalDraftKey];
            
            if (draftSrc) {
                const draft: DraftProposal = JSON.parse(draftSrc);
                this.draft = draft;
                return this.draft;
            }
            // redirect to "new" grant submission, because there isn't a reason
            // to be here without something to view.
            utils.redirect(`${config.grantProposalsURL}/draft`);
            return;
        }

        const resp = await model.fetchProject(projectId);
        if (resp.ok) {
            this.draft = await resp.json();
            return this.draft;
        }
        // TODO: 404 or dialog UX
    }

    get projectId() {
        const entry = window.location.search
            .split("?")[1]
            ?.split("&")
            .map(str => str.split("="))
            .find(([k,_]) => k === "id");
            
        if (entry) {
            return entry[1];
        }
        return null;
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
            e.preventDefault();

            const edit = () => {
                utils.redirect(`${
                    config.grantProposalsURL
                }/draft?id=${this.projectId}`);
            };

            if (this.projectId === "local-draft" || this.user) {
                edit();
            } else {
                this.wrapAuthentication(edit);
            }
        });

        this.$save.addEventListener("click", e => {
            const save = async () => {
                if (this.draft) {
                    const resp = await model.postDraftProposal(this.draft);
                    if (resp.ok) {
                        const project = await resp.json();
                        utils.redirect(`${
                            config.grantProposalsURL
                        }/draft/preview?id=${project.id}`);
                    } else {
                        // TODO: UX for bad request posting draft
                        console.warn("Bad request posting draft", this.draft);
                    }
                } else {
                    // shouldn't happen?
                }
            };

            if (!this.user) {
                this.wrapAuthentication(save);
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
            const userOwnsDraft = this.projectId === "local-draft"
                || (this.user && (this.user.id === this.draft?.usr_id));

            if (userOwnsDraft) {
                this.finalizeWorkflow();
            } else if (!this.user) {
                this.wrapAuthentication(() => {
                    // call this handler "recursively"
                    this.$finalize.click();
                });
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
                    const api = this.apiInfo?.api;
                    api.query.system.events((events) => {
                        // Loop through the Vec<EventRecord>
                        events.forEach((record) => {
                        // Extract the phase, event and the event types
                        const { event, phase } = record;
                        const projectCreated = `${event.section}:${event.method}` == "imbueProposals:ProjectCreated";
                        if (projectCreated) {

                            console.log(projectCreated);
                            console.log(event.data);
                            const types = event.typeDef;
                            const createdAccountId = event.data[0].toString();
                            const createdProjectId = event.data[2].toString();

                            if (event.data[0] == account.address) {
                                console.log("************** matching accounts **************");
                                // Update project ID in the DB 
                                console.log(`User ${createdAccountId} created a project with ID ${createdProjectId}`);
                                console.log(`Current account is ${account.address.toString()}`);
                                console.log(account);
                                console.log(account.address);
                            }
                        }
                        });
                    });
                    this.finalizeWorkflow(status.type);
                    if (status.isInBlock) {
                        const $inBlock =
                            this.shadowRoot?.getElementById("in-block") as
                                HTMLElement;
                        $inBlock.innerText = `Completed at block hash #${
                            status.asInBlock.toString()
                        }`;
                        $inBlock.classList.remove("hidden");
                        console.log($inBlock.textContent);
                    } else {
                        console.log(`Current status: ${status.type}`);
                    }
                }
            ).catch((e: any) => {
                this.errorNotification(e);
            });
            console.log(`Transaction hash: ${txHash}`);
        } break;
        case "extrinsic-created":
        {
            this.dispatchEvent(new CustomEvent(
                config.event.accountChoice,
                {
                    bubbles: true,
                    composed: true,
                    detail: (account?: InjectedAccountWithMeta) => {
                        if (account) {
                            this.finalizeWorkflow(
                                "account-chosen",
                                {...state, account},
                            );
                        }
                    }
                }
            ));
        } break;
        case "begin":
        {
            if (!this.draft) {
                // FIXME: UX
                return;
            }

            const extrinsic = this.apiInfo?.api.tx.imbueProposals.createProject(
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
        }
    }

    renderDraft(draft: DraftProposal | Proposal) {
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
        this.$projectDescription.innerHTML =
            draft.description && marked.parse(draft.description);
        this.$projectLogo.setAttribute("srcset", draft.logo);
        this.$fundsRequired.innerText = String(draft.required_funds / 1e12);

        this.$milestones.innerHTML = "";
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

window.customElements.define("imbu-proposals-draft-preview", Preview);
