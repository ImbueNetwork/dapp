import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { useRef, useState, useEffect } from "react";

import { Dialogue } from "./components/dialogue";
import { AccountChoice } from "./components/accountChoice";
import { User } from "./models";
import { signWeb3Challenge } from "./utils/polkadot";
import { fetchUserOrEmail } from "./utils";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { SignerResult } from "@polkadot/api/types";
import { TextField } from "@rmwc/textfield";
import '@rmwc/textfield/styles';
import * as config from "./config";
import bcrypt from 'bcryptjs'
import "../../public/registration.css"
import * as utils from "./utils"

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
    userOrEmail?: string
    password?: string
  },
  errorMessage?: string
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
    await utils.redirectBack();
  } else {
    // TODO: UX for 401
  }
}

export const Login = ({ }: LoginProps): JSX.Element => {

  const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
  const [userOrEmail, setUserOrEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const imbueLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    setErrorMessage(undefined);
    event.preventDefault();

    const resp = await fetch(`/auth/imbue/`, {
      headers: postAPIHeaders,
      method: "post",
      body: JSON.stringify({
        userOrEmail,
        password,
      }),
    });

    if (resp.ok) {
      await utils.redirectBack();
    } else {
      setErrorMessage("incorrect username or password");
    }
  }

  const selectAccount = async (account: InjectedAccountWithMeta) => {
    const result = await getAccountAndSign(account);
    await authorise(result?.signature as SignerResult, account);
  }

  return (
    polkadotAccountsVisible ? <AccountChoice
      accountSelected={(account: InjectedAccountWithMeta) => selectAccount(account)}
    /> :
      <Dialogue
        title="You must be signed in to continue"
        content={<p>Please use the link below to sign in.</p>}

        actionList={
          <div >
            <form id="contribution-submission-form" name="contribution-submission-form" method="get" onSubmit={imbueLogin}>

              <div className="login">
                <div>
                  <TextField
                    label="Email/Username"
                    onChange={(e: any) => setUserOrEmail(e.target.value)}
                    outlined className="mdc-text-field" required />
                </div>
                <div>
                  <TextField
                    label="Password"
                    onChange={(e: any) => setPassword(e.target.value)}
                    type="password"
                    outlined className="mdc-text-field" required />
                </div>

                <div>
                  <span className={!errorMessage ? "hide" : "error"}>{errorMessage}</span>
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

                <div>
                  <span>Don't have an account?</span><a href="#" onClick={() => utils.redirect("join",)} className="signup">Sign up</a>
                  <span
                    onClick={() => showPolkadotAccounts(true)}
                    className="mdc-deprecated-list-item__text"
                  >
                  </span>
                </div>
              </div>

            </form>
            <li
              className="mdc-deprecated-list-item"
              tabIndex={0}
              data-mdc-dialog-action="web3"
            >
              <span onClick={() => showPolkadotAccounts(true)}
                className="mdc-deprecated-list-item__graphic">
                <img
                  src="https://avatars.githubusercontent.com/u/33775474?s=200&amp;amp;v=4"
                  style={{ maxWidth: "100%" }}

                />
              </span>
              <span
                onClick={() => showPolkadotAccounts(true)}
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

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOMClient.createRoot(document.getElementById("content-root")!).render(
    <Login />
  );
});
