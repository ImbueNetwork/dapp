import * as React from 'react';
import { TextField } from "@rmwc/textfield";
import '@rmwc/textfield/styles';
import * as polkadot from "../utils/polkadot";
import { Currency, User } from "../models";
import { web3FromSource } from "@polkadot/extension-dapp";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { DispatchError } from '@polkadot/types/interfaces';
import { AccountChoice } from './accountChoice';
import type { ITuple, } from "@polkadot/types/types";

export type ContributeProps = {
    imbueApi: polkadot.ImbueApiInfo,
    user: User,
    projectOnChain: any,
}


type ContributeState = {
    showPolkadotAccounts: Boolean,
    contribution: number,
}


export class Contribute extends React.Component<ContributeProps> {

    state: ContributeState = {
        showPolkadotAccounts: false,
        contribution: 0,
    }

    constructor(props: ContributeProps) {
        super(props);
    }

    async contribute(account: InjectedAccountWithMeta): Promise<void> {
        this.setState({ showPolkadotAccounts: false });
        if (!this.props.projectOnChain) {
            return
        }

        const projectId = this.props.projectOnChain.milestones[0].projectKey;
        let contributeButton = document.getElementById('contribute-button') as HTMLButtonElement;

        contributeButton.disabled = true;
        contributeButton.classList.add("blob");
        contributeButton.innerText = "Saving.....";

        const extrinsic = await this.props.imbueApi.imbue.api.tx.imbueProposals.contribute(
            projectId,
            this.state.contribution * 1e12
        );

        const injector = await web3FromSource(account.meta.source);

        const txHash = await extrinsic.signAndSend(
            account.address,
            { signer: injector.signer },
            ({ status }) => {
                this.props.imbueApi.imbue.api.query.system.events((events: any) => {
                    if (events) {
                        // Loop through the Vec<EventRecord>
                        events.forEach((record: any) => {

                            // Extract the phase, event and the event types
                            const { event, phase } = record;
                            const contributionSucceeded = `${event.section}.${event.method}` == "imbueProposals.ContributeSucceeded";
                            const [dispatchError] = event.data as unknown as ITuple<[DispatchError]>;
                            if (dispatchError.isModule) {
                                try {
                                    let errorMessage = polkadot.getDispatchError(dispatchError);
                                    polkadot.errorNotification(Error(errorMessage));

                                    contributeButton.disabled = false;
                                    contributeButton.classList.remove("blob");
                                    contributeButton.innerText = "Contribute";
                                    // location.reload();
                                } catch (error) {
                                    // swallow
                                }
                            }
                            if (contributionSucceeded) {
                                const types = event.typeDef;
                                const contributionAccountId = event.data[0];
                                const contributionProjectId = parseInt(event.data[1].toString());

                                if (contributionAccountId == account.address && contributionProjectId == projectId) {
                                    contributeButton.classList.remove("blob");
                                    contributeButton.disabled = false;
                                    contributeButton.classList.add("finalized");
                                    contributeButton.innerText = "Contribution Succeeded";
                                }
                            }
                        });
                    }
                });
            }
        ).catch((e: any) => {
            polkadot.errorNotification(e);
        });
        console.log(`Transaction hash: ${txHash}`);

    }

    updateContributionValue(newContribution: number) {
        this.setState({ contribution: newContribution });
    }

    async beginContribution(): Promise<void> {
        this.setState({ showPolkadotAccounts: true });
    }

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.setState({ showPolkadotAccounts: true });
    }

    render() {
        return (
            <div>

                {this.state.showPolkadotAccounts ?
                    <h3 id="project-state-headline">
                        <AccountChoice accountSelected={ (account) => this.contribute(account)} />
                    </h3>
                    : null
                }
                <form id="contribution-submission-form" name="contribution-submission-form" method="get" className="form" onSubmit={this.handleSubmit}>
                    <TextField
                        type="number"
                        step="any"
                        onChange = {(event: React.FormEvent) => this.updateContributionValue(parseFloat((event.target as HTMLInputElement).value))} 
                        outlined className="mdc-text-field" prefix={`$${this.props.projectOnChain.currencyId as Currency}`}
                        label="Contribution Amount..." required />
                    <button type="submit" className="button primary" id="contribute-button" >Contribute</button>
                </form>
            </div>
        );
    }
}