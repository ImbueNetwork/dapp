import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { useRef, useState, useEffect } from "react";

import { Dialogue } from "./components/dialogue";
import { AccountChoice } from "./components/accountChoice";

import { signWeb3Challenge } from "./utils/polkadot";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { SignerResult } from "@polkadot/api/types";
import { TextField } from "@rmwc/textfield";
import '@rmwc/textfield/styles';

import "../../public/registration.css"
const getAPIHeaders = {
  accept: "application/json",
};

const postAPIHeaders = {
  ...getAPIHeaders,
  "content-type": "application/json",
};



type LoginProps = {};
type LoginState = {
  showPolkadotAccounts: boolean;
  creds: {
    username?: string
    password?: string
  }
};

async function getAccountAndSign(account: InjectedAccountWithMeta) {
  const resp = await fetch(`/auth/web3/${account.meta.source}/`, {
    headers: postAPIHeaders,
    method: "post",
    body: JSON.stringify(account),
  });

  if (resp.ok) {
    // could be 200 or 201
    const { user, web3Account } = await resp.json();
    const signature = await signWeb3Challenge(account, web3Account.challenge);

    if (signature) {
      return { signature, user };
    } else {
      // TODO: UX for no way to sign challenge?
    }
  }
}

async function authorise(
  signature: SignerResult,
  account: InjectedAccountWithMeta
) {
  const resp = await fetch(`/auth/web3/${account.meta.source}/callback`, {
    headers: postAPIHeaders,
    method: "post",
    body: JSON.stringify({
      signature: signature.signature,
      address: account.address,
    }),
  });

  if (resp.ok) {
    const redirect =
      new URLSearchParams(window.location.search).get("redirect") || "/dapp";
    const isRelative =
      new URL(document.baseURI).origin ===
      new URL(redirect, document.baseURI).origin;
    if (isRelative) {
      location.replace(redirect);
    } else {
      location.replace("/dapp");
    }
  } else {
    // TODO: UX for 401
  }
}


class Login extends React.Component<LoginProps, LoginState> {

  state: LoginState = {
    showPolkadotAccounts: false,
    creds: {
      username: undefined,
      password: undefined
    }
  };

  async clicked() {
    this.setState({ showPolkadotAccounts: true });
  }


  async setCreds(name: string, value: string) {
    this.setState({
      ...this.state,
      creds: {
        ...this.state.creds,
        [name]: value,
      },
    });
  }




  imbueLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(this.state.creds.username);
    console.log(this.state.creds.password);
    console.log("***** login in clicked");
  }


  async accountSelected(account: InjectedAccountWithMeta) {
    const result = await getAccountAndSign(account);
    await authorise(result?.signature as SignerResult, account);
  }

  render() {
    if (this.state.showPolkadotAccounts) {
      return (
        <AccountChoice
          accountSelected={(account: InjectedAccountWithMeta) =>
            this.accountSelected(account)
          }
        />
      );
    } else {
      return (
        <Dialogue
          title="You must be signed in to continue"
          content={<p>Please use the link below to sign in.</p>}

          actionList={
            <div >
              <form id="contribution-submission-form" name="contribution-submission-form" method="get" onSubmit={this.imbueLogin}>

                <div className="login">
                  <div>
                    <TextField
                      label="Email/Username"
                      onChange={(e: any) => this.setCreds("username", e.target.value)}
                      outlined className="mdc-text-field" required />
                  </div>
                  <div>
                    <TextField
                      label="Password"
                      onChange={(e: any) => this.setCreds("password", e.target.value)}
                      type="password"
                      outlined className="mdc-text-field" required />
                  </div>

                  <div>
                    <button
                      type="submit"
                      // disabled={!this.state.creds.username && !this.state.creds.password}
                      className="primary-btn in-dark confirm"
                      id="sign-in">
                      Sign In
                    </button>
                  </div>
                </div>

              </form>
              <li
                className="mdc-deprecated-list-item"
                tabIndex={0}
                data-mdc-dialog-action="web3"
              >
                <span className="mdc-deprecated-list-item__graphic">
                  <img
                    src="https://avatars.githubusercontent.com/u/33775474?s=200&amp;amp;v=4"
                    style={{ maxWidth: "100%" }}
                  />
                </span>
                <span
                  onClick={() => this.clicked()}
                  className="mdc-deprecated-list-item__text"
                >
                  {"Sign in with your polkadot{.js} extension"}
                </span>
              </li>
            </div>
          }
        />
      );
    }
  }
}

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOMClient.createRoot(document.getElementById("content-root")!).render(
    <Login />
  );
});
