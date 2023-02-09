import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import "@pojagi/hoquet/lib/forms/textfield/textfield";
import TextField from '@pojagi/hoquet/lib/forms/textfield/textfield';
import { MDCTabBar } from "@material/tab-bar";

import "../../material-components";
import formStyles from "../../styles/forms.css";

import templateSrc from "./index.html";
import styles from "./index.css";
import { categories } from "../../config";

import materialComponentsLink from "/material-components-link.html";
import materialIconsLink from "/material-icons-link.html";

import type { DraftMilestone, DraftProposal, User, Proposal } from "../../model";
import { getWeb3Accounts } from "../../utils/polkadot";
import * as model from "../../model";
import * as config from "../../config";
import * as utils from '../../utils';
import { ImbueRequest } from '../../dapp';
import authDialogContent from "../../dapp/auth-dialog-content.html";

declare global {
    interface ErrorConstructor {
        new(message?: string, opts?: { cause: Error }): Error;
    }
}

const template = document.createElement("template");
template.innerHTML = `
    ${materialComponentsLink}
    ${materialIconsLink}
    <style>
    ${formStyles}
    ${styles}
    </style>
    ${templateSrc}
`;

const ordinals = [
    "first",
    "second",
    "third",
];


const CONTENT = Symbol();


export default class Edit extends HTMLElement {
    private [CONTENT]: DocumentFragment;
    milestoneIdx: number = 0;
    user?: User | null;
    accounts?: Promise<InjectedAccountWithMeta[]>;

    $tabBar: HTMLElement;
    tabBar: MDCTabBar;
    $tabContentContainer: HTMLElement;

    $submitProposal: HTMLInputElement;
    $categorySelect: HTMLSelectElement;
    $web3AccountSelect: HTMLSelectElement;
    $web3Address: HTMLInputElement;
    $addMilestone: HTMLInputElement;
    $grantSubmissionForm: HTMLFormElement;
    $milestoneItemTemplate: HTMLTemplateElement;
    $milestones: HTMLOListElement;
    $currencySelect: HTMLSelectElement;
    currency = model.Currency;


    get $fields(): HTMLInputElement[] {
        return Array.from(
            this.$grantSubmissionForm.querySelectorAll(".input-field")
        );
    } get nextMilestoneOrdinal(): string {
        return ordinals[this.milestoneIdx++] ?? "next";
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this[CONTENT] = template.content.cloneNode(true) as
            DocumentFragment;

        this.$tabBar =
            this[CONTENT].getElementById("tab-bar") as
            HTMLElement;
        this.tabBar = new MDCTabBar(this.$tabBar);
        this.$tabContentContainer =
            this[CONTENT].getElementById("tab-content-container") as
            HTMLElement;

        this.$submitProposal =
            this[CONTENT].getElementById("submit-proposal") as
            HTMLInputElement;
        this.$categorySelect =
            this[CONTENT].getElementById("category-select") as
            HTMLSelectElement;
        this.$web3AccountSelect =
            this[CONTENT].getElementById("web3-account-select") as
            HTMLSelectElement;
        this.$addMilestone =
            this[CONTENT].getElementById("add-milestone") as
            HTMLInputElement;
        this.$grantSubmissionForm =
            this[CONTENT].getElementById("grant-submission-form") as
            HTMLFormElement;
        this.$milestoneItemTemplate =
            this[CONTENT].getElementById("milestone-item-template") as
            HTMLTemplateElement;
        this.$milestones =
            this[CONTENT].getElementById("milestones") as
            HTMLOListElement;
        this.$web3Address =
            this[CONTENT].getElementById("web3-address") as
            HTMLInputElement;
        this.$currencySelect =
            this[CONTENT].getElementById("currency-select") as
            HTMLSelectElement;
    }

