import html from "./index.html";
import css from "./index.css";
import "@polkadot/api-augment";
import { ImbueApiInfo, ImbueRequest } from "../dapp";
import * as config from "../config";
import { getDispatchError } from "../utils/polkadot";
import type { ISubmittableResult, ITuple } from "@polkadot/types/types";
import type { DispatchError } from "@polkadot/types/interfaces";

import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { decodeAddress } from "@polkadot/util-crypto/address";
import { web3FromSource } from "@polkadot/extension-dapp";

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
    this.attachShadow({ mode: "open" });

    this[CONTENT] = template.content.cloneNode(true) as DocumentFragment;

    this.$transfer = this[CONTENT].getElementById(
      "transfer"
    ) as HTMLButtonElement;

    this.$transferAmount = this[CONTENT].getElementById(
      "imbu-transfer"
    ) as HTMLInputElement;
  }

  connectedCallback() {
    this.shadowRoot?.appendChild(this[CONTENT]);
    this.bind();
  }

  bind() {
    this.$transfer.addEventListener("click", (e) => {
      this.transferFromRelayChain();
    });
  }

  async transferFromRelayChain(
    event: string = "begin",
    state?: Record<string, any>
  ): Promise<void> {
    const relayApi = this.apiInfo?.relayChain?.api;
    const imbueApi = this.apiInfo?.imbue?.api;
    const transferAmount = BigInt(
      parseFloat(this.$transferAmount.value as string) * 1e12
    );

    if (relayApi && transferAmount > 0) {
      this.$transfer.disabled = true;
      this.$transfer.classList.add("blob");
      this.$transfer.innerText = "Transfering.....";

      this.dispatchEvent(
        new CustomEvent(config.event.accountChoice, {
          bubbles: true,
          composed: true,
          detail: {
            callback: async (account?: InjectedAccountWithMeta) => {
              if (account) {
                const {
                  data: { free: freeBalance },
                } = await relayApi.query.system.account(account.address);
                const userHasEnoughBalance =
                  freeBalance.toBigInt() >= transferAmount;
                if (userHasEnoughBalance) {
                  const dest = {
                    V0: { X1: { Parachain: 2121 } },
                  };
                  const beneficiary = {
                    V1: {
                      parents: 0,
                      interior: {
                        X1: {
                          AccountId32: {
                            network: "Any",
                            id: decodeAddress(account.address),
                          },
                        },
                      },
                    },
                  };

                  const assets = {
                    V1: [
                      {
                        id: {
                          Concrete: {
                            parents: 0,
                            interior: "Here",
                          },
                        },
                        fun: {
                          Fungible: transferAmount,
                        },
                      },
                    ],
                  };

                  const feeAssetItem = 0;

                  const injector = await web3FromSource(account.meta.source);
                  const extrinsic =
                    relayApi?.tx.xcmPallet.reserveTransferAssets(
                      dest,
                      beneficiary,
                      assets,
                      feeAssetItem
                    );

                  try {
                    const txHash = await extrinsic.signAndSend(
                      account.address,
                      { signer: injector.signer },
                      ({ status }) => {
                        imbueApi?.query.system.events((events: any) => {
                          if (events) {
                            // Loop through the Vec<EventRecord>
                            events.forEach((record: any) => {
                              const { event, phase } = record;
                              const currenciesDeposited =
                                `${event.section}.${event.method}` ==
                                "ormlTokens.Deposited";
                              if (currenciesDeposited) {
                                const types = event.typeDef;
                                const accountId = event.data[1];

                                if (accountId == account.address) {
                                  this.$transfer.classList.remove("blob");
                                  this.$transfer.disabled = false;
                                  this.$transfer.classList.add("finalized");
                                  this.$transfer.innerText =
                                    "Transfer Succeeded";
                                }
                              }
                            });
                          }
                        });
                      }
                    );
                  } catch (error: any) {
                    this.errorNotification(error);
                    this.$transfer.classList.remove("blob");
                    this.$transfer.disabled = false;
                    this.$transfer.innerText = "Transfer";
                  }
                } else {
                  const avilableBalance = Number(
                    freeBalance.toBigInt() / BigInt(1e12)
                  );
                  const errorMessage = `Error: Insuffient balance to complete transfer. Available balance is ${avilableBalance.toFixed(
                    2
                  )}`;
                  this.errorNotification(Error(errorMessage));

                  this.$transfer.disabled = false;
                  this.$transfer.classList.remove("blob");
                  this.$transfer.innerText = "Transfer";
                }
              }
            },
          },
        })
      );
    }
  }
  async init(request: ImbueRequest) {
    this.apiInfo = await request.apiInfo;
    return;
  }

  errorNotification(e: Error) {
    console.log(e);
    this.dispatchEvent(
      new CustomEvent(config.event.notification, {
        bubbles: true,
        composed: true,
        detail: {
          title: e.name,
          content: e.message,
          actions: {},
          isDismissable: true,
        },
      })
    );
  }
}

window.customElements.define("imbu-relay", Relay);
