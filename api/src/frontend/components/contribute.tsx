import * as React from 'react';
import { TextField } from "@rmwc/textfield";
import '@rmwc/textfield/styles';

import * as polkadot from "../utils/polkadot";
import { BasicTxResponse, Currency, Milestone, ProjectOnChain, ProjectState, User } from "../models";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { AccountChoice } from './accountChoice';
import { FundingInfo } from './fundingInfo';
import { ErrorDialog } from './errorDialog';
import ChainService from '../services/chainService';

export type ContributeProps = {
    imbueApi: polkadot.ImbueApiInfo,
    user: User,
    projectOnChain: ProjectOnChain,
    chainService: ChainService
}

enum ButtonState {
    Default,
    Saving,
    Done
}

type ContributeState = {
    showPolkadotAccounts: boolean,
    showErrorDialog: boolean,
    errorMessage: String | null,
    contribution: number,
    status: string,
    buttonState: ButtonState
}

export class Contribute extends React.Component<ContributeProps> {
    state: ContributeState = {
        showPolkadotAccounts: false,
        showErrorDialog: false,
        errorMessage: null,
        contribution: 0,
        status: "pendingApproval",
        buttonState: ButtonState.Default
    }

    async contribute(account: InjectedAccountWithMeta): Promise<void> {
        await this.setState({ showPolkadotAccounts: false, buttonState: ButtonState.Saving });
        const result: BasicTxResponse = await this.props.chainService.contribute(account,
            this.props.projectOnChain,
            BigInt(this.state.contribution * 1e12));

        // TODO timeout the while loop
        while (true) {
            if (result.status || result.txError) {
                if (result.status) {
                    await this.setState({ buttonState: ButtonState.Done });
                } else if (result.txError) {
                    await this.setState({ buttonState: ButtonState.Default, showErrorDialog: true, errorMessage: result.errorMessage });
                }
                break;
            }
            await new Promise(f => setTimeout(f, 1000));
        }
    }

    updateContributionValue(newContribution: number) {
        this.setState({ contribution: newContribution });
    }

    async beginContribution(): Promise<void> {
        this.setState({ showPolkadotAccounts: true, buttonState: ButtonState.Done });
    }

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.setState({ showPolkadotAccounts: true });
    }

    closeErrorDialog = () => {
        this.setState({ showErrorDialog: false });
    }

    render() {
        if (this.props.projectOnChain.milestones) {
            return (
                <div>
                    <ErrorDialog errorMessage={this.state.errorMessage} showDialog={this.state.showErrorDialog} closeDialog={this.closeErrorDialog}></ErrorDialog>
                    <FundingInfo projectOnChain={this.props.projectOnChain}></FundingInfo>

                     {this.state.showPolkadotAccounts ?
                        <h3 id="project-state-headline">
                            <AccountChoice accountSelected={(account) => this.contribute(account)} />
                        </h3>
                        : null
                    }
                    <form id="contribution-submission-form" name="contribution-submission-form" method="get" className="form" onSubmit={this.handleSubmit}>
                        <TextField
                            type="number"
                            step="any"
                            onChange={(event: React.FormEvent) => this.updateContributionValue(parseFloat((event.target as HTMLInputElement).value))}
                            outlined className="mdc-text-field" prefix={`$${this.props.projectOnChain.currencyId as Currency}`}
                            label="Contribution Amount..." required />
                        <button
                            type="submit"
                            disabled={this.state.buttonState == ButtonState.Saving}
                            className={this.state.buttonState == ButtonState.Saving ? "button primary blob" : this.state.buttonState == ButtonState.Done ? "button primary finalized" : "button primary"}
                            id="contribute-button">
                            {
                                this.state.buttonState == ButtonState.Saving ? "Saving....."
                                    : this.state.buttonState == ButtonState.Done ? "Contribution Succeeded"
                                        : "Contribute"}
                        </button>
                    </form>
                </div>
            );
        }
    }
}