import React, { useEffect, useState } from 'react';
import { TextField } from "@rmwc/textfield";
import '@rmwc/textfield/styles';

import * as polkadot from "../utils/polkadot";
import { BasicTxResponse, Currency, Milestone, ProjectOnChain, ProjectState, User } from "../models";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { AccountChoice } from './accountChoice';
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

export const Contribute = ({ chainService, projectOnChain }: ContributeProps): JSX.Element => {
    const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
    const [errorDialogVisible, showErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [contribution, setContribution] = useState(0);
    const [status, setStatus] = useState("pendingApproval");
    const [buttonState, setButtonState] = useState(ButtonState.Default);

    const contribute = async (account: InjectedAccountWithMeta): Promise<void> => {
        showPolkadotAccounts(false);
        setButtonState(ButtonState.Saving);
        const result: BasicTxResponse = await chainService.contribute(account,
            projectOnChain,
            BigInt(contribution * 1e12));

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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        showPolkadotAccounts(true);
    }

    const closeErrorDialog = () => {
        showErrorDialog(false);
    }

    return (
        projectOnChain.milestones ?
            <div>
                <ErrorDialog errorMessage={errorMessage} showDialog={errorDialogVisible} closeDialog={closeErrorDialog} />

                {polkadotAccountsVisible ?
                    <h3 id="project-state-headline">
                        <AccountChoice accountSelected={(account) => contribute(account)} />
                    </h3>
                    : null
                }
                <form id="contribution-submission-form" name="contribution-submission-form" method="get" className="form" onSubmit={handleSubmit}>
                    <TextField
                        type="number"
                        step="any"
                        onChange={(event: React.FormEvent) => setContribution(parseFloat((event.target as HTMLInputElement).value))}
                        outlined
                        className="mdc-text-field"
                        prefix={`$${projectOnChain.currencyId as Currency}`}
                        label="Contribution Amount..." required />
                    <button
                        type="submit"
                        disabled={buttonState == ButtonState.Saving}
                        className={buttonState == ButtonState.Saving ? "button primary blob" : buttonState == ButtonState.Done ? "button primary finalized" : "button primary"}
                        id="contribute">
                        {
                            buttonState == ButtonState.Saving ? "Saving....."
                                : buttonState == ButtonState.Done ? "Contribution Succeeded"
                                    : "Contribute"}
                    </button>
                </form>
            </div> : <></>
    );

}