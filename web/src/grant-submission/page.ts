import Hoquet from "@pojagi/hoquet/mixin";
import { html, stylesheet } from "@pojagi/hoquet/utils";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import GrantSubmissionForm from "./form";
import { appName, webSocketAddr } from "../config";
import template from "./page.html";
import styles from "./page.css";


const web3Error = (reason: string) => {
    return `
    <div>
        <p>
            Something went wrong interfacing with web3 extensions:
        </p>
        <p>${reason}</p>
        <p>
            Make sure that you have the
            <a href="https://polkadot.js.org/extension/">
                Polkadot{.js} extension</a>
            installed, and that you have created an account with an
            IMBU balance sufficient to make transactions.
        </p>
    </div>
    `;
}


class GrantSubmissionPage extends Hoquet(HTMLElement, {
    template: html`${template}`,
    stylesheets: [stylesheet`${styles}`],
    shadowy: false,
    attributes: ["app-name", "websocket-addr"]
}) {

    api?: ApiPromise;
    $form?: GrantSubmissionForm;
    extensions?: InjectedExtension[];

    async init() {
        if (!(this.api && this.getAttribute("app-name")))
            return;

        if (!this.extensions) {
            try {
                this.status("Initializing", html`Interfacing with web3 extensions.`);
                this.extensions = await this.enableAppForExtension(appName);
            } catch (e) {
                this.status("Error", html`${web3Error((e as Error).toString())}`)
                console.error(e);
                return;
            } finally {
                this.dismissAlert();
            }
        }

        this.status("Initializing", html`Finding web3 accounts.`);
        const accounts = await web3Accounts();

        const $form = new GrantSubmissionForm(
            this.api, await web3Accounts()
        );

        if (this.$form) {
            this.removeChild(this.$form);
        }

        this.$form = $form;
        this.appendChild(this.$form);

        if (!accounts.length) {
            this.status("Error", html`${web3Error("No accounts found.")}`);
            this.$form.toggleDisabled(true);
            return;
        }

        this.dismissAlert();
        setTimeout(() => this.$form?.$fields[0].focus(), 0);
    }

    enableAppForExtension(
        appName: string,
        attempts: number = 10
    ): Promise<InjectedExtension[]> {
        return new Promise(async (resolve, reject) => {
            const extensions = await web3Enable(appName);
            if (!extensions.length) {
                if (attempts > 0) {
                    setTimeout(() => {
                        resolve(this.enableAppForExtension(
                            appName, attempts - 1
                        ));
                    }, 2000);
                } else {
                    this.dismissAlert();
                    reject(new Error(
                        "Unable to enable any web3 extension."
                    ));
                }
            } else {
                this.dismissAlert();
                resolve(extensions);
            }
        });
    }

    connectedCallback() {
        if (this.rendered)
            return;

        this.render();

        this.addEventListener("imbu:status", e => {
            const detail = (e as CustomEvent).detail;
            this.status(detail.heading, html`${detail.msg}`, detail.dismissable);
        });
    }

    status(heading: string, msg: HTMLTemplateElement, dismissable = false) {
        const $dialog = this.$["imbu-dialog"];

        $dialog.setAttribute("heading", heading);

        while ($dialog.firstChild)
            $dialog.removeChild($dialog.lastChild as Node);

        $dialog.appendChild(msg.content.cloneNode(true));

        if (dismissable) {
            this.$["imbu-dialog"].toggleAttribute("scrimClickAction", !dismissable);
            this.$["imbu-dialog"].toggleAttribute("escapeKeyAction", !dismissable);
        }
        this.$["imbu-dialog"].toggleAttribute("open", true);
    }

    dismissAlert() {
        this.$["imbu-dialog"].toggleAttribute("open", false);
    }

    attributeChangedCallback(k: string, prev: string, curr: string) {
        if (prev === curr)
            return;

        if (k === "websocket-addr") {
            const provider = new WsProvider(webSocketAddr);
            ApiPromise.create({provider}).then(api => {
                this.api = api;
                this.init();
            });
        } else if (k === "app-name") {
            this.init();
        }
    }
}

window.customElements.define("imbu-grant-submission-page", GrantSubmissionPage);
