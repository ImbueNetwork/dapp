import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';

import {Dialogue} from './components/dialogue';
import {getWeb3Accounts, signWeb3Challenge} from "./utils/polkadot";
import {InjectedAccountWithMeta} from "@polkadot/extension-inject/types";
import { SignerResult } from "@polkadot/api/types";

const getAPIHeaders = {
    "accept": "application/json",
};

const postAPIHeaders = {
    ...getAPIHeaders,
    "content-type": "application/json",
};

type LoginProps = {}
type LoginState = {
    showPolkadotAccounts: Boolean,
    accounts: InjectedAccountWithMeta[]
}

async function getAccountAndSign (account: InjectedAccountWithMeta) {
    const resp = await fetch(
        `/auth/web3/${account.meta.source}/`,
        {
            headers: postAPIHeaders,
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
            return {signature, user};
        } else {
            // TODO: UX for no way to sign challenge?
        }
    }
}

async function authorise(signature: SignerResult, account: InjectedAccountWithMeta) {
    const resp = await fetch(
        `/auth/web3/${account.meta.source}/callback`,
        {
            headers: postAPIHeaders,
            method: "post",
            body: JSON.stringify({
                signature: signature.signature,
                address: account.address,
            })
        }
    );

    if (resp.ok) {
        const redirect = new URLSearchParams(window.location.search).get("redirect") || "/dapp"
        const isRelative = new URL(document.baseURI).origin === new URL(redirect, document.baseURI).origin;
        if (isRelative) {
            location.replace(redirect);
        }
        else {
            location.replace("/dapp");
        }
    } else {
        // TODO: UX for 401
    }
}

class Login extends React.Component<LoginProps, LoginState> {
    state: LoginState = {
        showPolkadotAccounts: false,
        accounts: []
    }

    async clicked() {
        const accounts = await getWeb3Accounts();
        this.setState({showPolkadotAccounts: true, accounts});
    }

    async accountSelected(account: InjectedAccountWithMeta) {
        const result = await getAccountAndSign(account);
        await authorise(result?.signature as SignerResult, account)
    }

    render() {
        if (this.state.showPolkadotAccounts) {
            return (
                <Dialogue title="Choose the account you would like to use"
                          actionList={
                              <>
                                  {this.state.accounts.map((account, index) => {
                                      const {address, meta: {name, source}} = account;
                                      return <li className="button-container" key={index}>
                                          <button className="primary" onClick={() => this.accountSelected(account)}>
                                              {`${name} (${source})`}
                                          </button>
                                      </li>
                                  })}
                              </>
                          }/>
            );
        } else {
            return (
                <Dialogue title="You must be signed in to continue" content={
                    <p>Please use the link below to sign in.</p>
                } actionList={
                    <li className="mdc-deprecated-list-item" tabIndex={0} data-mdc-dialog-action="web3">
                    <span className="mdc-deprecated-list-item__graphic">
                        <img src="https://avatars.githubusercontent.com/u/33775474?s=200&amp;amp;v=4"
                             style={{maxWidth: "100%"}}/>
                    </span>
                        <span onClick={() => this.clicked()}
                              className="mdc-deprecated-list-item__text">{"Sign in with your polkadot{.js} extension"}</span>
                    </li>
                }/>
            );
        }
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    ReactDOMClient.createRoot(document.getElementById('content-root')!)
        .render(<Login/>);
});