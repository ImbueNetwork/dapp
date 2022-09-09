import { ImbueApiInfo, initImbueAPIInfo } from "../utils/polkadot";
import * as React from 'react';
import { TextField } from "@rmwc/textfield";
import '@rmwc/textfield/styles';
import * as polkadot from "../utils/polkadot";
import { BasicTxResponse, Currency, User } from "../models";
import { web3FromSource } from "@polkadot/extension-dapp";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { DispatchError } from '@polkadot/types/interfaces';
import type { ITuple, } from "@polkadot/types/types";
import { SubmittableExtrinsic } from "@polkadot/api/types";


type EventDetails = {
    accountIdKey: number,
    eventName: string
}

const eventMapping: Record<string, EventDetails> = {
    "contribute": { accountIdKey: 0, eventName: "ContributeSucceeded" },
}

class ChainService {
    imbueApi: ImbueApiInfo;
    constructor(imbueApi: ImbueApiInfo) {
        this.imbueApi = imbueApi;
    }

    public async contribute(account: InjectedAccountWithMeta, projectOnChain: any, contribution: bigint): Promise<BasicTxResponse> {
        const projectId = projectOnChain.milestones[0].projectKey;
        const extrinsic = await this.imbueApi.imbue.api.tx.imbueProposals.contribute(
            projectId,
            contribution
        );
        return await this.submitImbueExtrinsic(account, extrinsic, eventMapping["contribute"].accountIdKey, eventMapping["contribute"].eventName);
    }


    async submitImbueExtrinsic(account: InjectedAccountWithMeta, extrinsic: SubmittableExtrinsic<'promise'>, eventKey: number, eventName: String): Promise<BasicTxResponse> {
        const injector = await web3FromSource(account.meta.source);
        const transactionState: BasicTxResponse = {};
        try {
            // Make a transfer from Alice to BOB, waiting for inclusion
            const unsubscribe = await extrinsic
                .signAndSend(
                    account.address,
                    { signer: injector.signer }, (result) => {
                        this.imbueApi.imbue.api.query.system.events((events: any) => {
                            if (!result || !result.status || !events) {
                                return;
                            }

                            events
                                .filter(({ event }) =>  event.section === 'imbueProposals' || event.section === 'system' )
                                .forEach(({ event }): BasicTxResponse => {
                                    transactionState.transactionHash = extrinsic.hash.toHex();

                                    const [dispatchError] = event.data as unknown as ITuple<[DispatchError]>;
                                    if (dispatchError.isModule) {
                                       return this.handleError(transactionState, dispatchError);
                                    }

                                    if (eventName && event.method === eventName && event.data[eventKey].toHuman() === account.address) {
                                        transactionState.status = true;
                                        return transactionState;
                                    }
                                    else if (event.method === 'ExtrinsicFailed') {
                                        transactionState.status = false;
                                        transactionState.txError = true;
                                        return transactionState;
                                    }
                                    return transactionState;
                                });


                            if (result.isError) {
                                transactionState.txError = true;
                                return transactionState;
                            }

                            if (result.isCompleted) {
                                unsubscribe();
                                return transactionState;
                            }
                        });
                    });
        } catch (error) {
            transactionState.txError = true;
            transactionState.errorMessage = error.message;
            return transactionState;
        }
        return transactionState;
    }

    async submitExtrinsic(account: InjectedAccountWithMeta, extrinsic: SubmittableExtrinsic<'promise'>): Promise<BasicTxResponse> {

        const injector = await web3FromSource(account.meta.source);
        const txState: BasicTxResponse = {};

        try {
            // Make a transfer from Alice to BOB, waiting for inclusion
            const unsubscribe = await extrinsic
                .signAndSend(
                    account.address,
                    { signer: injector.signer }, (result) => {
                        if (!result || !result.status) {
                            return;
                        }

                        result.events
                            .filter(({ event }) => event.section === 'system' || event.section === 'imbueProposals')
                            .forEach(({ event }): BasicTxResponse => {
                                txState.transactionHash = extrinsic.hash.toHex();

                                if (event.method === 'ExtrinsicSuccess') {
                                    txState.status = true;
                                    return txState;
                                } else if (event.method === 'ExtrinsicFailed') {
                                    txState.status = false;
                                    return txState;
                                }
                                return txState;
                            });

                        if (result.isError) {
                            txState.txError = true;
                            return txState;
                        }

                        if (result.isCompleted) {
                            unsubscribe();
                            return txState;
                        }
                    });
        } catch (e) {
            console.error('error withdrawing', e);
            txState.txError = true;
            return txState;
        }
        return txState;
    }

     handleError(transactionState: BasicTxResponse,  dispatchError: DispatchError): BasicTxResponse {
        try {
            
            let errorMessage = polkadot.getDispatchError(dispatchError);
            transactionState.errorMessage = errorMessage;
            transactionState.status = false;
            transactionState.txError = true;
            return transactionState;
        } catch (error) {
            transactionState.errorMessage = error.message;

            // swallow
            return transactionState;
        }
    }



};

export default ChainService;