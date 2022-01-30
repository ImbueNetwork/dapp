import "./form/form";
import rootStyles from "/src/common.css";

document.head.appendChild(document.createRange().createContextualFragment(`
<link rel="stylesheet" href="https://unpkg.com/material-components-web@13.0.0/dist/material-components-web.min.css">
<link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
<style>${rootStyles}</style>
`));

const $oldForm = document.getElementById("wf-form-Contact-Form") as Node;
const $parent = $oldForm.parentElement as Element;

$parent.removeChild($oldForm);
$parent.appendChild(document.createRange().createContextualFragment(`
<imbu-grant-submission-form></imbu-grant-submission-form>
`));


// import { ApiPromise, WsProvider } from "@polkadot/api";
// import { Keyring } from "@polkadot/keyring";
// import type { KeyringPair } from "@polkadot/keyring/types";
// import type { Hash } from "@polkadot/types/interfaces";
// import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
// import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
// import GrantSubmissionForm from "./grant-submission/form";
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


// declare global {
//     interface Window {
//         api: ApiPromise;
//         $form: HTMLFormElement;
//         extensions: any[];
//     }
// }
