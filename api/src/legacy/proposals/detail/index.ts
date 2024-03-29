import { marked } from "marked";
import "@pojagi/hoquet/lib/dialog/dialog";
import authDialogContent from "../../dapp/auth-dialog-content.html";
import { MDCTabBar } from "@material/tab-bar";
import type { SubmittableExtrinsic } from "@polkadot/api/types";
import type { ISubmittableResult, ITuple, } from "@polkadot/types/types";
import type { DispatchError } from '@polkadot/types/interfaces';

import { web3FromSource } from "@polkadot/extension-dapp";
import materialComponentsLink from "/material-components-link.html";
import materialIconsLink from "/material-icons-link.html";
import templateSrc from "./index.html";
import styles from "./index.css";
import * as model from "../../model";
import { DraftProposal, Proposal, User } from "../../model";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { getDispatchError } from "../../utils/polkadot";
import * as config from "../../config";
import * as utils from "../../utils";
import type { ImbueApiInfo, ImbueRequest } from "../../dapp";

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
    $tabContentContainer: HTMLElement;
    $tabBar: HTMLElement;
    tabBar: MDCTabBar;
    openForVoting: boolean;
    userIsInitiator: boolean;

    $projectName: HTMLElement;
    $projectWebsite: HTMLElement;
    $projectDescription: HTMLElement;
    $projectLogo: HTMLImageElement;
    $milestones: HTMLOListElement;
    apiInfo: ImbueApiInfo | undefined;
    $fundsRequired: HTMLElement;
    $projectCurrency: HTMLElement;
    $projectDetailCurrency: HTMLElement;
    $fundingRoundNotYetOpenMsg: HTMLElement;

    $contributionSubmissionForm: HTMLFormElement;
    $imbuContribution: HTMLElement;
    $contribute: HTMLButtonElement;

    $voteSubmissionForm: HTMLFormElement;
    $voteMilestoneSelect: HTMLSelectElement;
    $vote: HTMLButtonElement;

    $submitMilestoneForm: HTMLFormElement;
    $submitMilestoneSelect: HTMLSelectElement;
    $submitMilestone: HTMLButtonElement;

    $withdraw: HTMLButtonElement;

    private [CONTENT]: DocumentFragment;

    constructor() {
        super();

        this.attachShadow({ mode: "open" });

        this.openForVoting = false;
        this.userIsInitiator = false;

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

        this.$contributionSubmissionForm =
            this[CONTENT].getElementById("contribution-submission-form") as
            HTMLFormElement;

        this.$projectCurrency =
            this[CONTENT].getElementById("project-currency") as
            HTMLElement;

        this.$projectDetailCurrency =
            this[CONTENT].getElementById("project-detail-currency") as
            HTMLElement;

        this.$fundingRoundNotYetOpenMsg =
            this[CONTENT].getElementById("funding-round-not-yet-open") as
            HTMLElement;

        this.$imbuContribution =
            this[CONTENT].getElementById("imbu-contribution") as
            HTMLElement;

        this.$contribute =
            this[CONTENT].getElementById("contribute") as
            HTMLButtonElement;

        this.$voteSubmissionForm =
            this[CONTENT].getElementById("vote-submission-form") as
            HTMLFormElement;

        this.$voteMilestoneSelect =
            this[CONTENT].getElementById("vote-milestone-select") as
            HTMLSelectElement;

        this.$vote =
            this[CONTENT].getElementById("vote") as
            HTMLButtonElement;

        this.$submitMilestoneForm =
            this[CONTENT].getElementById("submit-milestone-form") as
            HTMLFormElement;

        this.$submitMilestoneSelect =
            this[CONTENT].getElementById("submit-milestone-select") as
            HTMLSelectElement;

        this.$submitMilestone =
            this[CONTENT].getElementById("submit-milestone") as
            HTMLButtonElement;

        this.$withdraw =
            this[CONTENT].getElementById("withdraw") as
            HTMLButtonElement;
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


        /**
         * We await this here because if there's no draft, we don't want to
         * bother with any other confusing and/or expensive tasks.
         */
        // await this.fetchProject(projectId);
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

        this.apiInfo = await request.apiInfo;
        this.user = await request.user;

        await this.handleButtonStates();
    }

    milestoneFragment(milestone: any) {
        return document.createRange().createContextualFragment(`
            <mwc-list-item
             twoline
             value="${milestone.milestoneKey}">
                <span>${milestone.name}</span>
                <span class="select-source" slot="secondary">${milestone.percentageToUnlock
            }%</span>
            </mwc-list-item>
        `);
    }

    async handleButtonStates() {

        if (this.apiInfo) {
            const projectOnChain: any = await (await this.apiInfo?.imbue?.api.query.imbueProposals.projects(this.project?.chain_project_id)).toHuman();

            if (projectOnChain) {

                let projectInContributionRound = false;
                let projectInVotingRound = false;

                const lastHeader = await this.apiInfo?.imbue?.api.rpc.chain.getHeader();
                const currentBlockNumber = lastHeader.number.toBigInt();

                const rounds: any = await (await this.apiInfo?.imbue?.api.query.imbueProposals.rounds.entries());

                if (this.user) {
                    this.user?.web3Accounts.forEach(web3Account => {
                        if (web3Account.address == projectOnChain.initiator) {
                            this.userIsInitiator = true;
                        }
                    });
                }

                projectOnChain.milestones.forEach((milestone: any) => {
                    this.$voteMilestoneSelect.appendChild(this.milestoneFragment(milestone));
                    this.$submitMilestoneSelect.appendChild(this.milestoneFragment(milestone));
                });

                //TODO Check if project is in the scheduled round for contribution
                for (var i = Object.keys(rounds).length - 1; i >= 0; i--) {
                    const [id, round] = rounds[i];
                    const readableRound = round.toHuman();
                    const roundStart = BigInt(readableRound.start.replaceAll(",", ""));
                    const roundEnd = BigInt(readableRound.end.replaceAll(",", ""));
                    const ProjectExistsInRound = readableRound.projectKeys.includes(projectOnChain.milestones[0].projectKey)

                    if (roundStart < currentBlockNumber && roundEnd > currentBlockNumber && ProjectExistsInRound) {
                        if (projectOnChain.approvedForFunding && readableRound.roundType == model.RoundType[model.RoundType.ContributionRound]) {
                            projectInContributionRound = true;
                            break;
                        } else if (projectOnChain.fundingThresholdMet && readableRound.roundType == model.RoundType[model.RoundType.VotingRound]) {
                            projectInVotingRound = true;
                            break;
                        }
                    }
                }


                // this.openForContributions = projectIsInFundingRound;
                if (projectOnChain.fundingThresholdMet) {
                    // Initators cannot contribute to their own project
                    if (this.userIsInitiator) {
                        this.$submitMilestoneForm.hidden = !this.userIsInitiator
                        this.$withdraw.hidden = !this.userIsInitiator
                        if (projectInVotingRound) {
                            this.$fundingRoundNotYetOpenMsg.hidden = false;
                            this.$fundingRoundNotYetOpenMsg.innerHTML = "Awaiting milestone approval. Milestone voting round not complete or approved. Please <a href='https://discord.gg/jyWc6k8a'>contact the team</a> for review."
                        } else {
                            this.$submitMilestone.hidden = !this.userIsInitiator
                        }
                    } else if (projectInVotingRound) {
                        this.openForVoting = projectInVotingRound;
                        this.$voteSubmissionForm.hidden = !this.openForVoting
                        this.$vote.hidden = !this.openForVoting;
                    } else {
                        this.$fundingRoundNotYetOpenMsg.hidden = false;
                        this.$fundingRoundNotYetOpenMsg.innerText = "Awaiting milestone submission";
                    }
                } else if (!this.userIsInitiator && projectInContributionRound) {
                    this.$contributionSubmissionForm.hidden = this.openForVoting;
                    this.$contribute.hidden = this.openForVoting;
                } else {
                    // Project not yet open for funding
                    this.$fundingRoundNotYetOpenMsg.hidden = false;
                    if (projectOnChain.approvedForFunding && !projectInContributionRound) {
                        this.$fundingRoundNotYetOpenMsg.innerHTML = "Awaiting funding approval. Funding round not complete or approved. Please <a href='https://discord.gg/jyWc6k8a'>contact the team</a> for review."
                    } else if (this.userIsInitiator) {
                        if (projectInContributionRound) {
                            this.$fundingRoundNotYetOpenMsg.innerHTML = "Your proposal has been created successfully and added to the funding round. Contributors can now fund your project."
                        } else {
                            this.$fundingRoundNotYetOpenMsg.innerHTML = "Your proposal has been created successfully. Please <a href='https://discord.gg/jyWc6k8a'>contact the team</a> for review and to open your funding round."
                        }
                    } else {
                        this.$fundingRoundNotYetOpenMsg.innerText = "Funding for this project is not yet open. Check back soon for more updates!"
                    }
                }

                for (var i = Object.keys(projectOnChain.contributions).length - 1; i >= 0; i--) {
                    this.user?.web3Accounts.forEach(web3Account => {
                        if (web3Account.address == projectOnChain.contributions[i].accountId && this.project) {
                            const contributionValue = BigInt(projectOnChain.contributions[i].value.replaceAll(",", "")) / BigInt(1e12);
                            this.$fundingRoundNotYetOpenMsg.innerText = this.$fundingRoundNotYetOpenMsg.innerText + `\n\n Your Contributions: $${model.Currency[this.project.currency_id]} ${contributionValue}`
                        }
                    });
                };
            }
        }
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

        this.$vote.addEventListener("click", e => {
            const valid = utils.validateForm(this.$voteSubmissionForm);
            if (!valid) {
                throw new Error("Invalid form data.");
            }
            this.vote();
        });

        this.$submitMilestone.addEventListener("click", e => {
            const valid = utils.validateForm(this.$submitMilestoneForm);
            if (!valid) {
                throw new Error("Invalid form data.");
            }
            this.submitMilestone();
        });

        this.$withdraw.addEventListener("click", e => {
            const valid = utils.validateForm(this.$submitMilestoneForm);
            if (!valid) {
                throw new Error("Invalid form data.");
            }
            this.withdraw();
        });
    }

    async renderProject(draft: DraftProposal | Proposal) {
        if (!draft) {
            throw new Error(
                "Attempt to render nonexistent draft."
            );
        }
        if (draft.chain_project_id !== 0 && !draft.chain_project_id) {
            // If the project is not finalised, redirect to the preview page
            const preview_url = `${config.grantProposalsURL}/preview`;
            utils.redirect(preview_url);
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
        this.$projectCurrency.innerText = "$" + model.Currency[draft.currency_id as any];
        this.$projectDetailCurrency.innerText = this.$projectCurrency.innerText;
        this.$milestones.querySelectorAll('*').forEach(n => n.remove());
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
        const contribution =  BigInt(parseFloat(formData.get("imbu-contribution") as string) * 1e12);
        const api = this.apiInfo?.imbue?.api;
        switch (event) {
            case "begin": {
                this.$contribute.disabled = true;
                this.$contribute.classList.add("blob");
                this.$contribute.innerText = "Saving.....";
                const extrinsic = api?.tx.imbueProposals.contribute(
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
            case "extrinsic-created": {
                this.dispatchEvent(new CustomEvent(
                    config.event.accountChoice,
                    {
                        bubbles: true,
                        composed: true,
                        detail: {
                            address: this.user?.web3Accounts.find(_ => true)?.address,
                            callback: (account?: InjectedAccountWithMeta) => {
                                if (account) {
                                    this.contribute(
                                        "account-chosen",
                                        { ...state, account },
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
                    { signer: injector.signer },
                    ({ status }) => {
                        api?.query.system.events((events: any) => {
                            if (events) {
                                // Loop through the Vec<EventRecord>
                                events.forEach((record: any) => {

                                    // Extract the phase, event and the event types
                                    const { event, phase } = record;
                                    const contributionSucceeded = `${event.section}:${event.method}` == "imbueProposals:ContributeSucceeded";
                                    const [dispatchError] = event.data as unknown as ITuple<[DispatchError]>;
                                    if (dispatchError.isModule) {
                                        try {
                                            let errorMessage = getDispatchError(dispatchError);
                                            this.errorNotification(Error(errorMessage));

                                            this.$contribute.disabled = false;
                                            this.$contribute.classList.remove("blob");
                                            this.$contribute.innerText = "Contribute";
                                            location.reload();
                                        } catch (error) {
                                            // swallow
                                        }
                                    }

                                    if (contributionSucceeded) {
                                        const types = event.typeDef;
                                        const contributionAccountId = event.data[0];
                                        const contributionProjectId = parseInt(event.data[1].toString());

                                        if (contributionAccountId == account.address && contributionProjectId == this.project?.chain_project_id && this.project && this.projectId) {
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
            }
                break;
        }
    }

    async vote(
        event: string = "begin",
        state?: Record<string, any>
    ): Promise<void> {
        const formData = new FormData(this.$voteSubmissionForm);
        const userVote = (formData.get("vote-select") as string).toLowerCase() == "true";
        const milestoneKey = parseInt(formData.get("vote-milestone-select") as string);
        const api = this.apiInfo?.imbue?.api;

        switch (event) {
            case "begin": {
                this.$vote.disabled = true;
                this.$vote.classList.add("blob");
                this.$vote.innerText = "Saving.....";

                const extrinsic = api?.tx.imbueProposals.voteOnMilestone(
                    this.project?.chain_project_id,
                    milestoneKey,
                    userVote
                );

                if (!extrinsic) {
                    // FIXME: UX
                    return;
                }

                return this.vote(
                    "extrinsic-created",
                    { ...state, extrinsic },
                );
            }
            case "extrinsic-created": {
                this.dispatchEvent(new CustomEvent(
                    config.event.accountChoice,
                    {
                        bubbles: true,
                        composed: true,
                        detail: {
                            address: this.user?.web3Accounts.find(_ => true)?.address,
                            callback: (account?: InjectedAccountWithMeta) => {
                                if (account) {
                                    this.vote(
                                        "account-chosen",
                                        { ...state, account },
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
                    { signer: injector.signer },
                    ({ status }) => {

                        api?.query.system.events((events: any) => {
                            if (events) {
                                // Loop through the Vec<EventRecord>
                                events.forEach((record: any) => {
                                    // Extract the phase, event and the event types
                                    const { event, phase } = record;
                                    const voteSucceeded = `${event.section}:${event.method}` == "imbueProposals:VoteComplete";
                                    const [dispatchError] = event.data as unknown as ITuple<[DispatchError]>;
                                    if (dispatchError.isModule) {
                                        try {
                                            let errorMessage = getDispatchError(dispatchError);
                                            this.errorNotification(Error(errorMessage));

                                            this.$vote.disabled = false;
                                            this.$vote.classList.remove("blob");
                                            this.$vote.innerText = "Vote";
                                            location.reload();
                                        } catch (error) {
                                            // swallow
                                        }
                                    }

                                    if (voteSucceeded) {
                                        const types = event.typeDef;
                                        const voterAccountId = event.data[0];
                                        const voterProjectId = parseInt(event.data[1].toString());
                                        if (voterAccountId == account.address && voterProjectId == this.project?.chain_project_id && this.project && this.projectId) {
                                            this.$vote.classList.remove("blob");
                                            this.$vote.disabled = false;
                                            this.$vote.classList.add("finalized");
                                            this.$vote.innerText = "Vote Registered";
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
            }
                break;
        }
    }

    async submitMilestone(
        event: string = "begin",
        state?: Record<string, any>
    ): Promise<void> {
        const formData = new FormData(this.$submitMilestoneForm);
        const milestoneKey = parseInt(formData.get("submit-milestone-select") as string);
        const api = this.apiInfo?.imbue?.api;

        switch (event) {
            case "begin": {
                this.$submitMilestone.disabled = true;
                this.$submitMilestone.classList.add("blob");
                this.$submitMilestone.innerText = "Saving.....";

                const extrinsic = api?.tx.imbueProposals.submitMilestone(
                    this.project?.chain_project_id,
                    milestoneKey,
                );

                if (!extrinsic) {
                    // FIXME: UX
                    return;
                }

                return this.submitMilestone(
                    "extrinsic-created",
                    { ...state, extrinsic },
                );
            }
            case "extrinsic-created": {
                this.dispatchEvent(new CustomEvent(
                    config.event.accountChoice,
                    {
                        bubbles: true,
                        composed: true,
                        detail: {
                            address: this.user?.web3Accounts.find(_ => true)?.address,
                            callback: (account?: InjectedAccountWithMeta) => {
                                if (account) {
                                    this.submitMilestone(
                                        "account-chosen",
                                        { ...state, account },
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
                    { signer: injector.signer },
                    ({ status }) => {

                        api?.query.system.events((events: any) => {
                            if (events) {
                                // Loop through the Vec<EventRecord>
                                events.forEach((record: any) => {
                                    // Extract the phase, event and the event types
                                    const { event, phase } = record;
                                    const milestoneSubmitted = `${event.section}:${event.method}` == "imbueProposals:MilestoneSubmitted";
                                    const [dispatchError] = event.data as unknown as ITuple<[DispatchError]>;
                                    if (dispatchError.isModule) {
                                        try {
                                            let errorMessage = getDispatchError(dispatchError);
                                            this.errorNotification(Error(errorMessage));

                                            this.$submitMilestone.disabled = false;
                                            this.$submitMilestone.classList.remove("blob");
                                            this.$submitMilestone.innerText = "Submit";
                                            location.reload();
                                        } catch (error) {
                                            // swallow
                                        }
                                    }


                                    if (milestoneSubmitted) {
                                        const types = event.typeDef;
                                        const submittedProjectId = parseInt(event.data[0].toString());

                                        const submittedMilestoneId = parseInt(event.data[1].toString());


                                        if (submittedProjectId == this.project?.chain_project_id && submittedMilestoneId == milestoneKey) {
                                            this.$submitMilestone.classList.remove("blob");
                                            this.$submitMilestone.disabled = false;
                                            this.$submitMilestone.classList.add("finalized");
                                            this.$submitMilestone.innerText = "Milestone Submitted";
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
            }
                break;
        }
    }

    async withdraw(
        event: string = "begin",
        state?: Record<string, any>
    ): Promise<void> {
        const api = this.apiInfo?.imbue?.api;

        switch (event) {
            case "begin": {
                this.$withdraw.disabled = true;
                this.$withdraw.classList.add("blob");
                this.$withdraw.innerText = "Saving.....";

                const extrinsic = api?.tx.imbueProposals.withdraw(
                    this.project?.chain_project_id,
                );

                if (!extrinsic) {
                    // FIXME: UX
                    return;
                }

                return this.withdraw(
                    "extrinsic-created",
                    { ...state, extrinsic },
                );
            }
            case "extrinsic-created": {
                this.dispatchEvent(new CustomEvent(
                    config.event.accountChoice,
                    {
                        bubbles: true,
                        composed: true,
                        detail: {
                            address: this.user?.web3Accounts.find(_ => true)?.address,
                            callback: (account?: InjectedAccountWithMeta) => {
                                if (account) {
                                    this.withdraw(
                                        "account-chosen",
                                        { ...state, account },
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
                    { signer: injector.signer },
                    ({ status }) => {

                        api?.query.system.events((events: any) => {
                            if (events) {
                                // Loop through the Vec<EventRecord>
                                events.forEach((record: any) => {
                                    // Extract the phase, event and the event types
                                    const { event, phase } = record;
                                    const withdrawSuccessful = `${event.section}:${event.method}` == "imbueProposals:ProjectFundsWithdrawn";
                                    const [dispatchError] = event.data as unknown as ITuple<[DispatchError]>;
                                    if (dispatchError.isModule) {
                                        try {
                                            let errorMessage = getDispatchError(dispatchError);
                                            this.errorNotification(Error(errorMessage));

                                            this.$withdraw.disabled = false;
                                            this.$withdraw.classList.remove("blob");
                                            this.$withdraw.innerText = "Withdraw";
                                            location.reload();
                                        } catch (error) {
                                            // swallow
                                        }
                                    }

                                    if (withdrawSuccessful) {
                                        const types = event.typeDef;
                                        const withdrawalAccountId = event.data[0];
                                        const withdrawalProjectId = parseInt(event.data[1].toString());


                                        if (withdrawalAccountId == account.address && withdrawalProjectId == this.project?.chain_project_id) {
                                            this.$withdraw.classList.remove("blob");
                                            this.$withdraw.disabled = false;
                                            this.$withdraw.classList.add("finalized");
                                            this.$withdraw.innerText = "Withdraw Successful";
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
            }
                break;
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
