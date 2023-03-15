import React, { useState, useEffect } from 'react';
import { CircularProgress } from "@rmwc/circular-progress";
import { Chip } from "@rmwc/chip";
import '@rmwc/circular-progress/styles';

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
    displayVotingProgress: boolean,
    percentageOfContributorsVoted: number,
    status: string,
    buttonState: ButtonState
}

export const ApproveMilestone = ({ projectOnChain, imbueApi, firstPendingMilestoneIndex, chainService }: ApproveMilestoneProps): JSX.Element => {
    const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
    const [errorDialogVisible, showErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [status, setStatus] = useState("pendingApproval");
    const [percentageOfContributorsVoted, setPercentageOfContributorsVoted] = useState(-1);
    const [approveButtonEnabled, enabledApproveButon] = useState(false);
    const [displayVotingProgress, showVotingProgress] = useState(false);
    const [buttonState, setButtonState] = useState(ButtonState.Default);

    const closeErrorDialog = () => {
        showErrorDialog(false);
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        showPolkadotAccounts(true);
    }

    const init = async () => {
        await haveAllUsersVotedOnMilestone();
    };

    useEffect(() => {
        void init();
    }, []);

    const haveAllUsersVotedOnMilestone = async (): Promise<boolean> => {
        const totalContributions = projectOnChain.raisedFundsFormatted;
        const milestoneVotes: any = ((await imbueApi.imbue?.api.query.imbueProposals.milestoneVotes([projectOnChain.id, firstPendingMilestoneIndex]))).toHuman();
        if (!milestoneVotes) {
            return false;
        }

        const yayVotes = BigInt(milestoneVotes.yay.replaceAll(",", ""));
        const nayVotes = BigInt(milestoneVotes.nay.replaceAll(",", ""));
        const totalVotes = Number((yayVotes + nayVotes) / BigInt(1e12));
        const _percentageOfContributorsVoted = (totalVotes / totalContributions) * 100;
        const _approveButtonEnabled = totalVotes == totalContributions;
        const _displayVotingProgress = (projectOnChain.projectState == ProjectState.OpenForVoting || !approveButtonEnabled);
        if (_percentageOfContributorsVoted != _percentageOfContributorsVoted) {
            enabledApproveButon(_approveButtonEnabled);
            setPercentageOfContributorsVoted(_percentageOfContributorsVoted);
            showVotingProgress(_displayVotingProgress);
        }
        return totalVotes == totalContributions;
    }

    const approveMilestone = async (account: InjectedAccountWithMeta): Promise<void> => {
        showPolkadotAccounts(false);
        setButtonState(ButtonState.Saving);

        const result: BasicTxResponse = await chainService.approveMilestone(account,
            projectOnChain,
            firstPendingMilestoneIndex);

        // TODO timeout the while loop
        while (true) {
            if (result.status || result.txError) {
                if (result.status) {
                    setButtonState(ButtonState.Done);
                } else if (result.txError) {
                    setButtonState(ButtonState.Default);
                    showErrorDialog(true);
                    setErrorMessage(result.errorMessage);
                }
                break;
            }
            await new Promise(f => setTimeout(f, 1000));
        }
    }

    return projectOnChain && projectOnChain.milestones ?
        <div>
            <ErrorDialog errorMessage={errorMessage} showDialog={errorDialogVisible} closeDialog={closeErrorDialog} />

            {polkadotAccountsVisible ?
                <h3 id="project-state-headline">
                    <AccountChoice accountSelected={(account) => approveMilestone(account)} />
                </h3>
                : null
            }
            <form id="approve-milestone-form" name="approve-milestone-form" method="get" className="form" onSubmit={handleSubmit}>
                <button
                    type="submit"
                    disabled={buttonState == ButtonState.Saving || !approveButtonEnabled}
                    className={buttonState == ButtonState.Saving ? "button primary blob" : buttonState == ButtonState.Done ? "button primary finalized" : "button primary"}
                    id="approve-milestone">
                    {
                        buttonState == ButtonState.Saving ? "Saving....."
                            : buttonState == ButtonState.Done ? "Milestone Approved"
                                : "Approve Milestone"
                    }
                </button>

                {displayVotingProgress ?
                    <div id="vote-progress">
                        <Chip icon={<CircularProgress />} label={`${percentageOfContributorsVoted}% Contributors Voted`} />
                    </div>
                    : null
                }

            </form>
        </div> : <></>
}