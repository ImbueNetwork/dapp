import * as React from "react";
import * as ReactDOMClient from "react-dom/client";

import {Tab, TabBar} from "@rmwc/tabs";

type DetailsProps = {}
type DetailsState = {
    activeTabIndex: number
}


class Details extends React.Component<DetailsProps, DetailsState> {
    state: DetailsState = {
        activeTabIndex: 0
    }

    constructor(props: DetailsProps) {
        super(props);
    }

    setActiveTab(tabIndex: number) {
        this.setState({activeTabIndex: tabIndex});
    }

    render() {
        return <div>
            <div className="top-wrapper">
                <header className="project-name-header"><h1 className="heading-8 project-name-heading"><span
                    id="project-name">Imbue Network</span></h1></header>
                <img id="project-logo" loading="lazy"
                     srcSet="https://uploads-ssl.webflow.com/6269d876b0577cd24ebce942/626f2cc6ce0d710373645931_6269d876b0577c5f59bceab2_imbue-web-image%5B1%5D-p-800.jpeg"/>
            </div>
            <h3 id="funding-round-not-yet-open">Awaiting funding approval. Funding round not complete or approved.
                Please <a href="https://discord.gg/jyWc6k8a">contact the team</a> for review.</h3>

            <TabBar activeTabIndex={this.state.activeTabIndex}
                    onActivate={(evt) => this.setActiveTab(evt.detail.index)} >
                <Tab icon="description" label="About"/>
                <Tab icon="list" label="Milestones"/>
            </TabBar>

            <div id="tab-content-container">
                <div className={`about tab-content ${ this.state.activeTabIndex === 0 ? "active" : "" }`}>
                    <div id="project-description"><p>Imbue Network is a decentralised crowdfunding DAO built on top of
                        the Polkadot blockchain platform. It is an idea incubator open to the entire world that allows
                        anyone, from any walk of life and for any kind of endeavour, to submit and vote on Ideas worth
                        Funding from the communities that believe in them the most.</p>
                        <p>2 Milestones</p>
                        <p>Launch on Kusama with stable currencies. </p>
                        <p>2: Imbue Enterprise. </p>
                    </div>
                    <ul className="project-details">
                        <li className="project-detail"><span className="detail-value hidden" id="in-block"></span></li>
                        <li className="project-detail"><span className="detail-label"></span> <span
                            id="project-detail-currency" className="imbu-currency-label">$KSM</span> <span
                            id="funds-required">50000</span> <span className="imbu-currency-label fraction">.00</span>
                            <span className="detail-label">required</span></li>
                        <li className="project-detail">
                            <span className="detail-value" id="project-website">
                                <a href="https://Imbue.Network" target="_blank">https://Imbue.Network</a>
                            </span>
                        </li>
                    </ul>
                </div>
                <ol id="milestones" className={`tab-content mdc-deprecated-list mdc-deprecated-list--two-line ${ this.state.activeTabIndex === 1 ? "active" : "" }`}>
                    <li className="mdc-deprecated-list-item" tabIndex={0}>
                        <span className="mdc-deprecated-list-item__ripple"></span>
                        <span className="mdc-deprecated-list-item__graphic">
                            <i className="material-icons">pending_actions</i>
                        </span>
                        <span className="mdc-deprecated-list-item__text">
                            <span className="mdc-deprecated-list-item__primary-text">Launch on Kusama</span>
                            <span className="mdc-deprecated-list-item__secondary-text">50%
                            </span>
                        </span>
                    </li>

                    <li className="mdc-deprecated-list-item" tabIndex={0}>
                        <span className="mdc-deprecated-list-item__ripple"></span>
                        <span className="mdc-deprecated-list-item__graphic">
                            <i className="material-icons">pending_actions</i>
                        </span>
                        <span className="mdc-deprecated-list-item__text">
                            <span className="mdc-deprecated-list-item__primary-text">Imbue Enterprise</span>
                            <span className="mdc-deprecated-list-item__secondary-text">50%
                            </span>
                        </span>
                    </li>
                </ol>
            </div>
        </div>
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    ReactDOMClient.createRoot(document.getElementById('content-root')!)
        .render(<Details/>);
});