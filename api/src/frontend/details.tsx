import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { Tab, TabBar } from "@rmwc/tabs";
import { List, SimpleListItem } from "@rmwc/list";
import * as utils from "./utils";
import * as polkadot from "./utils/polkadot";
import { Currency, RoundType, Project,ProjectOnChain, User, ProjectState } from "./models";
import "../../public/proposal.css"
import '@rmwc/list/styles';
import { marked } from "marked";

import { Contribute } from './components/contribute';
import ChainService from "./services/chain-service";

type DetailsProps = {
    imbueApi: polkadot.ImbueApiInfo,
    projectId: string | number | null,
    user: User,
    chainService: ChainService
}

type DetailsState = {
    activeTabIndex: number,
    projectOnChain: ProjectOnChain,
    projectState: ProjectState,
    userIsInitiator: boolean,
    showContributeComponent: boolean,
    showSubmitMilestoneComponent: boolean,
    showVoteComponent: boolean,
    showWithdrawComponent: boolean
}

const initiatorHeadingMapping: Record<ProjectState, JSX.Element> = {
    /* PROJECT HAS BEEN CREATED SUCCESSFULLY AND pending ADDITION TO FUNDING ROUND */
    [ProjectState.PendingProjectApproval] : <h3>Funding for this project is not yet open. Check back soon for more updates!</h3>,

    /* PROJECT IS PENDING FUNDING APPROVAL ROUND */
    [ProjectState.PendingFundingApproval] : <h3>Pending funding approval. Funding round not complete or approved. Please <a href="https://discord.gg/jyWc6k8a">contact the team</a> for review.</h3>,

    /* PROJECT IS IN THE CONTRIBUTION ROUND */
    [ProjectState.OpenForContribution]: <h3>Your proposal has been created successfully and added to the funding round. Contributors can now fund your project</h3>,

    /* PROJECT IS IN THE VOTING ROUND */

    [ProjectState.OpenForVoting] : <></>,

    [ProjectState.PendingMilestoneApproval] : <h3>Pending milestone approval. Milestone voting round not complete or approved. Please <a href='https://discord.gg/jyWc6k8a'>contact the team</a> for review.</h3>,

    /* PROJECT IS pending MILESTONE SUBMISSION */
    [ProjectState.PendingMilestoneSubmission]: <h3>Pending milestone submission</h3>,

    [ProjectState.OpenForWithdraw]: <></>


}

const contributorHeadingMapping: Record<ProjectState, JSX.Element> = {
    /* PROJECT HAS BEEN CREATED SUCCESSFULLY AND pending ADDITION TO FUNDING ROUND */
    [ProjectState.PendingProjectApproval] : <h3>Funding for this project is not yet open. Check back soon for more updates!</h3>,

    /* PROJECT IS PENDING FUNDING APPROVAL ROUND */
    [ProjectState.PendingFundingApproval] : <h3>Pending funding approval. Funding round not complete or approved. Please <a href="https://discord.gg/jyWc6k8a">contact the team</a> for review.</h3>,

    /* PROJECT IS IN THE CONTRIBUTION ROUND */
    [ProjectState.OpenForContribution] : <h3>This project is open for contributions!</h3>,

    [ProjectState.PendingMilestoneSubmission] : <></>,

    /* PROJECT IS IN THE VOTING ROUND */
    [ProjectState.OpenForVoting] : <h3>Project contributors can now vote on milestones</h3>,

    /* PROJECT IS IN THE VOTING ROUND */
    [ProjectState.PendingMilestoneApproval] : <></>,

    /* PROJECT IS pending MILESTONE SUBMISSION */
    [ProjectState.PendingMilestoneSubmission]: <h3>Pending milestone submission</h3>,

    [ProjectState.OpenForWithdraw]: <></>
}

class Details extends React.Component<DetailsProps, DetailsState> {
    state: DetailsState = {
        activeTabIndex: 0,
        projectOnChain: {} as ProjectOnChain,
        projectState: ProjectState.PendingProjectApproval,
        userIsInitiator: false,
        showContributeComponent: false,
        showSubmitMilestoneComponent: false,
        showVoteComponent: false,
        showWithdrawComponent: false
    }

    constructor(props: DetailsProps) {
        super(props);
    }

    setActiveTab(tabIndex: number) {
        this.setState({ activeTabIndex: tabIndex });
    }

