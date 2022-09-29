import * as React from 'react';
import { Select } from "@rmwc/select";
import '@rmwc/select/styles';

import * as polkadot from "../utils/polkadot";
import { BasicTxResponse, ButtonState, Currency, Milestone, ProjectOnChain, ProjectState, User } from "../models";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { AccountChoice } from './accountChoice';
import { ErrorDialog } from './errorDialog';
import ChainService from '../services/chainService';

export type VoteOnMilestoneProps = {
    imbueApi: polkadot.ImbueApiInfo,
    user: User,
    projectOnChain: ProjectOnChain,
    firstPendingMilestoneIndex: number,
    chainService: ChainService
}

type VoteOnMilestoneState = {
    showPolkadotAccounts: boolean,
    showErrorDialog: boolean,
    errorMessage: String | null,
    vote: boolean,
    status: string,
    buttonState: ButtonState
}

export class VoteOnMilestone extends React.Component<VoteOnMilestoneProps> {
    state: VoteOnMilestoneState = {
        showPolkadotAccounts: false,
        showErrorDialog: false,
        errorMessage: null,
        vote: false,
        status: "pendingApproval",
        buttonState: ButtonState.Default
    }

    updateVoteValue(vote: boolean) {
        this.setState({ vote: vote });
    }

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.setState({ showPolkadotAccounts: true });
    }

    closeErrorDialog = () => {
        this.setState({ showErrorDialog: false });
    }

    async submitVote(account: InjectedAccountWithMeta): Promise<void> {
        await this.setState({ showPolkadotAccounts: false, buttonState: ButtonState.Saving });
        const result: BasicTxResponse = await this.props.chainService.voteOnMilestone(account,
            this.props.projectOnChain,
            this.props.firstPendingMilestoneIndex,
            this.state.vote);

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
                            <AccountChoice accountSelected={(account) => this.submitVote(account)} />
                        </h3>
                        : null
                    }
                    <form id="vote-submission-form" name="vote-submission-form" method="get" className="form" onSubmit={this.handleSubmit}>
                        <Select
                            label="Vote On Milestone"
                            required
                            onChange={(event: React.FormEvent) => this.updateVoteValue(Boolean(parseInt((event.target as HTMLInputElement).value)))}
                            icon="how_to_vote"
                        >
                            <option key="false" value={0} >No</option>
                            <option key="true" value={1}>Yes</option>
                        </Select>
                        <button
                            type="submit"
                            disabled={this.state.buttonState == ButtonState.Saving}
                            className={this.state.buttonState == ButtonState.Saving ? "button primary blob" : this.state.buttonState == ButtonState.Done ? "button primary finalized" : "button primary"}
                            id="vote">
                            {
                                this.state.buttonState == ButtonState.Saving ? "Saving....."
                                    : this.state.buttonState == ButtonState.Done ? "Vote Registered"
                                        : "Vote"}
                        </button>
                    </form>
                </div>
            );
        }
    }
}