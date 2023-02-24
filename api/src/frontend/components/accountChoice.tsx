import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { getWeb3Accounts } from "../utils/polkadot";
import React, { useEffect, useState } from "react";
import { Dialogue } from "./dialogue";

type AccountChoiceProps = {
    accountSelected: (account: InjectedAccountWithMeta) => void
}

export const AccountChoice = ({ accountSelected }: AccountChoiceProps): JSX.Element => {
    const [accounts, setAccounts] = React.useState<InjectedAccountWithMeta[]>([]);

    const fetchAndSetAccounts = async () => {
        const _accounts = await getWeb3Accounts();
        setAccounts(_accounts);
    };

    useEffect(() => {
        void fetchAndSetAccounts();
    }, []);

    return <Dialogue title="Choose the account you would like to use"
        actionList={
            <>
                {accounts.map((account, index) => {
                    const { meta: { name, source } } = account;
                    return <li className="button-container" key={index}>
                        <button className="primary"
                            onClick={() => accountSelected(account)}>
                            {`${name} (${source})`}
                        </button>
                    </li>
                })}
            </>
        } />
}