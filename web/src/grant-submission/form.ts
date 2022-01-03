import { ApiPromise } from "@polkadot/api";
import { web3Accounts, web3FromSource } from '@polkadot/extension-dapp';

import Hoquet from "@pojagi/hoquet/mixin";
import { html, stylesheet } from "@pojagi/hoquet/utils";
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import template from "./form.html";
import styles from "./form.css";



type Milestone = {
    name: string,
    percentageToUnlock: number,
};

type GrantProposal = {
    name: string,
    logo: string,
    description: string,
    contact: string,
    milestones: Milestone[],
    "required-funds": number,
};


export default class GrantSubmissionForm extends Hoquet(HTMLElement, {
    template: html`${template}`,
    stylesheets: [stylesheet`${styles}`],
    shadowy: false
}) {
    accounts: InjectedAccountWithMeta[];
    api: ApiPromise;

    constructor(api: ApiPromise, accounts: InjectedAccountWithMeta[]) {
        super();
        this.accounts = accounts;
        this.api = api;
    }

    get $fields(): HTMLInputElement[] {
        return Array.from(this.querySelectorAll(".input-field"));
    }

    get $inputs(): HTMLInputElement[] {
        return Array.from(this.querySelectorAll("input"));
    }

    connectedCallback() {
        if (this.rendered)
            return;

        this.render();
        this.addMilestoneItem();

        this.$fields.forEach($input => this.bindInputValidation($input));

        this.$["add-milestone"].addEventListener(
            "click", _ => this.addMilestoneItem());

        this.$["grant-submission-form"].addEventListener("submit", e => {
            e.preventDefault();
            e.stopPropagation();

            this.handleFormSubmission(e.target as HTMLFormElement);
        });

        this.accounts.forEach((account, idx) => {
            const $opt = this.fragment(`
                <mwc-list-item twoline value="${account.address}">
                    <span>${account.meta.name ?? account.address}</span>
                    <span class="web3-source" slot="secondary">${account.meta.source}</span>
                </mwc-list-item>
            `).firstElementChild as Node;
            this.$["web3-account-select"].appendChild($opt);
        });
    }

    bindInputValidation($input: HTMLInputElement) {
        $input.addEventListener("focus", _ => $input.setCustomValidity(""));
        $input.addEventListener("change", _ => this.reportValidity($input));
    }

    proposalFromFormData(formData: FormData): GrantProposal {
        return Object.fromEntries(
            Array.from(formData).map(
                ([k, v]) => [
                    k.replace(/^imbu-/, ""),
                    v
                ]
            )
        ) as unknown as GrantProposal;
    }

    reportValidity($input: HTMLInputElement, submitting: boolean = false) {
        if ($input.validity.valueMissing) {
            $input.setAttribute("validationmessage", "This field is required.");
        } else if ($input.classList.contains("milestone-percent-to-unlock")) {
            this.reportMilestoneImbalances(submitting);
        }
        $input.reportValidity();
    }

    toggleInputsAttribute(qualifiedName: string, force?: boolean): boolean[] {
        return [...this.$fields, this.$["submit-project"], this.$["add-milestone"]].map(
            $field => $field.toggleAttribute(qualifiedName, force)
        );
    }

    handleFormSubmission($form: HTMLFormElement): void {
        if (!this.accounts.length)
            throw new Error("No web3 accounts.");

        this.$fields.forEach($input => this.reportValidity($input, true));

        const valid = this.$fields.every(
            $input => $input.checkValidity()
        );

        // FIXME: We need UX here.
        if (!valid) {
            throw new Error("Invalid form data.");
        }

        // Form is valid.
        const formData = new FormData($form);
        const proposal = this.proposalFromFormData(formData);

        proposal.milestones = this.milestones;

        // XXX: shouldn't happen because we get the list of accounts to
        // populate the dropdown in the first place.
        const account = this.accounts.filter(
            account => account.address === formData.get("imbu-account")
        )[0];

        if (!account) {
            // FIXME: Need UX here.
            throw new Error("Selected account no longer found.");
        }

        this.submitGrantProposal(account, proposal);
    }

    reportMilestoneImbalances(submitting: boolean = false) {
        const $all = Array.from(
            this.querySelectorAll(".milestone-percent-to-unlock")
        ) as HTMLInputElement[];
        const aggregate = $all.reduce((p, $x) => p + parseInt($x.value), 0);

        const valid = submitting
            ? aggregate === 100
            : aggregate <= 100;

        if (!valid) {
            $all.forEach($input => {
                $input.setCustomValidity($input.getAttribute("helper") as string);
            });
        } else {
            $all.forEach($x => $x.setCustomValidity(""));
        }
        $all.forEach($input => $input.reportValidity());
    }

    addMilestoneItem() {
        const frag = (this.$["milestone-item-template"] as HTMLTemplateElement)
            .content
            .cloneNode(true) as DocumentFragment

        if (!this.$["milestones"].children.length) {
            frag.removeChild(frag.firstElementChild as Node);
        }

        frag.querySelector(".milestone-percent-to-unlock")?.addEventListener(
            "blur", e => this.reportMilestoneImbalances()
        );

        for (const $field of frag.querySelectorAll(".input-field")) {
            this.bindInputValidation($field as HTMLInputElement);
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

    async submitGrantProposal(account: InjectedAccountWithMeta, proposal: GrantProposal) {
        try {
            const injector = await web3FromSource(account.meta.source);

            this.$["imbu-status"].innerText = "Signing and sending.";
            this.$["imbu-dialog"].toggleAttribute("open", true);

            this.toggleInputsAttribute("disabled", true);
            const extrinsic = this.api.tx.imbueProposals.createProject(
                proposal.name,
                proposal.logo,
                proposal.description,
                proposal.contact,
                proposal.milestones,
                proposal["required-funds"],
            );
            const txHash = await extrinsic.signAndSend(
                account.address,
                {signer: injector.signer},
                ({ status }) => {
                    console.log(status);
                    if (status.isInBlock) {
                        console.log(`Completed at block hash #${status.asInBlock.toString()}`);
                        this.$["imbu-status"].innerText = `Completed at block hash #${status.asInBlock.toString()}`;

                        // FIXME: rather than timeout, provide a link to see the project detail page,
                        // and a button for the user to dismiss
                        setTimeout(() => {
                            this.dispatchEvent(new CustomEvent("imbu:grant-submission-form:done", {
                                bubbles: true, composed: true
                            }));                                
                        }, 5000);
                    } else {
                        this.$["imbu-status"].innerText = status.type;
                        console.log(`Current status: ${status.type}`);
                    }
                }
            );
            console.log(`Transaction hash: ${txHash}`);
        } catch (e: any) {
            console.error("Transaction failed...", e);
            // probably canceled, so just re-enable the form fields.
            this.toggleInputsAttribute("disabled", false);
            this.$["imbu-dialog"].toggleAttribute("open", false);
        }
    }
}

window.customElements.define("imbue-grant-submission-form", GrantSubmissionForm);
