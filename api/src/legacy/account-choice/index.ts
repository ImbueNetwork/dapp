import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { getWeb3Accounts } from '../utils/polkadot';

import * as config from "../config";


export default class Choice extends HTMLElement {
    accounts: InjectedAccountWithMeta[] = [];

    constructor() {
        super();
        this.init();
    }

    async init() {
        this.accounts = await getWeb3Accounts();
    }

    dispatchNotification(title: string, content: string, actions: any) {
        this.dispatchEvent(new CustomEvent(
            config.event.notification,
            {
                bubbles: true,
                composed: true,
                detail: {
                    title,
                    content,
                    actions,
                    isDismissable: true,
                }
            }
        ));
    }

    accountChoice(address: string | null) {
        const accountActionEntry = (resolve: CallableFunction) => (
            account: InjectedAccountWithMeta,
        ) => [
            account.address,
            {
                label: `${
                    account.meta.name
                } (${account.meta.source})`,
                isPrimary: true,
                handler: () => {
                    resolve(account);
                }
            }
        ];

        return new Promise((resolve, _reject) => {
            // Did we get a specific address passed in?
            if (address) {
                const account = this.accounts.find(_ => _.address === address);
                if (account) {
                    resolve(account);
                } else {
                    resolve(void 0);
                }
            } else if (!this.accounts.length) {
                this.dispatchNotification(
                    "No accounts found",
                    "",
                    {
                        dismiss: {
                            label: "Okay"
                        }
                    }
                );
                resolve(void 0);
            } else if (this.accounts.length === 1) {
                resolve(this.accounts[0]);
            } else {
                this.dispatchNotification(
                    "Choose the account you would like to use",
                    "",
                    {
                        ...Object.fromEntries(this.accounts.map(
                            accountActionEntry(resolve)
                        )),
                        cancel: {label: "Cancel"}
                    }
                );
            }
        });
    }
}

window.customElements.define("imbu-account-choice", Choice);
