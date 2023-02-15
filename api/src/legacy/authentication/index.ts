import "@pojagi/hoquet/lib/dialog/dialog";
import Dialog, { ActionConfig } from "@pojagi/hoquet/lib/dialog/dialog";

import { SignerResult } from "@polkadot/api/types";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import * as config from "../config";
import { User } from "../model";
import { signWeb3Challenge } from "../utils/polkadot";

import authDialogContent from "./auth-dialog-content.html";
import authDialogOptions from "./auth-dialog-options.html";


type AuthenticationDialogOptions = {
    title?: string,
    content?: string;
    callback?: CallableFunction;
    actions?: Record<string,ActionConfig>,
}


export default class Authentication extends HTMLElement {

    user?: User;

    launchAuthDialog(opts?: AuthenticationDialogOptions) {
        const callback = opts?.callback || (() => {});
        const content = opts?.content || authDialogContent;
        const title = opts?.title || "You must be signed in to continue";

        this.dispatchEvent(new CustomEvent(
            config.event.notification,
            {
                bubbles: true,
                composed: true,
                detail: {
                    title,
                    content: `${content}${authDialogOptions}`,
                    actions: {
                        web3: {
                            handler: () =>
                                this.web3AuthWorkflow("begin", {callback}),
                        },
                        ...opts?.actions,
                    },
                    isDismissable: false,
                }
            }
        ));
    }

    async web3AuthWorkflow(
        event: string = "begin",
        state?: Record<string, any>
    ): Promise<void> {
        switch(event) {
        case "done":
        {
            const callback = state?.callback;
            if (callback instanceof Function) {
                callback(state);
            }
        } break;
        case "signed":
        {
            // post to callback
            const signature = state?.signature as
                SignerResult;
            const account = state?.account as
                InjectedAccountWithMeta;
            const user = state?.user as
                User;

            const resp = await fetch(
                `/auth/web3/${account.meta.source}/callback`,
                {
                    headers: config.postAPIHeaders,
                    method: "post",
                    body: JSON.stringify({
                        signature: signature.signature,
                        address: account.address,
                    })
                }
            );
            if (resp.ok) {
                // authenticated. Set user.
                this.user = user;
                return this.web3AuthWorkflow("done", state);
            } else {
                // TODO: UX for 401
            }
        } break;
        case "account-chosen":
        {
            const account = state?.account as
                InjectedAccountWithMeta;

            const resp = await fetch(
                `/auth/web3/${account.meta.source}/`,
                {
                    headers: config.postAPIHeaders,
                    method: "post",
                    body: JSON.stringify(account)
                }
            );

            if (resp.ok) {
                // could be 200 or 201
                const { user, web3Account } = await resp.json();
                const signature = await signWeb3Challenge(
                    account, web3Account.challenge
                );
                if (signature) {
                    return this.web3AuthWorkflow(
                        "signed",
                        {...state, signature, user}
                    );
                } else {
                    // TODO: UX for no way to sign challenge?
                }
            }
        } break;
        case "begin":
        {
            this.dispatchEvent(new CustomEvent(
                config.event.accountChoice,
                {
                    bubbles: true,
                    composed: true,
                    detail: {
                        callback: (account?: InjectedAccountWithMeta) => {
                            if (account) {
                                this.web3AuthWorkflow(
                                    "account-chosen",
                                    {...state, account},
                                );
                            }
                        }
                    }
                }
            ));
        } break;
        default:
            console.warn(`Invalid web3AuthWorkflow event: ${event}`);
        }
    }
}

window.customElements.define("imbu-authentication", Authentication);
