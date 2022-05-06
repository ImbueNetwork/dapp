import html from "./index.html";
import css from "./index.css";

import {ImbueApiInfo, ImbueRequest} from "../dapp";
import * as config from "../config";

import {InjectedAccountWithMeta} from "@polkadot/extension-inject/types";
import {decodeAddress} from "@polkadot/util-crypto/address"
import {web3FromSource} from "@polkadot/extension-dapp";

const template = document.createElement("template");
template.innerHTML = `
<style>${css}</style>
${html}
`;

const CONTENT = Symbol();

export default class Relay extends HTMLElement {
    apiInfo?: ImbueApiInfo | undefined;

    private [CONTENT]: DocumentFragment;

    $transfer: HTMLButtonElement;
    $transferAmount: HTMLInputElement;

    constructor() {
        super();
        this.attachShadow({mode: "open"});

        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$transfer =
            this[CONTENT].getElementById("transfer") as
                HTMLButtonElement;

        this.$transferAmount =
            this[CONTENT].getElementById("imbu-transfer") as
                HTMLInputElement;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
        this.bind();
    }

    bind() {
        this.$transfer.addEventListener("click", e => {
            const api = this.apiInfo?.relayChain?.api;
            const amount = parseInt(this.$transferAmount.value as string) * 1e12;

            if (api && amount > 0) {
                this.dispatchEvent(new CustomEvent(
                    config.event.accountChoice,
                    {
                        bubbles: true,
                        composed: true,
                        detail: async (account?: InjectedAccountWithMeta) => {
                            if (account) {
                                const dest = {V0: {X1: {Parachain: 2102}}};

                                const beneficiary = {
                                    V1: {
                                        parents: 0,
                                        interior: {
                                            X1: {
                                                AccountId32: {
                                                    network: "Any",
                                                    id: decodeAddress(account.address)
                                                }
                                            }
                                        }
                                    }
                                };

                                const assets = {
                                    V1: [{
                                        id: {Concrete: {parents: 0, interior: "Here"}},
                                        fun: {Fungible: amount}
                                    }]
                                };

                                const feeAssetItem = 0;

                                const injector = await web3FromSource(account.meta.source);
                                const extrinsic = api?.tx.xcmPallet.reserveTransferAssets(dest, beneficiary, assets, feeAssetItem);
                                const txHash = await extrinsic.signAndSend(
                                    account.address,
                                    {signer: injector.signer},
                                    ({status}) => {
                                        console.log(status);
                                    });

                                console.log(txHash);
                            }
                        }
                    }
                ));
            }
        });
    }

    async init(request: ImbueRequest) {
        this.apiInfo = await request.apiInfo;
        return;
    }
}

window.customElements.define("imbu-relay", Relay);
