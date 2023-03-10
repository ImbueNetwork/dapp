import {web3Accounts, web3Enable, web3FromSource} from "@polkadot/extension-dapp";
import type {InjectedAccountWithMeta, InjectedExtension} from "@polkadot/extension-inject/types";
import type {DispatchError} from '@polkadot/types/interfaces';
import {ApiPromise, WsProvider} from "@polkadot/api";
import {Keyring} from "@polkadot/keyring";
import {stringToHex} from "@polkadot/util";
import * as config from "../config";
export const imbueNetwork = "Imbue Network";


const sr25519Keyring = new Keyring({type: "sr25519", ss58Format: 2});


export type PolkadotJsApiInfo = {
    api: ApiPromise;
    provider: WsProvider;
    webSockAddr: string;
}

export type ImbueApiInfo = {
    imbue: PolkadotJsApiInfo;
    relayChain: PolkadotJsApiInfo;
}

export const initImbueAPIInfo = async () => {
    showLoading();
    const {imbueNetworkWebsockAddr, relayChainWebsockAddr} = (await fetch(`${config.apiBase}/info`).then(
        resp => resp.json()
    ));
    const imbueApi = await initPolkadotJSAPI(imbueNetworkWebsockAddr);
    const relayChainApi = await initPolkadotJSAPI(relayChainWebsockAddr)
    hideLoading();
    return {
        imbue: imbueApi,
        relayChain: relayChainApi
    }
};

function showLoading(): void {
    const modal = document.getElementById('modal');
    const loading = document.getElementById('loading');

    if(modal && loading) {
        loading.hidden = false;
        modal.classList.add("show");
    }
}

function hideLoading(): void {
    const modal = document.getElementById('modal');
    const loading = document.getElementById('loading');

    if(modal && loading) {
        loading.hidden = true;
        modal.classList.remove("show");
    }

}

async function initPolkadotJSAPI(webSockAddr: string): Promise<PolkadotJsApiInfo> {
    const provider = new WsProvider(webSockAddr);
    provider.on("error", e => {
        errorNotification(e);
        console.log(e);
    });

    provider.on("disconnected", e => {
        console.log(e);
    });

    provider.on("connected", e => {
        console.log("Polkadot JS connected", e);
    });

    try {
        const api = await ApiPromise.create({provider});
        await api.isReady;

        return {
            api,
            provider,
            webSockAddr,
        }
    } catch (e) {
        const cause = e as Error;

        throw new Error(
            "Unable to initialize PolkadotJS API"
        );
    }
}

export function errorNotification(e: Error) {
    dispatchEvent(new CustomEvent(
        config.event.notification,
        {
            bubbles: true,
            composed: true,
            detail: {
                title: e.name,
                content: e.message,
                actions: {},
                isDismissable: true,
            }
        }
    ));
}

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
        const extensions = await enableAppForExtension(imbueNetwork);
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


export function getDispatchError(dispatchError: DispatchError): string {
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
