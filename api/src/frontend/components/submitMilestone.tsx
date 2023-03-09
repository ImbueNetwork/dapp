import * as React from 'react';
import { Select } from "@rmwc/select";
import '@rmwc/select/styles';

import * as polkadot from "../utils/polkadot";
import { BasicTxResponse, ButtonState, Currency, Milestone, ProjectOnChain, ProjectState, User } from "../models";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { AccountChoice } from './accountChoice';
import { ErrorDialog } from './errorDialog';
import ChainService from '../services/chainService';

export type SubmitMilestoneProps = {
    imbueApi: polkadot.ImbueApiInfo,
    user: User,
    projectOnChain: ProjectOnChain,
    chainService: ChainService
}

type SubmitMilestoneState = {
    showPolkadotAccounts: boolean,
    showErrorDialog: boolean,
    errorMessage: String | null,
    milestoneKey: number,
    status: string,
    buttonState: ButtonState
}

export class SubmitMilestone extends React.Component<SubmitMilestoneProps> {
    state: SubmitMilestoneState = {
        showPolkadotAccounts: false,
        showErrorDialog: false,
        errorMessage: null,
        milestoneKey: 0,
        status: "pendingApproval",
        buttonState: ButtonState.Default
    }

    updateMilestoneValue(milestoneKey: number) {
        this.setState({ milestoneKey: milestoneKey });
    }

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.setState({ showPolkadotAccounts: true });
    }

    closeErrorDialog = () => {
        this.setState({ showErrorDialog: false });
    }

    async submitMilestone(account: InjectedAccountWithMeta): Promise<void> {
        await this.setState({ showPolkadotAccounts: false, buttonState: ButtonState.Saving });
        const result: BasicTxResponse = await this.props.chainService.submitMilestone(account,
            this.props.projectOnChain,
            this.state.milestoneKey);

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
                            <AccountChoice accountSelected={(account) => this.submitMilestone(account)} />
                        </h3>
                        : null
                    }
                    <form id="milestone-submission-form" name="milestone-submission-form" method="get" className="form" onSubmit={this.handleSubmit}>
                        <Select
                            label="Submit Milestone"
                            required
                            onChange={(event: React.FormEvent) => this.updateMilestoneValue(parseInt((event.target as HTMLInputElement).value))}
                            icon="how_to_vote"
                        >
                            {this.props.projectOnChain.milestones.filter(milestone => !milestone.isApproved).map(milestone =>
                                <option key={milestone.milestone_key} value={milestone.milestone_key}>{milestone.name}</option>
                            )}
                        </Select>
                        <button
                            type="submit"
                            disabled={this.state.buttonState == ButtonState.Saving}
                            className={this.state.buttonState == ButtonState.Saving ? "button primary blob" : this.state.buttonState == ButtonState.Done ? "button primary finalized" : "button primary"}
                            id="submit-milestone">
                            {
                                this.state.buttonState == ButtonState.Saving ? "Saving....."
                                    : this.state.buttonState == ButtonState.Done ? "Submit Succeeded"
                                        : "Submit"}
                        </button>
                    </form>
                </div>
            );
        }
    }
}