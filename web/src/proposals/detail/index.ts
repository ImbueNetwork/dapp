import { marked } from "marked";
import "@pojagi/hoquet/lib/dialog/dialog";
import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog, { ActionConfig } from "@pojagi/hoquet/lib/dialog/dialog";
import authDialogContent from "./auth-dialog-content.html";
import { MDCTabBar } from "@material/tab-bar";
import type { SignerResult, SubmittableExtrinsic } from "@polkadot/api/types";
import type { ISubmittableResult } from "@polkadot/types/types";
import { web3FromSource } from "@polkadot/extension-dapp";

import materialComponentsLink from "/material-components-link.html";
import materialIconsLink from "/material-icons-link.html";
import templateSrc from "./index.html";
import styles from "./index.css";
import { DraftProposal, Proposal, User } from "../../model";
import * as model from "../../model";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ApiPromise, WsProvider } from "@polkadot/api";
import { getWeb3Accounts, signWeb3Challenge } from "../../utils/polkadot";
import * as config from "../../config";
import * as utils from "../../utils";
import type { ImbueRequest, polkadotJsApiInfo } from "../../dapp";

const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `
    ${materialComponentsLink}
    ${materialIconsLink}
    <style>${styles}</style>
    ${templateSrc}
`;

export default class Detail extends HTMLElement {
    user?: User | null;
    project?: Proposal;
    $contribute: HTMLButtonElement;
    $tabContentContainer: HTMLElement;
    $tabBar: HTMLElement;
    tabBar: MDCTabBar;

    $projectName: HTMLElement;
    $projectWebsite: HTMLElement;
    $projectDescription: HTMLElement;
    $projectLogo: HTMLImageElement;
    $milestones: HTMLOListElement;
    apiInfo?: polkadotJsApiInfo;
    $fundsRequired: HTMLElement;
    $imbuContribution: HTMLElement;
    $contributionSubmissionForm: HTMLFormElement;

    private [CONTENT]: DocumentFragment;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
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

        this.$milestones =
            this[CONTENT].getElementById("milestones") as
            HTMLOListElement;

        this.$fundsRequired =
            this[CONTENT].getElementById("funds-required") as
            HTMLElement;

        this.$imbuContribution =
            this[CONTENT].getElementById("imbu-contribution") as
            HTMLElement;
        this.$contributionSubmissionForm =
            this[CONTENT].getElementById("contribution-submission-form") as
            HTMLFormElement;
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

        this.apiInfo = await request.apiInfo;
        this.user = await request.user;


        /**
         * We await this here because if there's no draft, we don't want to
         * bother with any other confusing and/or expensive tasks.
         */
        await this.fetchProject(projectId).then(project => {
            if (project) {
                this.renderProject(project);
            } else {
                /**
                 * Same as FIXME above. Do we want a 404 page here, dialog,
                 * or what?
                 */
                this.dispatchEvent(utils.badRouteEvent("not-found"));
                return;
            }
        });
    }


    async fetchProject(projectId: string) {
        if (this.project) {
            return this.project;
        }
        const resp = await model.fetchProject(projectId);
        if (resp.ok) {
            this.project = await resp.json();
            return this.project;
        }
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
            this.contribute();
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
                            handler: () => { },
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
            <a href="${draft.website}" target="_blank">${draft.website
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


    async contribute(
        event: string = "begin",
        state?: Record<string, any>
    ): Promise<void> {
        const formData = new FormData(this.$contributionSubmissionForm);
        const contribution = parseInt(
            formData.get("imbu-contribution") as string
        ) * 1e12;
        const api = this.apiInfo?.api;
        switch (event) {
            case "begin":
                {
                    this.$contribute.disabled = true;
                    this.$contribute.classList.add("blob");
                    const extrinsic = this.apiInfo?.api.tx.imbueProposals.contribute(
                        this.project?.chain_project_id,
                        contribution
                    );
                    if (!extrinsic) {
                        // FIXME: UX
                        return;
                    }

                    return this.contribute(
                        "extrinsic-created",
                        { ...state, extrinsic },
                    );
                }
            case "extrinsic-created":
                {
                    this.dispatchEvent(new CustomEvent(
                        config.event.accountChoice,
                        {
                            bubbles: true,
                            composed: true,
                            detail: (account?: InjectedAccountWithMeta) => {
                                if (account) {
                                    this.contribute(
                                        "account-chosen",
                                        { ...state, account },
                                    );
                                }
                            }
                        }
                    ));
                } break;
            case "account-chosen":
                {
                    const extrinsic = state?.extrinsic as
                        SubmittableExtrinsic<"promise", ISubmittableResult>;
                    const account = state?.account as
                        InjectedAccountWithMeta;
                    const injector = await web3FromSource(account.meta.source);

                    const txHash = await extrinsic.signAndSend(
                        account.address,
                        { signer: injector.signer },
                        ({ status }) => {

                            api?.query.system.events((events: any) => {
                                if (events) {
                                    // Loop through the Vec<EventRecord>
                                    events.forEach((record: any) => {
                                        // Extract the phase, event and the event types
                                        const { event, phase } = record;
                                        const contributionSucceeded = `${event.section}:${event.method}` == "imbueProposals:ContributeSucceed";
 
                                        if (contributionSucceeded) {
                                            const types = event.typeDef;
                                            const contributionAccountId = event.data[0];
                                            const contributionProjectId = parseInt(event.data[1].toString());

                                            if (contributionAccountId == account.address && contributionProjectId ==this.project?.chain_project_id && this.project && this.projectId) {
                                                this.$contribute.classList.remove("blob");
                                                this.$contribute.disabled = false;
                                                this.$contribute.classList.add("finalized");
                                                this.$contribute.innerText = "Contribution Succeeded";
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    ).catch((e: any) => {
                        this.errorNotification(e);
                    });
                    console.log(`Transaction hash: ${txHash}`);
                } break;
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
}

window.customElements.define("imbu-proposals-detail", Detail);