    reset() {
        ([
            "$categorySelect",
            "$currencySelect",
            "$web3AccountSelect",
            "$milestones"
        ] as const).forEach(prop => {
            /**
             * `cloneNode(false)` means shallow clone, i.e., no children.
             */
            const $clone = this[prop].cloneNode(false);
            this[prop].parentElement?.replaceChild($clone, this[prop]);
            this[prop] = $clone as any;
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

        this.milestoneIdx = 0;
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
                <span class="select-source" slot="secondary">${account.meta.source
            }</span>
            </mwc-list-item>
        `);
    }

    async init(request: ImbueRequest) {
        this.disabled = false;
        this.reset();
        this.user = await request.user;

        this.accounts = request.accounts.then(accounts => {
            const $select = this.$web3AccountSelect;

            accounts.forEach(account => {
                $select.appendChild(this.accountFragment(account));
            });

            $select.appendChild(this.accountFragment({
                address: "other",
                meta: {
                    name: "Other",
                    source: `(entered manually)`
                }
            }));
            return accounts;
        });

        this.$web3AccountSelect.addEventListener("change", e => {
            const address = this.$web3AccountSelect.value;
            if (address === "other") {
                this.$web3Address.value = "";
                this.$web3Address.toggleAttribute("disabled", false);
            } else {
                this.$web3Address.toggleAttribute("disabled", true);
                this.$web3Address.value = address;
            }
        });

        this.$web3AccountSelect.addEventListener("closed", e => {
            if (this.$web3AccountSelect.value === "other")
                this.$web3Address.focus();
        });

        Object.entries(categories).forEach(([category, subcategies], idx) => {
            this.$categorySelect.appendChild(
                document.createRange().createContextualFragment(`
                    <mwc-list-item twoline value="${idx}">
                        <span>${category}</span>
                        <span class="select-source" slot="secondary">${subcategies.join("; ")
                    }</span>
                    </mwc-list-item>
                `)
            );
        });


        const currencies = Object.keys(this.currency).filter((v) => !isNaN(Number(v)));
        Object.values(currencies).forEach((currency) => {
            this.$currencySelect.appendChild(
                document.createRange().createContextualFragment(`
                    <mwc-list-item value='${currency}'>
                        <span>${this.currency[currency as any]}</span>
                    </mwc-list-item>
                `)
            );
        });

        const projectId = this.projectId;
        
        if (!projectId) {
            /**
             * "bad-route" because a candidate id was found, but it was
             * invalid (i.e., 400)
             */
             this.dispatchEvent(utils.badRouteEvent("bad-route"));
             return;
        }

        await this.setupProject(projectId);

        // Are we logged in?
        if (!this.user) {
            this.wrapAuthentication(() => {
                location.reload()
            });
        }

    }

    redirectToNewDraft() {
        utils.redirect(`${config.grantProposalsURL}`);
    }

    async setupProject(projectId: string) {
        let draft: DraftProposal;

        try {
            draft = await fetch(
                `${config.apiBase}/projects/${projectId}`,
                { headers: config.getAPIHeaders }
            ).then(async resp => {
                if (resp.ok) {
                    const project = await resp.json();
                    if (this.user?.id === project.user_id) {
                        return project;
                    } else {
                        this.redirectToNewDraft();
                    }
                } else if (resp.status === 404) {
                    // FIXME: 404 page or some other UX
                    // throw new Error("Not found");
                    this.redirectToNewDraft();
                    return;
                } else {
                    throw resp;
                }
            });
        } catch (cause) {
            this.dispatchEvent(utils.badRouteEvent("server-error"));

            throw new Error(
                `Server error fetching project with id ${projectId}`,
                { cause: cause as Error }
            );
        }

        setTimeout(() => {
            this.proposalIntoForm(draft);
        }, 0);
    }

    get projectId(): string | null {
        const candidate = window.location.pathname.split("/").pop();

        if (utils.validProjectId(candidate)) {
            return candidate as string;
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

        this.shadowRoot?.addEventListener("input", e => {
            this.reportValidity(e.target as any);
        });

        this.shadowRoot?.addEventListener("focus", e => {
            const target = e.target as any;
            if (target && target.setCustomValidity) {
                target.setCustomValidity("");
            }
        });

        this.$addMilestone.addEventListener(
            "click", _ => {
                const inputs = this.addMilestoneItem();
                inputs["milestone-next"].focus();
            }
        );

        this.$grantSubmissionForm.addEventListener("submit", e => {
            e.preventDefault();
            e.stopPropagation();

            this.handleFormSubmission();
        });
    }

    /**
     * At this point, the form must have been validated, so we simply cast
     * the form inputs into their respective types and rely on the fact that
     * there won't be any undefined values.
     * 
     * Note that `requiredFunds` is multiplied by 1e12, so that whatever the
     * user submits here, we are ultimately submitting
     * $number * 1_000_000_000_000 to the blockchain.
     */
    proposalFromForm(formData: FormData): DraftProposal {
        return {
            name: formData.get("imbu-name") as string,
            logo: formData.get("imbu-logo") as string,
            description: formData.get("imbu-description") as string,
            website: formData.get("imbu-website") as string,
            milestones: this.milestones,
            required_funds: parseInt(
                formData.get("imbu-funds-required") as string
            ) * 1e12,
            currency_id: parseInt(formData.get("imbu-currency") as string),
            category: formData.get("imbu-category") as string,
            owner: formData.get("imbu-address") as string,
            // faq: formData.get("imbu-faq") as string,
        }
    }

    proposalIntoForm(proposal: DraftProposal): void {
        const $inputFields: Record<string, HTMLInputElement> =
            this.$fields.reduce((p, c: Element) => ({
                ...p, [c.getAttribute("name") as string]: c
            }), {});

        this.accounts?.then(accounts => {
            if (proposal.owner && accounts.some(
                account => account.address === proposal.owner
            )) {
                $inputFields["imbu-account"].value = proposal.owner ?? "";
            } else {
                // `owner` exists and is a String
                $inputFields["imbu-account"].value = "other";
                $inputFields["imbu-address"].value = proposal.owner ?? "";
            }
        });
        $inputFields["imbu-name"].value = proposal.name ?? "";
        $inputFields["imbu-logo"].value = proposal.logo ?? "";
        $inputFields["imbu-description"].value = proposal.description ?? "";
        $inputFields["imbu-website"].value = proposal.website ?? "";
        $inputFields["imbu-funds-required"].value =
            String(proposal.required_funds / 1e12) ?? "";

        $inputFields["imbue-currency"].value = String(proposal.currency_id);
        $inputFields["imbu-category"].value = String(proposal.category ?? "");

        for (let milestone of proposal.milestones) {
            const $inputs = this.addMilestoneItem();
            $inputs["milestone-next"].value = milestone.name;
            $inputs["milestone-percent-to-unlock"].value =
                String(milestone.percentage_to_unlock);
        }

        // $inputFields["imbu-faq"].value = String(proposal.faq);
    }

    reportValidity($input: HTMLInputElement, submitting: boolean = false) {
        if ($input.validity.valueMissing) {
            $input.setAttribute(
                "validationmessage", "This field is required."
            );
        } else if ($input.classList.contains("milestone-percent-to-unlock")) {
            this.reportMilestoneImbalances(submitting);
        } else {
            $input.setAttribute("validationmessage", "");
        }
        $input.reportValidity();
    }

    toggleInputsAttribute(qualifiedName: string, force?: boolean): boolean[] {
        return [...this.$fields, this.$submitProposal, this.$addMilestone].map(
            $field => $field.toggleAttribute(qualifiedName, force)
        );
    }

    async handleFormSubmission(): Promise<void> {
        const $form = this.$grantSubmissionForm;
        /**
         * Often this field is disabled because it's set using a "select".
         * However, the value we want is ultimately taken from this field
         * instead, and it won't be culled from the form if it's disabled.
         */
        this.$web3Address.toggleAttribute("disabled", false);
        this.$fields.forEach($input => this.reportValidity($input, true));

        const valid = this.$fields.every(
            $input => $input.checkValidity()
        );

        if (!valid) {
            throw new Error("Invalid form data.");
        }

        // Form is valid.
        const formData = new FormData($form);
        this.disabled = true;
        const proposal = this.proposalFromForm(formData);

        const account = (await this.accounts)?.filter(
            account => account.address === proposal.owner
        )[0];

        // XXX: shouldn't happen because we get the list of accounts to
        // populate the dropdown in the first place.
        // if (!account) {
        //     // FIXME: Need UX here.
        //     throw new Error("Selected account no longer found.");
        // }

        return this.submitGrantProposal(proposal, account);
    }

    get milestonePercentFields() {
        if (!this.shadowRoot)
            return [];
        return Array.from(
            this.shadowRoot?.querySelectorAll(".milestone-percent-to-unlock")
        ) as HTMLInputElement[];
    }

    reportMilestoneImbalances(submitting: boolean = false) {
        const $all = Array.from(
            this.shadowRoot?.querySelectorAll(".milestone-percent-to-unlock") ?? []
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
        const frag = this.$milestoneItemTemplate
            .content
            .cloneNode(true) as DocumentFragment;

        (frag.querySelector(".milestone-next-label") as HTMLElement).innerText =
            `What is your ${ordinal} milestone?`;

        const $inputs = frag.querySelectorAll(".input-field");
        this.$milestones.appendChild(frag);

        return {
            "milestone-next": $inputs[0] as HTMLInputElement,
            "milestone-percent-to-unlock": $inputs[1] as HTMLInputElement,
        };
    }

    get milestones(): DraftMilestone[] {
        return Array.from(
            this.$milestones.querySelectorAll(".milestone")
        ).map(($li: Element) => {
            const [$name, $percentageToUnlock] =
                Array.from($li.children) as HTMLInputElement[];
            return {
                name: $name.value.trim(),
                percentage_to_unlock: parseInt($percentageToUnlock.value),
            } as DraftMilestone;
        });
    }

    set disabled(force: boolean) {
        this.toggleInputsAttribute("disabled", force);
    }

    async postGrantProposal(proposal: DraftProposal) {
        const resp = await model.postDraftProposal(proposal);

        if (resp.ok) {
            const proposal: Proposal = await resp.json();
            // FIXME: delete from localStorage?
            return proposal;
        } else {
            // TODO: UX for submission failed
            // maybe `this.dialog(...)`
            this.disabled = false;
        }
    }

    async submitGrantProposal(
        draft: DraftProposal,
        account?: InjectedAccountWithMeta,
    ): Promise<void> {

        // if yes, go ahead and post the draft with the `user_id`
        draft.user_id = this.user?.id;

        if (!this.projectId) {
            return;
        }

        const resp = await model.updateProposal(draft, this.projectId);
        if (resp.ok) {
            const proposal: Proposal = await resp.json();
        }


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

    savetoLocalStorage(proposal: DraftProposal) {
        window.localStorage.setItem(
            config.proposalsDraftLocalDraftKey,
            JSON.stringify(proposal)
        );
    }
}

window.customElements.define("imbu-my-projects-edit", Edit);
