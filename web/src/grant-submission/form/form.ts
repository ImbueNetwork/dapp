import type { ApiPromise } from "@polkadot/api";
import { web3FromSource } from '@polkadot/extension-dapp';

import Hoquet from "@pojagi/hoquet/mixin";
import { html, stylesheet } from "@pojagi/hoquet/utils";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import template from "./form.html";
import styles from "./form.css";
import { categories } from "../../config";

import "lib/imbue/forms/textfield/textfield";


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
    requiredFunds: number,
};

const ordinals = [
    "first",
    "second",
    "third",
];


export default class GrantSubmissionForm extends Hoquet(HTMLElement, {
    template: html`${template}`,
    stylesheets: [stylesheet`${styles}`],
    shadowy: false
}) {
    accounts: InjectedAccountWithMeta[];
    api: ApiPromise;
    milestoneIdx: number = 0;

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

    get nextMilestoneOrdinal(): string {
        return ordinals[this.milestoneIdx++] ?? "next";
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
            this.$["web3-account-select"].appendChild(this.fragment(`
                <mwc-list-item twoline value="${account.address}">
                    <span>${account.meta.name ?? account.address}</span>
                    <span class="select-source" slot="secondary">${account.meta.source}</span>
                </mwc-list-item>
            `));
        });

        Object.entries(categories).forEach(([category, subcategies], idx) => {
            this.$["category-select"].appendChild(this.fragment(`
                <mwc-list-item twoline value="${idx}">
                    <span>${category}</span>
                    <span class="select-source" slot="secondary">${
                        subcategies.join("; ")
                    }</span>
                </mwc-list-item>
            `));
        });
    }

    bindInputValidation($input: HTMLInputElement) {
        $input.addEventListener("focus", _ => $input.setCustomValidity(""));
        $input.addEventListener("input", _ => this.reportValidity($input));
    }

    /**
     * At this point, the form should have been validated, so we simply cast
     * the form inputs into their respective types and rely on the fact that
     * there won't be any undefined values.
     * 
     * Note that `requiredFunds` is multiplied by 1e12, so that whatever the
     * user submits here, we are ultimately submitting
     * $number * 1_000_000_000_000 to the blockchain.
     */
    proposalFromFormData(formData: FormData): GrantProposal {
        return {
            name: formData.get("imbu-name") as string,
            logo: formData.get("imbu-logo") as string,
            description: formData.get("imbu-description") as string,
            contact: formData.get("imbu-contact") as string,
            milestones: this.milestones,
            requiredFunds: parseInt(
                formData.get("imbu-funds-required") as string
            ) * 1e12,
        }
    }

    reportValidity($input: HTMLInputElement, submitting: boolean = false) {
        if ($input.validity.valueMissing) {
            $input.setAttribute("validationmessage", "This field is required.");
        } else if ($input.classList.contains("milestone-percent-to-unlock")) {
            this.reportMilestoneImbalances(submitting);
        } else {
            $input.setAttribute("validationmessage", "");
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

        const account = this.accounts.filter(
            account => account.address === formData.get("imbu-account")
        )[0];

        // XXX: shouldn't happen because we get the list of accounts to
        // populate the dropdown in the first place.
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
        const ordinal = this.nextMilestoneOrdinal;
        const frag = (this.$["milestone-item-template"] as HTMLTemplateElement)
            .content
            .cloneNode(true) as DocumentFragment

        if (!this.$["milestones"].children.length) {
            frag.removeChild(frag.firstElementChild as Node);
        }

        frag.querySelector(".milestone-percent-to-unlock")?.addEventListener(
            "blur", e => this.reportMilestoneImbalances()
        );

        (frag.querySelector(".milestone-next-label") as HTMLElement).innerText =
            `What is you ${ordinal} milestone?`;

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

    toggleDisabled(force?: boolean) {
        this.toggleInputsAttribute("disabled", force);
    }

    async submitGrantProposal(account: InjectedAccountWithMeta, proposal: GrantProposal) {
        try {
            const injector = await web3FromSource(account.meta.source);

            this.dispatchEvent(new CustomEvent("imbu:status", {
                bubbles: true, detail: {
                    heading: "Submitting",
                    msg: "Signing and sending...",
                }
            }));

            this.toggleDisabled(true);
            const extrinsic = this.api.tx.imbueProposals.createProject(
                proposal.name,
                proposal.logo,
                proposal.description,
                proposal.contact,
                proposal.milestones,
                proposal.requiredFunds,
            );
            const txHash = await extrinsic.signAndSend(
                account.address,
                {signer: injector.signer},
                ({ status }) => {
                    console.log(status);
                    if (status.isInBlock) {
                        console.log(`Completed at block hash #${status.asInBlock.toString()}`);
                        this.dispatchEvent(new CustomEvent("imbu:status", {
                            bubbles: true, detail: {
                                heading: "Status",
                                msg: `Completed at block hash #${status.asInBlock.toString()}`,
                                dismissable: true,
                            }
                        }));

                        // FIXME: rather than timeout, provide a link to see the project detail page,
                        // and a button for the user to dismiss
                        setTimeout(() => {
                            this.dispatchEvent(new CustomEvent("imbu:grant-submission-form:done", {
                                bubbles: true, composed: true
                            }));
                        }, 5000);
                    } else {
                        this.dispatchEvent(new CustomEvent("imbu:status", {
                            bubbles: true, detail: {
                                heading: "Status",
                                msg: status.type,
                                dismissable: true,
                            }
                        }))
                        console.log(`Current status: ${status.type}`);
                    }
                }
            );
            console.log(`Transaction hash: ${txHash}`);
        } catch (e: any) {
            console.error("Transaction failed...", e);
            // probably canceled, so just re-enable the form fields.
            this.dispatchEvent(new CustomEvent("imbu:status", {
                bubbles: true, detail: {
                    heading: "Transaction failed",
                    msg: e.toString(),
                    dismissable: true
                }
            }));
            this.toggleDisabled(false);
        }
    }
}

window.customElements.define("imbu-grant-submission-form", GrantSubmissionForm);