    async setProjectState(projectOnChain: ProjectOnChain): Promise<void> {
        let userIsInitiator = await this.props.chainService.isUserInitiator(this.props.user, projectOnChain);        let showContributeComponent = false
        let showSubmitMilestoneComponent = false;
        let showVoteComponent = false;
        let showWithdrawComponent = false;

        if (!projectOnChain.milestones) {
            return;
        }

        const projectState = await this.props.chainService.getProjectState(projectOnChain, this.props.user);

        if(userIsInitiator) {
            // SHOW WITHDRAW AND MILESTONE SUBMISSION components
            switch(projectState) {
                case ProjectState.PendingMilestoneSubmission: showSubmitMilestoneComponent = true;
                case ProjectState.OpenForWithdraw: showWithdrawComponent = true;
            }

        } else {
            switch(projectState) {
                case ProjectState.OpenForContribution: showContributeComponent = true;
                case ProjectState.OpenForVoting: showVoteComponent = true;
            }
        }

        if (this.state.projectState !== projectState) {
            this.setState({
                projectOnChain: projectOnChain,
                userIsInitiator: userIsInitiator,
                projectState: projectState,
                showContributeComponent: showContributeComponent,
                showVoteComponent: showVoteComponent,
                showWithdrawComponent: showWithdrawComponent,
            })
        }
    }

    async componentDidMount() {

        if (this.props.projectId) {
            const project = await this.props.chainService.getProject(this.props.projectId);

            if (!project) {
                utils.redirect("/not-found");
                location.reload();
                return;
            }
            this.setProjectState(project);
        }
    }

    showProjectStateHeading(): JSX.Element {
        if (this.state.userIsInitiator) {
            return initiatorHeadingMapping[this.state.projectState];
        } else {
            return contributorHeadingMapping[this.state.projectState];
        }
    }

    render() {
        return <div id="details">
            <div className="top-wrapper">
                <header className="project-name-header"><h1 className="heading-8 project-name-heading"><span
                    id="project-name">{this.state.projectOnChain.name}</span></h1></header>
                <img id="project-logo" loading="lazy"
                    srcSet="https://uploads-ssl.webflow.com/6269d876b0577cd24ebce942/626f2cc6ce0d710373645931_6269d876b0577c5f59bceab2_imbue-web-image%5B1%5D-p-800.jpeg" />
            </div>

            {this.showProjectStateHeading()}

            <div className="action-buttons">
                <Contribute
                    projectOnChain={this.state.projectOnChain}
                    user={this.props.user}
                    imbueApi={this.props.imbueApi}
                    chainService={this.props.chainService}
                ></Contribute>
            </div>

            <TabBar activeTabIndex={this.state.activeTabIndex}
                onActivate={(evt) => this.setActiveTab(evt.detail.index)}>
                <Tab icon="description" label="About" />
                <Tab icon="list" label="Milestones" />
            </TabBar>

            <div id="tab-content-container">
                <div className={`tab-content ${this.state.activeTabIndex === 0 ? "active" : ""}`}>
                    <div id="project-description"
                        dangerouslySetInnerHTML={{ __html: marked.parse(`${this.state.projectOnChain.description}`) }}>
                    </div>
                    <ul className="project-details">
                        <li className="project-detail"><span className="detail-value hidden" id="in-block"></span></li>
                        <li className="project-detail">
                            <span className="detail-label"></span>
                            <span id="project-detail-currency"
                                className="imbu-currency-label">${this.state.projectOnChain.currencyId as Currency}</span>{' '}
                            <span id="funds-required">{String(this.state.projectOnChain.requiredFundsFormatted)}</span>
                            <span className="imbu-currency-label fraction">.00</span>{' '}
                            <span className="detail-label">required</span>
                        </li>
                        <li className="project-detail">
                            <span className="detail-value" id="project-website">
                                <a href={this.state.projectOnChain.website} target="_blank">{this.state.projectOnChain.website}</a>
                            </span>
                        </li>
                    </ul>
                </div>

                <div className={`tab-content ${this.state.activeTabIndex === 1 ? "active" : ""}`}>
                    <List twoLine id="milestones">
                        <SimpleListItem graphic="pending_actions" text="Launch on Kusama" secondaryText="50%" />
                        <SimpleListItem graphic="pending_actions" text="Imbue Enterprise" secondaryText="50%" />
                    </List>
                </div>
            </div>
        </div>
    }
}

document.addEventListener("DOMContentLoaded", async (event) => {
    const imbueApi = await polkadot.initImbueAPIInfo();
    const projectId = await utils.getProjectId();
    const user = await utils.getCurrentUser();
    const chainService = new ChainService(imbueApi);
    ReactDOMClient.createRoot(document.getElementById('project-body')!)
        .render(<Details imbueApi={imbueApi} projectId={projectId} user={user} chainService={chainService} />);
});