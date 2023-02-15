import {marked} from "marked";
import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog from "@pojagi/hoquet/lib/dialog/dialog";
import type {InjectedAccountWithMeta} from '@polkadot/extension-inject/types';
import {MDCTabBar} from "@material/tab-bar";
import type {SubmittableExtrinsic} from "@polkadot/api/types";
import {web3FromSource} from "@polkadot/extension-dapp";
import type {ISubmittableResult} from "@polkadot/types/types";

import materialComponentsLink from "/material-components-link.html";
import materialIconsLink from "/material-icons-link.html";
import html from "./index.html";
import authDialogContent from "../../dapp/auth-dialog-content.html";
import css from "./index.css";
import type {DraftProposal, Proposal, User} from "../../model";
import * as model from "../../model";

import * as config from "../../config";
import * as utils from "../../utils";
import {ImbueApiInfo, ImbueRequest, PolkadotJsApiInfo} from "../../dapp";


const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    ${materialComponentsLink}
    ${materialIconsLink}
    <style>${css}</style>
    ${html}
`;


export default class Preview extends HTMLElement {
    project?: Proposal | null;
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
    $currencyLabel: HTMLElement;
    $fundsRequired: HTMLElement;
    $milestones: HTMLOListElement;

    accounts?: InjectedAccountWithMeta[];
    apiInfo?: ImbueApiInfo;


    constructor() {
        super();
        this.attachShadow({mode: "open"});
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

        this.$currencyLabel =
            this[CONTENT].getElementById("currency-label") as
                HTMLElement;

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
        this.$edit.href = `${config.context}${config.grantProposalsURL}/draft`;
    }

    async init(request: ImbueRequest) {
        this.user = await request.user;
        this.project = await request.userProject;
        this.accounts = await request.accounts;
        this.apiInfo = await request.apiInfo;

        if (!this.user) {
            const callback = (state: any) => {
                this.user = state.user;
                location.reload();
            }

            this.dispatchEvent(new CustomEvent(
                config.event.authenticationRequired,
                {
                    bubbles: true,
                    composed: true,
                    detail: {
                        callback
                    }
                }
            ));

            return;
        }

        if (!this.project || this.project?.chain_project_id) {
            utils.redirect(config.dashboardUrl);
            return;
        }
        await this.fetchProject(this.project.id.toString());

        this.toggleSave = false;
        this.renderProject(this.project);
    }

    async fetchProject(projectId: string) {
        const resp = await model.fetchProject(projectId);
        if (resp.ok) {
            this.project = await resp.json();
            return this.project;
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
            utils.redirect(`${config.grantProposalsURL}/draft`)
        });

        this.$save.addEventListener("click", e => {
            const save = async () => {
                if (this.project) {
                    const resp = await model.postDraftProposal(this.project);
                    if (resp.ok) {
                        const project = await resp.json();
                        utils.redirect(`${config.grantProposalsURL}/preview`);
                    } else {
                        // TODO: UX for bad request posting draft
                        console.warn("Bad request posting draft", this.project);
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
            const userOwnsDraft = (this.user && (this.user.id === this.project?.user_id));
            if (!this.user && !userOwnsDraft) {
                this.wrapAuthentication(() => {
                    // call this handler "recursively"
                    this.$finalize.click();
                });
            } else {
                this.finalizeWorkflow();
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
                            handler: () => {
                            },
                            label: "Continue using local storage"
                        }
                    }
                },
            }
        ));
    }

    async updateGrantProposal(proposal: DraftProposal, id: string | number) {
        const resp = await model.updateProposal(proposal, id);
        if (resp.ok) {
            const proposal: Proposal = await resp.json();
            return proposal;
        }
    }

    async finalizeWorkflow(
        event: string = "begin",
        state?: Record<string, any>
    ): Promise<void> {
        const api = this.apiInfo?.imbue?.api;
        switch (event) {
            case "begin": {
                if (!this.project) {
                    return;
                }

                const extrinsic = api?.tx.imbueProposals.createProject(
                    this.project.name,
                    this.project.logo,
                    this.project.description,
                    this.project.website,
                    this.project.milestones,
                    this.project.required_funds,
                    this.project.currency_id
                );

                if (!extrinsic) {
                    // FIXME: UX
                    return;
                }

                return this.finalizeWorkflow(
                    "extrinsic-created",
                    {...state, extrinsic},
                );
            }
                break;
            case "extrinsic-created": {
                this.dispatchEvent(new CustomEvent(
                    config.event.accountChoice,
                    {
                        bubbles: true,
                        composed: true,
                        detail: {
                            address: this.user?.web3Accounts.find(_ => true)?.address,
                            callback: async (account?: InjectedAccountWithMeta) => {
                                if (account) {
                                    this.finalizeWorkflow(
                                        "account-chosen",
                                        {...state, account},
                                    );
                                }
                            }
                        }
                    }
                ));
            }
                break;
            case "account-chosen": {
                const extrinsic = state?.extrinsic as
                    SubmittableExtrinsic<"promise", ISubmittableResult>;
                const account = state?.account as
                    InjectedAccountWithMeta;
                const injector = await web3FromSource(account.meta.source);

                const txHash = await extrinsic.signAndSend(
                    account.address,
                    {signer: injector.signer},
                    ({status}) => {
                        if (status.isBroadcast) {
                            this.toggleEdit = false;
                            this.toggleSave = false;

                            this.$finalize.disabled = true;
                            this.$finalize.classList.add("blob");
                            this.$finalize.innerText = `Sending proposal (this may take a minute)...`;
                        }


                        api?.query.system.events((events: any) => {
                            if (events) {
                                // Loop through the Vec<EventRecord>
                                events.forEach((record: any) => {
                                    // Extract the phase, event and the event types
                                    const {event, phase} = record;
                                    const projectCreated = `${event.section}:${event.method}` == "imbueProposals:ProjectCreated";
                                    if (projectCreated) {

                                        const types = event.typeDef;
                                        const createdAccountId = event.data[0];
                                        const createdProjectId = parseInt(event.data[2].toString());
                                        if (createdAccountId == account.address && this.project) {
                                            this.project.chain_project_id = createdProjectId;
                                            this.updateGrantProposal(this.project, this.project.id);
                                        }

                                        this.$finalize.disabled = true;
                                        this.$finalize.classList.add("finalized");
                                        this.$finalize.innerText = "Proposal Created";

                                    }
                                });
                            }
                        });


                        // removing to speed up confirmation
                        // if (status.isInBlock) {
                        //     this.$finalize.innerText = `Finalising....`;
                        // }

                        if (status.isFinalized) {
                            location.reload();
                            return;
                        }
                    }
                ).catch((e: any) => {
                    this.errorNotification(e);
                });
            }
                break;
        }
    }

    renderProject(project: DraftProposal | Proposal) {
        if (!project) {
            throw new Error(
                "Attempt to render nonexistent draft."
            );
        }

        // this.$["about-project"].innerText = proposal.name;
        this.$projectName.innerText = project.name;
        this.$currencyLabel.innerHTML = "$" + model.Currency[project.currency_id];
        this.$projectWebsite.innerHTML = `
            <a href="${project.website}" target="_blank">${project.website
        }</a>
        `;
        this.$projectDescription.innerHTML =
            project.description && marked.parse(project.description);
        this.$projectLogo.setAttribute("srcset", project.logo);
        this.$fundsRequired.innerText = String(project.required_funds / 1e12);

        this.$milestones.innerHTML = "";
        project.milestones.forEach(milestone => {
            this.$milestones.appendChild(
                document.createRange().createContextualFragment(`
                    <li class="mdc-deprecated-list-item" tabindex="0">
                        <span class="mdc-deprecated-list-item__ripple"></span>
                        <span class="mdc-deprecated-list-item__graphic">
                            <i class="material-icons">pending_actions</i>
                        </span>
                        <span class="mdc-deprecated-list-item__text">
                            <span class="mdc-deprecated-list-item__primary-text">${milestone.name
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
