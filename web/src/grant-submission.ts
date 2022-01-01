import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { Hash } from "@polkadot/types/interfaces";
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';

import { appName, webSocketAddr } from "./config";


const provider: WsProvider = new WsProvider(webSocketAddr);
let api: Promise<ApiPromise> = ApiPromise.create({provider});
let extensions = [];
let attempts = 10;

const $grantSubmissionForm =
    document.getElementById("wf-form-Contact-Form") as HTMLFormElement;
const $milestonesList = document.getElementById("milestones") as HTMLOListElement;
const $milestoneItemTemplate = document.createElement("template");
const $addMilestoneBtn =
    $milestonesList.firstChild?.removeChild(
        document.getElementById("add-milestone") as HTMLElement
    ) as HTMLAnchorElement;
$milestoneItemTemplate.content.appendChild($milestonesList.firstChild as HTMLElement);

const addMilestoneItem = () => {
    const milestonesLength = $milestonesList.children.length;
    const $li = $milestoneItemTemplate.content.cloneNode(true).firstChild as HTMLLIElement;
    Array.from($li.querySelectorAll("input")).forEach($input => {
        $input.name = $input.id = `${$input.id}-${milestonesLength}`;
    });

    $li.appendChild($addMilestoneBtn);
    if (milestonesLength) {
        const $hr = document.createElement("hr");
        $hr.style.width = "95%";
        $hr.style.border = "1px 0 0 0";
        $hr.style.borderColor = "#555";
        $hr.setAttribute("size", "1");
        $hr.setAttribute("noshade", "");
        $milestonesList.appendChild($hr);
    }
    $milestonesList.appendChild($li);
};

$addMilestoneBtn.addEventListener("click", addMilestoneItem);
addMilestoneItem();
// #14093e

type Milestone = {
    "name": string,
    "percentageToUnlock": number,
}

$grantSubmissionForm.addEventListener("submit", async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!extensions.length)
        throw new Error("No web3 extension.");
    
    const formData = new FormData($grantSubmissionForm);
    const milestones: Milestone[] = [];
    Array.from(formData.keys())
        .filter(key => key.startsWith("milestone-"))
        .forEach(key => {
            const parts = key.split("-");
            const idx = parseInt(parts.pop() as string);
            milestones[idx] = milestones[idx] ?? {};

            if (parts[1] === "percent") {
                milestones[idx]["percentageToUnlock"] = parseInt(formData.get(key) as string);
            } else {
                milestones[idx]["name"] = formData.get(key) as string;
            }
        });

    // let $firstMilestonePercent = Array.from($grantSubmissionForm.elements)
    //     .filter(x => x.id.startsWith("milestone-percent"))[0] as HTMLInputElement;

    // TODO: `checkValidity` on keyup or something like that
    // let total = 0;
    // for (let milestone of milestones) {
    //     total += milestone.percentageToUnlock;
    // }

    // if (total > 100) {
    //     $firstMilestonePercent.setCustomValidity(
    //         "Aggregate \"percent to unlock\" cannot exceed 100 percent.");
    //     return;
    // }

    // if (total !== 100) {
    //     $firstMilestonePercent.setCustomValidity(
    //         "Aggregate \"percent to unlock\" must equal exactly 100 percent.");
    //     return;
    // }

    // For now just using the first account we find.
    const allAccounts = await web3Accounts();
    const account = allAccounts[0];
    const injector = await web3FromSource(account.meta.source);
    const extrinsic = (await api).tx.imbueProposals.createProject(
        formData.get("name"),
        formData.get("logo"),
        formData.get("project-description"),
        formData.get("contact"),
        milestones, // milestones
        formData.get("required-funds"),
    );

    try {
        const txHash = await extrinsic.signAndSend(
            account.address,
            {signer: injector.signer},
            ({ status }) => {
                if (status.isInBlock) {
                    console.log(`Completed at block hash #${status.asInBlock.toString()}`);
                    $grantSubmissionForm.reset();
                } else {
                    console.log(`Current status: ${status.type}`);
                }
            }
        );
        console.log(`Transaction hash: ${txHash}`);
    } catch (e: any) {
        console.error("Transaction failed...", e);
    }

    console.log("debug", {allAccounts, account, injector, extrinsic});

});

(async function enableExtension() {
    window.extensions = extensions = await web3Enable(appName);
    if (!extensions.length) {
        if (attempts--) {
            setTimeout(() => {
                enableExtension();
            }, 2000);
        } else {
            throw new Error("Unable to enable any web3 extension.");
        }
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

window.$form = $grantSubmissionForm;
