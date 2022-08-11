import { web3Accounts, web3Enable, web3FromSource } from "@polkadot/extension-dapp";
import type { InjectedAccountWithMeta, InjectedExtension } from "@polkadot/extension-inject/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import type { DispatchError, DispatchResult, Event, EventRecord } from '@polkadot/types/interfaces';

import { Keyring } from "@polkadot/keyring";
import { stringToHex } from "@polkadot/util";

import * as config from '../config';


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
        const extensions = await enableAppForExtension(config.appName);
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

export const signWeb3Challenge = async (
    account: InjectedAccountWithMeta,
    challenge: string
) => {
    const injector = await web3FromSource(account.meta.source);
    const signRaw = injector.signer.signRaw;

    if (signRaw) {
        const signature = await signRaw({
            address: account.address,
            data: stringToHex(challenge),
            type: "bytes"
        });
        return signature;
    }
}


export function getDispatchError (dispatchError: DispatchError): string {
    let message: string = dispatchError.type;
  
    if (dispatchError.isModule) {
      try {
        const mod = dispatchError.asModule;
        const error = dispatchError.registry.findMetaError(mod);
  
        message = `${error.name}`;
      } catch (error) {
        // swallow
      }
    } else if (dispatchError.isToken) {
      message = `${dispatchError.type}.${dispatchError.asToken.type}`;
    }
  
    return message;
  }