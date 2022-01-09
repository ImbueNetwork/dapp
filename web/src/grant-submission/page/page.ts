import Hoquet from "@pojagi/hoquet/mixin";
import { html, stylesheet } from "@pojagi/hoquet/utils";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import GrantSubmissionForm from "../form/form";
import { appName, webSocketAddr } from "../../config";
import template from "./page.html";
import styles from "./page.css";


const web3Error = (reason: string) => {
    return html`
    <div>
        <p>
            Something went wrong interfacing with web3 extensions:
        </p>
        <p><span class="reason-message">${reason}</span></p>
        <p>
            Make sure that you have the
            <a href="https://polkadot.js.org/extension/" target="_blank">
                Polkadot{.js} extension</a>
            installed, and that you have created an account with an
            IMBU balance sufficient to make transactions.

            <p>
                Refresh the page once you believe the issues have been resolved.
            </p>
        </p>
    </div>
    `;
}

const webSocketError = (addr: string) => {
    return html`
    <div>
        <p>The websocket is not connected to ${addr}.</p>
        <p>This might only be a temporary network error. However, if the
        problem persist, feel free to
            <a href="mailto:help@example.com">contact us</a>.
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
                this.extensions = await this.enableAppForExtension(appName);
            } catch (e) {
                this.status("Error", web3Error((e as Error).toString()));
                console.error(e);
                return;
            } finally {
                this.dismissStatus();
            }
        }

        this.status("Initializing", html`Finding web3 accounts.`);
        const accounts = await web3Accounts();

        const $form = new GrantSubmissionForm(this.api, accounts);

        if (this.$form) {
            this.removeChild(this.$form);
        }

        this.$form = $form;
        this.appendChild(this.$form);

        if (!accounts.length) {
            this.status("Error", web3Error("No accounts found."));
            this.$form.toggleDisabled(true);
            return;
        }

        this.dismissStatus();
        setTimeout(() => this.$form?.$fields[0].focus(), 0);
    }

    enableAppForExtension(
        appName: string,
        attempts: number = 10
    ): Promise<InjectedExtension[]> {
        return new Promise(async (resolve, reject) => {
            const extensions = await web3Enable(appName);
            if (!extensions.length) {
                this.status("Error", web3Error("No extensions found."));
                if (attempts > 0) {
                    setTimeout(() => {
                        resolve(this.enableAppForExtension(
                            appName, attempts - 1
                        ));
                    }, 2000);
                } else {
                    this.dismissStatus();
                    reject(new Error(
                        "Unable to enable any web3 extension."
                    ));
                }
            } else {
                this.dismissStatus();
                resolve(extensions);
            }
        });
    }

    connectedCallback() {
        if (this.rendered)
            return;

        this.render();

        this.status(
            "Connecting to the Imbue Network",
            html`<p>Connecting to websocket at ${this.getAttribute("websocket-addr")}</p>`
        );

        this.addEventListener("imbu:status", e => {
            const detail = (e as CustomEvent).detail;
            this.status(detail.heading, html`${detail.msg}`, detail.dismissable);
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

        if (k === "websocket-addr") {
            const err = webSocketError(curr);
            try {
                const provider = new WsProvider(webSocketAddr);
                provider.on("error", e => {
                    this.status("Connection Error", err)
                });
                provider.on("disconnected", e => {
                    this.status("Disconnected", err);
                });
                provider.on("connected", e => this.dismissStatus());
                ApiPromise.create({provider}).then(api => {
                    this.dismissStatus();
                    this.api = api;
                    this.init();
                }).catch(e => {
                    this.status("Error", err);
                });    
            } catch (e) {
                this.status("Error", html`${e}`);
            }
        } else if (k === "app-name") {
            this.init();
        }
    }
}

window.customElements.define("imbu-grant-submission-page", GrantSubmissionPage);
