import { ApiPromise } from "@polkadot/api";
import { web3Accounts, web3FromSource } from '@polkadot/extension-dapp';

import Hoquet from "@pojagi/hoquet/mixin";
import { html, stylesheet } from "@pojagi/hoquet/utils";
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import template from "./form.html";

import "@material/mwc-textfield";
import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-textarea';
import '@material/mwc-icon';


const styles = stylesheet`
:root {
    --mdc-shape-small: 8px;
    --mdc-theme-primary: #B2FF0B;
    --mdc-theme-secondary: #411DC9;
    --mdc-theme-error: inherit;
    --mdc-theme-background: #1A1A19;
    --mdc-theme-surface: #1A1A19;

    --mdc-text-field-fill-color: rgba(235, 234, 226, 0.11);
    --mdc-text-field-label-ink-color: #aaa;
    --mdc-text-field-ink-color: #fafafa;

    --mdc-select-fill-color: rgba(235, 234, 226, 0.11); /* #1a1a19;*/
    --mdc-select-label-ink-color: #aaa;
    --mdc-select-ink-color: #fafafa;
    --mdc-theme-text-primary-on-background: #fafafa;
    --mdc-theme-text-secondary-on-background: var(--mdc-theme-secondary);
}
fieldset, legend {
    margin: 0;
    padding: 0;
}
fieldset:first-of-type {
    margin-top: 0;
}
fieldset {
    margin-top: 26px;
}
.label {
    margin-top: 0;
}
.milestone-separator {
    width: 95%;
    border: 1px 0 0 0;
    border-color: #555;
}
#milestones-fieldset {
    padding-bottom: 20px;
}
.input-field {
    margin: 0 0 5px 0;
    display: flex;
}
`;

type Milestone = {
    "name": string,
    "percentageToUnlock": number,
}

export default class GrantSubmissionForm extends Hoquet(HTMLElement, {
    template: html`${template}`,
    stylesheets: [styles],
    shadowy: false
}) {
    accounts: InjectedAccountWithMeta[];
    milstoneIdx = 1;
    api: ApiPromise;

    constructor(api: ApiPromise, accounts: InjectedAccountWithMeta[]) {
        super();
        this.accounts = accounts;
        this.api = api;

        console.log(accounts);
    }

    connectedCallback() {
        if (this.rendered)
            return;

        this.render();
        this.addMilestoneItem();

        this.$["add-milestone"].addEventListener(
            "click", e => this.addMilestoneItem()
        );

        this.$["grant-submission-form"].addEventListener("submit", e => {
            e.preventDefault();
            e.stopPropagation();
            this.submitGrantProposal(e.target as HTMLFormElement);
        });

        this.$["grant-submission-form"].addEventListener("reset", e => {
            (
                this.$["grant-submission-form"].querySelectorAll(".input-field") as
                    NodeListOf<HTMLInputElement>
            ).forEach(($field: HTMLInputElement) => {
                $field.value = "";
                $field.setCustomValidity("");
            });
        });

        this.accounts.forEach((account, idx) => {
            const $opt = this.fragment(`
                <mwc-list-item twoline value="${account.address}">
                    <span>${account.meta.name ?? account.address}</span>
                    <span slot="secondary">${account.meta.source}</span>
                </mwc-list-item>
            `).firstElementChild as Node;
            this.$["web3-account-select"].appendChild($opt);
        });
    }

    addMilestoneItem() {
        const frag = (this.$["milestone-item-template"] as HTMLTemplateElement)
            .content
            .cloneNode(true) as DocumentFragment

        if (!this.$["milestones"].children.length) {
            frag.removeChild(frag.firstElementChild as Node);
        }

        this.$["milestones"].appendChild(frag);
    }

    get milestones(): Milestone[] {
        return Array.from(this.$["milestones"].querySelectorAll(".milestone")).map(($li: Element) => {
            const [$name, $percentageToUnlock] = Array.from($li.children) as HTMLInputElement[];
            return {
                name: $name.value.trim(),
                percentageToUnlock: parseInt($percentageToUnlock.value)
            } as Milestone;
        });
    }

    async submitGrantProposal($grantSubmissionForm: HTMLFormElement) {
        if (!this.accounts.length)
            throw new Error("No web3 accounts.");
        
        const formData = new FormData($grantSubmissionForm);

        // let $firstMilestonePercent = Array.from($grantSubmissionForm.elements)
        //     .filter(x => x.id.startsWith("milestone-percent"))[0] as HTMLInputElement;

        // TODO: `checkValidity` on keyup or something like that
        // let total = 0;
        // for (let milestone of milestones) {
        //     total += milestone.percentageToUnlock;
        // }

        // if (total > 100) {
        //     $firstMilestonePercent.setCustomValidity(
        //         "Aggregate \"percent to unlock\" cannot exceed 100 percent.");
        //     return;
        // }

        // if (total !== 100) {
        //     $firstMilestonePercent.setCustomValidity(
        //         "Aggregate \"percent to unlock\" must equal exactly 100 percent.");
        //     return;
        // }

        // For now just using the first account we find.
        //const account = this.accounts[parseInt(formData.get("imbue-project-account")?.toString() || "0")];
        const account = this.accounts.filter(account => account.address === formData.get("imbue-project-account"))[0];
        
        if (!account) {
            throw new Error(`Selected account not found: ${formData.get("imbue-project-account")}`);
        }
        
        const injector = await web3FromSource(account.meta.source);

        const extrinsic = this.api.tx.imbueProposals.createProject(
            formData.get("imbue-project-name"),
            formData.get("imbue-project-logo"),
            formData.get("imbue-project-description"),
            formData.get("imbue-project-contact"),
            this.milestones,
            formData.get("imbue-project-required-funds"),
        );

        try {
            const txHash = await extrinsic.signAndSend(
                account.address,
                {signer: injector.signer},
                ({ status }) => {
                    if (status.isInBlock) {
                        console.log(`Completed at block hash #${status.asInBlock.toString()}`);
                        $grantSubmissionForm.reset();
                    } else {
                        console.log(`Current status: ${status.type}`);
                    }
                }
            );
            console.log(`Transaction hash: ${txHash}`);
        } catch (e: any) {
            console.error("Transaction failed...", e);
        }
    }
}

window.customElements.define("imbue-grant-submission-form", GrantSubmissionForm);
