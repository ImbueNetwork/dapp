import React, { useState } from 'react';
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

export const VoteOnMilestone = (props: VoteOnMilestoneProps): JSX.Element => {
    const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
    const [errorDialogVisible, showErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [status, setStatus] = useState("fundsWithdrawn");
    const [buttonState, setButtonState] = useState(ButtonState.Default);
    const [vote, setVote] = useState(false);


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        showPolkadotAccounts(true);
    }

    const closeErrorDialog = () => {
        showErrorDialog(false);
    }

    const submitVote = async (account: InjectedAccountWithMeta): Promise<void> => {
        showPolkadotAccounts(false);
        setButtonState(ButtonState.Saving);
        const result: BasicTxResponse = await props.chainService.voteOnMilestone(
            account,
            props.projectOnChain,
            props.firstPendingMilestoneIndex,
            vote);

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

    return props.projectOnChain.milestones ? (
        <div>
            <ErrorDialog errorMessage={errorMessage} showDialog={errorDialogVisible} closeDialog={closeErrorDialog} />

            {polkadotAccountsVisible ?
                <h3 id="project-state-headline">
                    <AccountChoice accountSelected={(account) => submitVote(account)} />
                </h3>
                : null
            }
            <form id="vote-submission-form" name="vote-submission-form" method="get" className="form" onSubmit={handleSubmit}>
                <Select
                    label="Vote On Milestone"
                    required
                    onChange={(event: React.FormEvent) => setVote(Boolean(parseInt((event.target as HTMLInputElement).value)))}
                    icon="how_to_vote"
                >
                    <option key="false" value={0} >No</option>
                    <option key="true" value={1}>Yes</option>
                </Select>
                <button
                    type="submit"
                    disabled={buttonState == ButtonState.Saving}
                    className={buttonState == ButtonState.Saving ? "button primary blob" : buttonState == ButtonState.Done ? "button primary finalized" : "button primary"}
                    id="vote">
                    {
                        buttonState == ButtonState.Saving ? "Saving....." :
                            buttonState == ButtonState.Done ? "Vote Registered" : "Vote"}
                </button>
            </form>
        </div>
    ) : <></>;
}