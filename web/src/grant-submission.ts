import { ApiPromise, WsProvider } from "@polkadot/api";
// import { Keyring } from "@polkadot/keyring";
// import type { KeyringPair } from "@polkadot/keyring/types";
// import type { Hash } from "@polkadot/types/interfaces";
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import GrantSubmissionForm from "./grant-submission/form";

import { appName, webSocketAddr } from "./config";


const provider: WsProvider = new WsProvider(webSocketAddr);
let api: Promise<ApiPromise> = ApiPromise.create({provider});
let attempts = 10;

const renderForm = (
    $parent: Element,
    api: ApiPromise,
    accounts: InjectedAccountWithMeta[]
) => {
    const $grantSubmissionForm = new GrantSubmissionForm(api, accounts);
    const $child = $parent.firstElementChild;

    if ($child) {
        $parent?.replaceChild($grantSubmissionForm, $child);
    } else {
        $parent.appendChild($grantSubmissionForm)
    }
};

(async function enableExtension() {
    const extensions = await web3Enable(appName);
    if (!extensions.length) {
        if (attempts--) {
            setTimeout(() => {
                enableExtension();
            }, 2000);
        } else {
            throw new Error("Unable to enable any web3 extension.");
        }
    } else {
        // For right now, we're just replacing the existing form, but in the near future
        // we should just use an empty webflow page that has a root element with an `id`,
        // and append to that instead.
        const $oldForm =
            document.getElementById("wf-form-Contact-Form") as Node;
        const $parent = $oldForm.parentElement as Element;

        $parent.addEventListener(
            "imbu:grant-submission-form:done",
            async _ => renderForm($parent, await api, await web3Accounts())
        );

        renderForm($parent, await api, await web3Accounts());
    }
})();

// (async (): Promise<void> => {

//     // const keyring: Keyring = new Keyring({type: "sr25519"});
//     // const alice: KeyringPair = keyring.addFromUri("//Alice", {name: "Alice default"});
//     // const txHash: Hash = await api.tx.imbueProposals.createProject(
//     //     "Pojagi",
//     //     "https://upload.wikimedia.org/wikipedia/commons/7/70/Example.png",
//     //     "Language learning application",
//     //     "https://pojagi.org",
//     //     [],
//     //     123456789
//     // ).signAndSend(alice);
//     // console.log("`createProject` called; resulting txHash:", txHash);


//     // if (!extensions.length)
//     //     return;

//     // const allAccounts = await web3Accounts();
//     // const account = allAccounts[0];
//     // const injector = await web3FromSource(account.meta.source);
//     // const extrinsic = api.tx.imbueProposals.createProject(
//     //     "Pojagi",
//     //     "https://upload.wikimedia.org/wikipedia/commons/7/70/Example.png",
//     //     "Language learning application",
//     //     "https://pojagi.org",
//     //     [],
//     //     123456789
//     // );

//     // console.log("debug", {allAccounts, account, injector, extrinsic});

//     // try {
//     //     const txHash = await extrinsic.signAndSend(
//     //         account.address,
//     //         {signer: injector.signer},
//     //         ({ status }) => {
//     //             if (status.isInBlock) {
//     //                 console.log(`Completed at block hash #${status.asInBlock.toString()}`);
//     //             } else {
//     //                 console.log(`Current status: ${status.type}`);
//     //             }
//     //         }
//     //     );
//     // } catch (e: any) {
//     //     console.error("Transaction failed...", e);
//     // }

// })();


declare global {
    interface Window {
        api: ApiPromise;
        $form: HTMLFormElement;
        extensions: any[];
    }
}

(async () => {
    window.api = await api;
})();

// window.$form = $grantSubmissionForm;
