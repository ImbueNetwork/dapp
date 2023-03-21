import * as config from "../config";
import { getCurrentUser } from "../utils";
import { signWeb3Challenge } from "../utils/polkadot";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { SignerResult } from "@polkadot/api/types";

const getAPIHeaders = {
    accept: "application/json",
};

const postAPIHeaders = {
    ...getAPIHeaders,
    "content-type": "application/json",
};

export async function getAccountAndSign(account: InjectedAccountWithMeta) {
    const existingUser = await getCurrentUser();
    const resp = await fetch(`/auth/web3/${account.meta.source}/`, {
        headers: postAPIHeaders,
        method: "post",
        body: JSON.stringify({ account, existing_user: existingUser }),
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

export async function authorise(
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
        // setShowMessageBox(false)
    } else {
        // TODO: UX for 401
    }
}

export const selectAccount = async (account: InjectedAccountWithMeta) => {
    const result = await getAccountAndSign(account);
    await authorise(result?.signature as SignerResult, account);
}
