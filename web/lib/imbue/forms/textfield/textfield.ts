import Hoquet from "@pojagi/hoquet/mixin";
import { html, stylesheet } from "@pojagi/hoquet/utils";
import { MDCTextField } from "@material/textfield";
import 'element-internals-polyfill';
import rootStyles from "/src/common.css";

import template from "./textfield.html";
import styles from "./textfield.css";


const inputAttrs = new Set([
    "type", "pattern", "min", "max", "step", "minlength",
    "maxlength", "disabled", "required",
]);

export default class TextField extends Hoquet(HTMLElement, {
    template: html`${template}`,
    stylesheets: [stylesheet`${rootStyles}${styles}`],
    shadowy: true,
    attributes: [...inputAttrs, "validationmessage", "helper", "persistent-helper"]
}) {

    textField: MDCTextField;
    internals: ElementInternals | any;
    $input: HTMLInputElement;
    static formAssociated = true;

    constructor() {
        super();
        this.internals = this.attachInternals();

        this.render();

        const $label = this.$["container"] as Element;
        const $input = this.$input = this.$["input"] as HTMLInputElement;
        this.textField = new MDCTextField($label);

        $input.addEventListener("input", e => {
            this.internals.setFormValue($input.value);
            this.checkValidity();
        });
    }

    attributeChangedCallback(k: string, p: string, c: string) {
        if (inputAttrs.has(k)) {
            if (c === null) {
                this.$input.removeAttribute(k);
            } else {
                this.$input.setAttribute(k, c);
            }
        }

        if (k === "required") {
            const required = c !== null;
            this.internals.ariaRequired = required;
            this.checkValidity();
        } else if (k === "persistent-helper") {
            this.isPersistentHelper = c !== null;
        } else if (k === "helper") {
            this.helperText = c;
        } else if (k === "disabled") {
            this.textField.disabled = c !== null;
        }
    }

    set helperText(text: string) {
        // this.$["helper-text"].innerText = text;
        this.textField.helperTextContent = text;
    }
    set isPersistentHelper(is: boolean) {
        this.$["helper-text"].classList[is ? "add" : "remove"](
            "mdc-text-field-helper-text--persistent"
        );
    }
    set isValidationHelper(is: boolean) {
        this.$["helper-text"].classList[is ? "add" : "remove"](
            "mdc-text-field-helper-text--validation-msg"
        );
    }

    setCustomValidity(msg: string) {
        this.$input.setCustomValidity(msg);
        // FIXME: this is going to break, because if you ever end up
        // setting `validationmessage` like this, then if you come back
        // around to a "normal" validation error, you'll be left with
        // this blank message, wondering where the initial message went.
        this.setAttribute("validationmessage", msg);
    }

    get validity(): ValidityState {
        return this.internals.validity;
    }

    get value() {
        return this.$input.value;
    }

    set value(x: string) {
        this.internals.setFormValue(x);
        this.textField.value = x;
    }

    validityToValidationMessage(validity: ValidityState): string {
        const attr = this.getAttribute("validationmessage");
        if (attr) {
            return attr;
        }

        switch (true) {
            case validity.valueMissing:
                return "Required";
            case validity.badInput:
                return "Bad input";
            case validity.patternMismatch:
                return "Pattern mismatch";
            case validity.rangeOverflow:
            case validity.rangeUnderflow:
                return `Out of range: minimum is ${this.getAttribute("min") || "any"}; maximum is ${this.getAttribute("max") || "any"}`;
            case validity.tooLong:
                return `Too long: maximmum length is ${this.getAttribute("maxlength")}`;
            case validity.tooShort:
                return `Too short: minimumlength is ${this.getAttribute("minlength")}`;
            case validity.typeMismatch:
                return `Type mismatch: expected ${this.getAttribute("type") || "text"}`;
            case validity.stepMismatch:
                return `Step mismatch: can only increment by ${this.getAttribute("step")}`;
            case validity.customError:
                return "Invalid";
            default:
                return ""
        }
    }

    checkValidity(): boolean {
        const valid = this.$input.checkValidity();
        if (!valid) {
            this.internals.setValidity(
                this.$input.validity,
                this.validityToValidationMessage(this.$input.validity),
                this.$input
            );
        } else {
            this.internals.setValidity(this.$input.validity);
            this.setCustomValidity("");
        }
        return valid;
    }

    reportValidity(): boolean {
        // interact with textField to ensure it provides feedback
        if (!this.checkValidity()) {
            this.helperText = this.internals.validationMessage;
            this.isPersistentHelper = true;
            this.isValidationHelper = true;
        } else {
            this.helperText = this.getAttribute("helper") ?? "";
            this.isPersistentHelper = this.hasAttribute("persistent-helper");
            this.isValidationHelper = false;
        }

        return (
            this.textField.valid = this.internals.reportValidity()
        );
    }
}

window.customElements.define("imbu-forms-textfield", TextField);
