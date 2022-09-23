import * as React from 'react';
import { Tooltip } from "@rmwc/tooltip";
import '@rmwc/tooltip/styles';

import * as polkadot from "../utils/polkadot";
import { BasicTxResponse, ButtonState, Currency, Milestone, ProjectOnChain, ProjectState, User } from "../models";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { AccountChoice } from './accountChoice';
import { ErrorDialog } from './errorDialog';
import ChainService from '../services/chainService';

export type ApproveMilestoneProps = {
    imbueApi: polkadot.ImbueApiInfo,
    user: User,
    projectOnChain: ProjectOnChain,
    firstPendingMilestoneIndex: number
    chainService: ChainService
}

type ApproveMilestoneState = {
    showPolkadotAccounts: boolean,
    showErrorDialog: boolean,
    errorMessage: String | null,
    enableApproveButton: boolean,
    status: string,
    buttonState: ButtonState
}

export class ApproveMilestone extends React.Component<ApproveMilestoneProps> {
    state: ApproveMilestoneState = {
        showPolkadotAccounts: false,
        showErrorDialog: false,
        errorMessage: null,
        status: "pendingApproval",
        enableApproveButton: false,
        buttonState: ButtonState.Default
    }

    closeErrorDialog = () => {
        this.setState({ showErrorDialog: false });
    }

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.setState({ showPolkadotAccounts: true });
    }

    async componentDidMount() {
        const enableApproveButton = await this.haveAllUsersVotedOnMilestone();
        if (this.state.enableApproveButton != enableApproveButton) {
            this.setState({
                enableApproveButton: enableApproveButton,
            })
        }
        console.log("**** button is enabled ",this.state.enableApproveButton);
    }

    async haveAllUsersVotedOnMilestone(): Promise<boolean> {
        const totalContributions = this.props.projectOnChain.raisedFundsFormatted;
        const milestoneVotes: any = (await (await this.props.imbueApi.imbue?.api.query.imbueProposals.milestoneVotes([this.props.projectOnChain.id, this.props.firstPendingMilestoneIndex])).toHuman();
        const yayVotes = BigInt(milestoneVotes.yay.replaceAll(",", ""));
        const nayVotes = BigInt(milestoneVotes.nay.replaceAll(",", ""));
        const totalVotes = Number((yayVotes + nayVotes) / BigInt(1e12));
        return totalVotes == totalContributions;
    }

    async approveMilestone(account: InjectedAccountWithMeta): Promise<void> {
        await this.setState({ showPolkadotAccounts: false, buttonState: ButtonState.Saving });
        const result: BasicTxResponse = await this.props.chainService.approveMilestone(account,
            this.props.projectOnChain,
            this.props.firstPendingMilestoneIndex);

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
                            <AccountChoice accountSelected={(account) => this.approveMilestone(account)} />
                        </h3>
                        : null
                    }
                    <form id="approve-milestone-form" name="approve-milestone-form" method="get" className="form" onSubmit={this.handleSubmit}>
                        <button
                            type="submit"
                            disabled={this.state.buttonState == ButtonState.Saving || !this.state.enableApproveButton}
                            className={this.state.buttonState == ButtonState.Saving ? "button primary blob" : this.state.buttonState == ButtonState.Done ? "button primary finalized" : "button primary"}
                            id="approve-milestone">
                            {
                                this.state.buttonState == ButtonState.Saving ? "Saving....."
                                    : this.state.buttonState == ButtonState.Done ? "Milestone Approved"
                                        : "Approve Milestone"
                            }
                        </button>
                    </form>
                </div>
            );
        }
    }
}