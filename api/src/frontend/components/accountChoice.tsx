import {InjectedAccountWithMeta} from "@polkadot/extension-inject/types";
import {getWeb3Accounts} from "../utils/polkadot";
import * as React from "react";
import {Dialogue} from "./dialogue";

type AccountChoiceProps = {
    accountSelected: (account: InjectedAccountWithMeta) => void
}
type AccountChoiceState = {
    accounts: InjectedAccountWithMeta[]
}

export class AccountChoice extends React.Component<AccountChoiceProps, AccountChoiceState> {
    state: AccountChoiceState = {
        accounts: []
    }

    async componentDidMount() {
        const accounts = await getWeb3Accounts();
        this.setState({accounts});
    }

    render() {
        return <Dialogue title="Choose the account you would like to use"
                         actionList={
                             <>
                                 {this.state.accounts.map((account, index) => {
                                     const {meta: {name, source}} = account;
                                     return <li className="button-container" key={index}>
                                         <button className="primary"
                                                 onClick={() => this.props.accountSelected(account)}>
                                             {`${name} (${source})`}
                                         </button>
                                     </li>
                                 })}
                             </>
                         }/>
    }
}