import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import "@pojagi/hoquet/lib/forms/textfield/textfield";
import TextField from '@pojagi/hoquet/lib/forms/textfield/textfield';
import type { SignerResult, SubmittableExtrinsic } from "@polkadot/api/types";
import { web3FromSource } from "@polkadot/extension-dapp";
import type { ISubmittableResult } from "@polkadot/types/types";

import "../../../material-components";
import formStyles from "../../../styles/forms.css";

import templateSrc from "./index.html";
import styles from "./index.css";

import type { MilestoneProposal, User } from '../../../model';
import { getWeb3Accounts } from "../../../utils/polkadot";
import * as model from "../../../model";
import * as config from "../../../config";
import * as utils from '../../../utils';
import { ImbueRequest, polkadotJsApiInfo } from '../../../dapp';

const projects:any[] = [];

declare global {
    interface ErrorConstructor {
        new(message?: string, opts?: {cause: Error}): Error;
    }
}

const template = document.createElement("template");
template.innerHTML = `
    <style>
    ${formStyles}
    ${styles}
    </style>
    ${templateSrc}
`;

const CONTENT = Symbol();

const hex_to_ascii = (str1: string) => {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}

export default class Form extends HTMLElement {
    private [CONTENT]: DocumentFragment;
    milestoneIdx: number = 0;
    user?: User | null;
    $submitMilestone: HTMLInputElement;
    $web3AccountSelect: HTMLSelectElement;
    $projectSelect: HTMLSelectElement;
    $milestoneSelect: HTMLSelectElement;
    $grantMilestoneForm: HTMLFormElement;

    accounts?: InjectedAccountWithMeta[];
    apiInfo?: polkadotJsApiInfo;
    
