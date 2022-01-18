import Hoquet from "@pojagi/hoquet/mixin";
import { html, stylesheet } from "@pojagi/hoquet/utils";
// import { MDCList } from '@material/list';

import GrantSubmissionForm from "../form/form";

import template from "./page.html";
import styles from "./page.css";
import AuthDialog from "../../auth-dialog/auth-dialog";
import "../../auth-dialog/auth-dialog";


class GrantSubmissionPage extends Hoquet(HTMLElement, {
    template: html`${template}`,
    stylesheets: [stylesheet`${styles}`],
    shadowy: false,
    attributes: ["app-name", "api-base"]
}) {

    $form?: GrantSubmissionForm;

    async init() {
        const $form = new GrantSubmissionForm();

        if (this.$form) {
            this.removeChild(this.$form);
        }

        this.$form = $form;
        this.appendChild(this.$form);

        setTimeout(() => this.$form?.$fields[0].focus(), 0);

        const apiBase = this.getAttribute("api-base");
        
        if (apiBase) {
            $form.setAttribute("api-base", apiBase);

            // fetch session authentication status
            const resp = await fetch(`${this.getAttribute("api-base")}/user`);
            
            if (resp.ok) {
                $form.usr = await resp.json();
            }
            return;
        }
    }

    connectedCallback() {
        if (this.rendered)
            return;

        this.render();

        console.log(this.$["auth-dialog"]);


        this.addEventListener("imbu:status", e => {
            const detail = (e as CustomEvent).detail;
            this.status(detail.heading, html`${detail.msg}`, detail.dismissable);
        });

        this.addEventListener("imbu:auth-login-required", e => {
            (this.$["auth-dialog"] as AuthDialog).open();
        });
    }

    status(heading: string, msg: HTMLTemplateElement, dismissable = false) {
        const dialogActions = ["escapeKey", "scrimClick"];
        const $dialog = this.$["imbu-dialog"];

        $dialog.setAttribute("heading", heading);

        while ($dialog.firstChild)
            $dialog.removeChild($dialog.lastChild as Node);

        $dialog.appendChild(msg.content.cloneNode(true));

        if (dismissable) {
            dialogActions.forEach(type => {
                $dialog.removeAttribute(`${type}Action`);    
            });
        } else {
            dialogActions.forEach(type => {
                $dialog.toggleAttribute(`${type}Action`, true);
            });
        }
        
        this.$["imbu-dialog"].toggleAttribute("open", true);
    }

    dismissStatus() {
        this.$["imbu-dialog"].toggleAttribute("open", false);
    }

    attributeChangedCallback(k: string, prev: string, curr: string) {
        if (prev === curr)
            return;

        if (k === "api-base") {
            this.init();
        }
    }
}

window.customElements.define("imbu-grant-submission-page", GrantSubmissionPage);
