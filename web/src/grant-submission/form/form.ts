import Hoquet from "@pojagi/hoquet/mixin";
import { html, stylesheet } from "@pojagi/hoquet/utils";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import template from "./form.html";
import styles from "./form.css";
import { categories } from "../../config";

import "../../../lib/imbue/forms/textfield/textfield";


type Milestone = {
    name: string;
    percentageToUnlock: number;
};

type GrantProposal = {
    name: string;
    logo: string;
    description: string;
    website: string;
    milestones: Milestone[];
    requiredFunds: number;
    usrId?: number;
    category?: string;
};

type Draft = {
    proposal: GrantProposal;
    accountAddress?: string;
};

export type User = {
    id: number;
};

const ordinals = [
    "first",
    "second",
    "third",
];


export default class GrantSubmissionForm extends Hoquet(HTMLElement, {
    template: html`${template}`,
    stylesheets: [stylesheet`${styles}`],
    shadowy: false,
}) {
    milestoneIdx: number = 0;
    usr?: User;
    accounts?: InjectedAccountWithMeta[];

    get $fields(): HTMLInputElement[] {
        return Array.from(this.querySelectorAll(".input-field"));
    }

    get nextMilestoneOrdinal(): string {
        return ordinals[this.milestoneIdx++] ?? "next";
    }

    connectedCallback() {
        if (this.rendered)
            return;

        this.render();

        const draftSrc = localStorage["imbu-draft-proposal"];
        if (draftSrc) {
            const draft = JSON.parse(draftSrc);
            this.proposalIntoFormFields(draft);
        } else {
            this.addMilestoneItem();
        }

        this.$fields.forEach($input => this.bindFocusBlurValidation($input));

        this.$["add-milestone"].addEventListener(
            "click", _ => this.addMilestoneItem());

        this.$["grant-submission-form"].addEventListener("submit", e => {
            e.preventDefault();
            e.stopPropagation();

            this.handleFormSubmission(e.target as HTMLFormElement);
        });

        /**
         * TODO: maybe we should at least allow the accounts to be collected here if they're
         * already connected. But we still don't want to submit it to the chain until we get
         * to the detail page, where there will be a "commit" and "edit" button and plenty
         * of opportunity to communicate that submission is *final*, etc.
         */
        // this.accounts.forEach((account, idx) => {
        //     this.$["web3-account-select"].appendChild(this.fragment(`
        //         <mwc-list-item twoline value="${account.address}">
        //             <span>${account.meta.name ?? account.address}</span>
        //             <span class="select-source" slot="secondary">${account.meta.source}</span>
        //         </mwc-list-item>
        //     `));
        // });

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

    bindFocusBlurValidation($input: HTMLInputElement) {
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
            website: formData.get("imbu-website") as string,
            milestones: this.milestones,
            requiredFunds: parseInt(
                formData.get("imbu-funds-required") as string
            ) * 1e12,
            category: formData.get("imbu-category") as string,
        }
    }

    proposalIntoFormFields(draft: Draft): void {
        const proposal = draft.proposal;
        const $form = this.$["grant-submission-form"] as HTMLFormElement;
        const $inputFields: Record<string,HTMLInputElement> = Array.from(
            $form.querySelectorAll(".input-field")
        ).reduce((p, c: Element) => {
            return {...p, [c.getAttribute("name") as string]: c as HTMLInputElement};
        }, {});

        $inputFields["imbu-account"].value = draft.accountAddress ?? "";
        $inputFields["imbu-name"].value = proposal.name ?? "";
        $inputFields["imbu-logo"].value = proposal.logo ?? "";
        $inputFields["imbu-description"].value = proposal.description ?? "";
        $inputFields["imbu-website"].value = proposal.website ?? "";
        $inputFields["imbu-funds-required"].value = String(proposal.requiredFunds / 1e12) ?? "";
        $inputFields["imbu-category"].value = proposal.category ?? "";

        for (let milestone of proposal.milestones) {
            const $inputs = this.addMilestoneItem();
            $inputs["milestone-next"].value = milestone.name;
            $inputs["milestone-percent-to-unlock"].value = String(milestone.percentageToUnlock);
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
        // if (!this.accounts.length)
        //     throw new Error("No web3 accounts.");

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

        const account = this.accounts?.filter(
            account => account.address === formData.get("imbu-account")
        )[0];

        // XXX: shouldn't happen because we get the list of accounts to
        // populate the dropdown in the first place.
        // if (!account) {
        //     // FIXME: Need UX here.
        //     throw new Error("Selected account no longer found.");
        // }

        this.disabled = true;

        this.submitGrantProposal(proposal, account);
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
            this.bindFocusBlurValidation($field as HTMLInputElement);
        }

        const $inputs = frag.querySelectorAll(".input-field");
        this.$["milestones"].appendChild(frag);

        return {
            "milestone-next": $inputs[0] as HTMLInputElement,
            "milestone-percent-to-unlock": $inputs[1] as HTMLInputElement,
        };
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

    set disabled(force: boolean) {
        this.toggleInputsAttribute("disabled", force);
    }

    async submitGrantProposal(proposal: GrantProposal, account?: InjectedAccountWithMeta) {
        // check the api to see if the user is logged in
        if (this.usr) {
            const apiBase = this.getAttribute("api-base");
            if (apiBase) {
                // if yes, go ahead and post the draft with the `usr_id`
                proposal.usrId = this.usr.id;

                const resp = await fetch(`${apiBase}/projects/`, {
                    method: "post",
                    headers: {
                        "content-type": "application/json",
                        "accept": "application/json"
                    },
                    body: JSON.stringify(proposal)
                });

                if (resp.ok) {
                    // redirect to detail page
                } else {
                    // UX for submission failed
                }
            }
        } else {
            // if no, save the proposal to localStorage
            window.localStorage["imbu-draft-proposal"] = JSON.stringify({
                proposal,
                web3Account: account?.address,
            });
            // Now that we have the proposal ready in `localStorage`, redirect to the detail page
            // this.dispatchEvent(new CustomEvent("imbu:auth-login-required", {bubbles: true}));
        }
    }
}

window.customElements.define("imbu-grant-submission-form", GrantSubmissionForm);