    get $fields(): HTMLInputElement[] {
        return Array.from(
            this.$grantMilestoneForm.querySelectorAll(".input-field")
        );
    }

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] = template.content.cloneNode(true) as
            DocumentFragment;

        this.$submitMilestone =
            this[CONTENT].getElementById("submit-milestone") as
                HTMLInputElement;
        this.$web3AccountSelect =
            this[CONTENT].getElementById("web3-account-select") as
                    HTMLSelectElement;
        this.$projectSelect =
            this[CONTENT].getElementById("project-select") as
                HTMLSelectElement;
        this.$milestoneSelect =
            this[CONTENT].getElementById("milestone-select") as
                HTMLSelectElement;
        this.$grantMilestoneForm =
            this[CONTENT].getElementById("milestone-submission-form") as
                HTMLFormElement;
    }

    reset() {
        ([
            "$projectSelect",
            "$web3AccountSelect",
            "$milestoneSelect",
        ] as const).forEach(prop => {
            this[prop].innerHTML = "<mwc-list-item></mwc-list-item>";
        });

        this.$fields.forEach($field => {
            $field.value = "";
            if ($field instanceof TextField) {
                const $input = $field as TextField;
                if ($input.textField) {
                    // This is to avoid error styling. The form will
                    // revalidate on change, input, submit, etc.
                    $input.textField.valid = true;
                }
            }
        });

    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
        this.bind();
    }

    accountFragment(account: InjectedAccountWithMeta) {
        return document.createRange().createContextualFragment(`
            <mwc-list-item
             twoline
             value="${account.address}"
             data-source="${account.meta.source}">
                <span>${account.meta.name ?? account.address}</span>
                <span class="select-source" slot="secondary">${
                    account.meta.source
                }</span>
            </mwc-list-item>
        `);
    }

    async init(request: ImbueRequest) {
        this.reset();

        this.$projectSelect.toggleAttribute("disabled", true);
        this.$projectSelect.value = "";
        this.$milestoneSelect.toggleAttribute("disabled", true);
        this.$milestoneSelect.value = "";
        this.$submitMilestone.toggleAttribute("disabled", true);

        this.$fields[0].focus();

        this.accounts = await request.accounts;
        this.user = await request.user;
        this.apiInfo = await request.apiInfo;
            
        const $select = this.$web3AccountSelect;

        this.accounts.forEach(account => {
            $select.appendChild(this.accountFragment(account));
        });

        const projectCountResponse = await this.apiInfo?.api.query.imbueProposals.projectCount();
        const projectCount = projectCountResponse.toJSON();
        for (let projectKey = 0; projectKey < (projectCount ? projectCount: 0); projectKey ++) {
            const response = await this.apiInfo?.api.query.imbueProposals.projects(projectKey);
            const project:any = response.toJSON();
            const milestones = [];
            for (let i = 0; i < project?.milestones.length; i ++) {
                milestones.push({
                    milestoneIndex: project?.milestones[i].milestoneIndex,
                    name: hex_to_ascii(project?.milestones[i].name)
                });
            }
            projects.push({
                projectKey: projectKey,
                initiator: project?.initiator,
                name: hex_to_ascii(project?.name),
                milestones: milestones
            });
        }

        this.$web3AccountSelect.addEventListener("change", e => {
            this.$projectSelect.innerHTML = "<mwc-list-item></mwc-list-item>";
            this.$submitMilestone.toggleAttribute("disabled", true);

            const address = this.$web3AccountSelect.value;
            if (address !== "") {
                this.$projectSelect.toggleAttribute("disabled", false);
                projects.filter((ev) => ev.initiator === address).forEach((project, idx) => {
                    this.$projectSelect.appendChild(
                        document.createRange().createContextualFragment(`
                        <mwc-list-item value="${project.projectKey}">
                            <span>${project.name}</span>
                        </mwc-list-item>
                        `)
                    );
                });
            } else {
                this.$projectSelect.toggleAttribute("disabled", true);
            }
        });

        this.$projectSelect.addEventListener("change", e => {
            const projectKey = this.$projectSelect.value;
            this.$submitMilestone.toggleAttribute("disabled", true);

            this.$milestoneSelect.innerHTML = "<mwc-list-item></mwc-list-item>";
            if (projectKey !== "") {
                const project = projects.find((ev) => (ev.projectKey === parseInt(projectKey)));
                this.$milestoneSelect.toggleAttribute("disabled", false);
                project?.milestones.forEach((milestone:any, idx:any) => {
                    this.$milestoneSelect.appendChild(
                        document.createRange().createContextualFragment(`
                        <mwc-list-item value="${milestone.milestoneIndex}">
                            <span>${milestone.name}</span>
                        </mwc-list-item>
                        `)
                    );
                });
            } else {
                this.$milestoneSelect.toggleAttribute("disabled", true);
            }
        });

        this.$milestoneSelect.addEventListener("change", e => {
            const milestoneIndex = this.$milestoneSelect.value;
            if (milestoneIndex) {
                this.$submitMilestone.toggleAttribute("disabled", false);
            } else {
                this.$submitMilestone.toggleAttribute("disabled",  true);
            }
        });
    }

    bind() {
        this.$grantMilestoneForm.addEventListener("submit", e => {
            e.preventDefault();
            e.stopPropagation();

            this.submitMilestoneProposal();
        });
    }

    proposalFromForm(formData: FormData): MilestoneProposal {
        return {
            projectKey: parseInt(formData.get("imbu-project") as string),
            milestoneIndex: parseInt(formData.get("imbu-milestone") as string),
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

    async submitMilestoneProposal(
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
                    this.submitMilestoneProposal(status.type);
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
                            this.submitMilestoneProposal(
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
            const $form = this.$grantMilestoneForm;
        
            const formData = new FormData($form);
            
            const proposal = this.proposalFromForm(formData);
            if (!proposal) {
                return;
            }
            const extrinsic = this.apiInfo?.api.tx.imbueProposals.submitMilestone(
                proposal.projectKey,
                proposal.milestoneIndex,
            );

            if (!extrinsic) {
                // FIXME: UX
                return;
            }

            return this.submitMilestoneProposal(
                "extrinsic-created",
                {...state, extrinsic},
            );
        } break;
        default:
            this.$submitMilestone.disabled = true;
            if (event === "Finalized") {
                this.$submitMilestone.classList.remove("blob");
                this.$submitMilestone.classList.add("finalized");
            } else {
                this.$submitMilestone.classList.add("blob");
            }
            this.$submitMilestone.innerText = event;
        }
    }
}

window.customElements.define("imbu-proposals-milestone-submission-form", Form);
