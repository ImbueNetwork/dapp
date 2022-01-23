import { web3Accounts, web3Enable, web3FromAddress, web3FromSource } from "@polkadot/extension-dapp";
import type { InjectedAccountWithMeta, InjectedExtension } from "@polkadot/extension-inject/types";

import { Keyring } from "@polkadot/keyring";
import { stringToHex } from "@polkadot/util";
import { signatureVerify } from "@polkadot/util-crypto";

import { appName } from '../config';


const sr25519Keyring = new Keyring({type: "sr25519", ss58Format: 2});


export const enableAppForExtension = (
    appName: string,
    attempts: number = 10
): Promise<InjectedExtension[]> => {
    return new Promise(async (resolve, reject) => {
        const extensions = await web3Enable(appName);
        if (!extensions.length) {
            // this.status("Error", web3Error("No extensions found."));
            if (attempts > 0) {
                setTimeout(() => {
                    resolve(enableAppForExtension(
                        appName, attempts - 1
                    ));
                }, 2000);
            } else {
                // this.dismissStatus();
                reject(new Error(
                    "Unable to enable any web3 extension."
                ));
            }
        } else {
            // this.dismissStatus();
            resolve(extensions);
        }
    });
}

export const getWeb3Accounts = async () => {
    try {
        const extensions = await enableAppForExtension(appName);
        if (!extensions.length) {
            console.log("No extensions found.");
            return [];
        } else {
            return web3Accounts();
        }
    } catch (e) {
        console.warn(e);
    }
    return [];
};

export const createWeb3User = async (account: InjectedAccountWithMeta) => {
    const injector = await web3FromSource(account.meta.source);
    const signRaw = injector.signer.signRaw;

    if (signRaw) {
        const signature = await signRaw({
            address: account.address,
            data: stringToHex("test"),
            type: "bytes"
        });
        console.log(signature);
    }
}
