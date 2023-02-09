import React, { useState } from 'react';
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

export const Withdraw = (props: WithdrawProps): JSX.Element => {
    const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
    const [errorDialogVisible, showErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [status, setStatus] = useState("fundsWithdrawn");
    const [buttonState, setButtonState] = useState(ButtonState.Default);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        showPolkadotAccounts(true);
    }

    const closeErrorDialog = () => {
        showErrorDialog(false);
    }

    const withdraw = async (account: InjectedAccountWithMeta): Promise<void> => {
        showPolkadotAccounts(false);
        setButtonState(ButtonState.Saving);
        const result: BasicTxResponse = await props.chainService.withdraw(account,
            props.projectOnChain);
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

    return props.projectOnChain.milestones ?
        <div>
            <ErrorDialog errorMessage={errorMessage} showDialog={errorDialogVisible} closeDialog={closeErrorDialog} />

            {polkadotAccountsVisible ?
                <h3 id="project-state-headline">
                    <AccountChoice accountSelected={(account) => withdraw(account)} />
                </h3>
                : null
            }
            <form id="withdraw-funds-form" name="withdraw-funds-form" method="get" className="form" onSubmit={handleSubmit}>
                <button
                    type="submit"
                    disabled={buttonState == ButtonState.Saving}
                    className={buttonState == ButtonState.Saving ? "button primary blob" : buttonState == ButtonState.Done ? "button primary finalized" : "button primary"}
                    id="withdraw">
                    {
                        buttonState == ButtonState.Saving ?
                            "Saving....." :
                            buttonState == ButtonState.Done ? "Funds Withdrawn" : "Withdraw"
                    }
                </button>
            </form>
        </div> : <></>
}