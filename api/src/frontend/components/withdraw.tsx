import * as React from 'react';
import { Select } from "@rmwc/select";
import '@rmwc/select/styles';

import * as polkadot from "../utils/polkadot";
import { BasicTxResponse, ButtonState, Currency, Milestone, ProjectOnChain, ProjectState, User } from "../models";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { AccountChoice } from './accountChoice';
import { ErrorDialog } from './errorDialog';
import ChainService from '../services/chainService';

export type WithdrawProps = {
    imbueApi: polkadot.ImbueApiInfo,
    user: User,
    projectOnChain: ProjectOnChain,
    chainService: ChainService
}

type WithdrawState = {
    showPolkadotAccounts: boolean,
    showErrorDialog: boolean,
    errorMessage: String | null,
    status: string,
    buttonState: ButtonState
}

export class Withdraw extends React.Component<WithdrawProps> {
    state: WithdrawState = {
        showPolkadotAccounts: false,
        showErrorDialog: false,
        errorMessage: null,
        status: "fundsWithdrawn",
        buttonState: ButtonState.Default
    }

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.setState({ showPolkadotAccounts: true });
    }

    closeErrorDialog = () => {
        this.setState({ showErrorDialog: false });
    }

    async withdraw(account: InjectedAccountWithMeta): Promise<void> {
        await this.setState({ showPolkadotAccounts: false, buttonState: ButtonState.Saving });
        const result: BasicTxResponse = await this.props.chainService.withdraw(account,
            this.props.projectOnChain);

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

    render() {
        if (this.props.projectOnChain.milestones) {
            return (
                <div>
                    <ErrorDialog errorMessage={this.state.errorMessage} showDialog={this.state.showErrorDialog} closeDialog={this.closeErrorDialog}></ErrorDialog>

                    {this.state.showPolkadotAccounts ?
                        <h3 id="project-state-headline">
                            <AccountChoice accountSelected={(account) => this.withdraw(account)} />
                        </h3>
                        : null
                    }
                    <form id="withdraw-funds-form" name="withdraw-funds-form" method="get" className="form" onSubmit={this.handleSubmit}>
                        <button
                            type="submit"
                            disabled={this.state.buttonState == ButtonState.Saving}
                            className={this.state.buttonState == ButtonState.Saving ? "button primary blob" : this.state.buttonState == ButtonState.Done ? "button primary finalized" : "button primary"}
                            id="withdraw">
                            {
                                this.state.buttonState == ButtonState.Saving ? "Saving....."
                                    : this.state.buttonState == ButtonState.Done ? "Funds Withdrawn"
                                        : "Withdraw"}
                        </button>
                    </form>
                </div>
            );
        }
    }
}