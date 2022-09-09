import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { Tab, TabBar } from "@rmwc/tabs";
import { List, SimpleListItem } from "@rmwc/list";
import * as utils from "./utils";
import * as polkadot from "./utils/polkadot";
import { Currency, RoundType, Project, User } from "./models";
import "../../public/proposal.css"
import '@rmwc/list/styles';
import { marked } from "marked";

import { Contribute } from './components/contribute';

type DetailsProps = {
    imbueApi: polkadot.ImbueApiInfo,
    projectId: string | number | null,
    user: User,
}

type DetailsState = {
    activeTabIndex: number,
    project: Project,
    projectOnChain: any,
    projectState: string,
    userIsInitiator: boolean,
    showContributeComponent: boolean,
    showSubmitMilestoneComponent: boolean,
    showVoteComponent: boolean,
    showWithdrawComponent: boolean
}

const initiatorHeadingMapping: Record<string, JSX.Element> = {
    /* PROJECT HAS BEEN CREATED SUCCESSFULLY AND pending ADDITION TO FUNDING ROUND */
    "pending_project_approval": <h3>Funding for this project is not yet open. Check back soon for more updates!</h3>,

    /* PROJECT IS PENDING FUNDING APPROVAL ROUND */
    "pending_funding_approval": <h3>Pending funding approval. Funding round not complete or approved. Please <a href="https://discord.gg/jyWc6k8a">contact the team</a> for review.</h3>,

    /* PROJECT IS IN THE CONTRIBUTION ROUND */
    "pending_contributions": <h3>Your proposal has been created successfully and added to the funding round. Contributors can now fund your project</h3>,

    /* PROJECT IS IN THE VOTING ROUND */
    "open_for_voting": <h3>Pending milestone approval. Milestone voting round not complete or approved. Please <a href='https://discord.gg/jyWc6k8a'>contact the team</a> for review.</h3>,

    /* PROJECT IS pending MILESTONE SUBMISSION */
    "pending_milestone_submission": <h3>Pending milestone submission</h3>
}


const contributorHeadingMapping: Record<string, JSX.Element> = {
    /* PROJECT HAS BEEN CREATED SUCCESSFULLY AND pending ADDITION TO FUNDING ROUND */
    "pending_project_approval": <h3>Funding for this project is not yet open. Check back soon for more updates!</h3>,

    /* PROJECT IS PENDING FUNDING APPROVAL ROUND */
    "pending_funding_approval": <h3>Pending funding approval. Funding round not complete or approved. Please <a href="https://discord.gg/jyWc6k8a">contact the team</a> for review.</h3>,

    /* PROJECT IS IN THE CONTRIBUTION ROUND */
    "pending_contributions": <h3>This project is open for contributions!</h3>,

    /* PROJECT IS IN THE VOTING ROUND */
    "open_for_voting": <h3>Project contributors can now vote on milestones</h3>,


    /* PROJECT IS pending MILESTONE SUBMISSION */
    "pending_milestone_submission": <h3>Pending milestone submission</h3>,
}

class Details extends React.Component<DetailsProps, DetailsState> {
    state: DetailsState = {
        activeTabIndex: 0,
        project: {} as Project,
        projectOnChain: {} as any,
        projectState: "",
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

    async setProjectState(project: Project): Promise<void> {
        let userIsInitiator = false;
        let projectInContributionRound = false;
        let projectInVotingRound = false;
        let finalState = ""
        let showContributeComponent = false
        let showSubmitMilestoneComponent = false;
        let showVoteComponent = false;
        let showWithdrawComponent = false;

        const projectOnChain: any = (await this.props.imbueApi.imbue?.api.query.imbueProposals.projects(project.chain_project_id)).toHuman();

        if (!projectOnChain.milestones) {
            return;
        }

        const lastHeader = await this.props.imbueApi.imbue.api.rpc.chain.getHeader();
        const currentBlockNumber = lastHeader.number.toBigInt();
        const rounds: any = await (await this.props.imbueApi.imbue.api.query.imbueProposals.rounds.entries());
        const isLoggedIn = (this.props.user && this.props.user.web3Accounts != null)
        if (isLoggedIn) {
            this.props.user.web3Accounts.forEach(web3Account => {
                if (web3Account.address == projectOnChain.initiator) {
                    userIsInitiator = true;
                }
            });
        }

        for (var i = Object.keys(rounds).length - 1; i >= 0; i--) {
            const [id, round] = rounds[i];
            const readableRound = round.toHuman();
            const roundStart = BigInt(readableRound.start.replaceAll(",", ""));
            const roundEnd = BigInt(readableRound.end.replaceAll(",", ""));
            const ProjectExistsInRound = readableRound.projectKeys.includes(projectOnChain.milestones[0].projectKey)

            if (roundStart < currentBlockNumber && roundEnd > currentBlockNumber && ProjectExistsInRound) {
                if (projectOnChain.approvedForFunding && readableRound.roundType == RoundType[RoundType.ContributionRound]) {
                    projectInContributionRound = true;
                    break;
                } else if (projectOnChain.fundingThresholdMet && readableRound.roundType == RoundType[RoundType.VotingRound]) {
                    projectInVotingRound = true;
                    break;
                }
            }
        }

        if (projectOnChain.fundingThresholdMet) {
            // Initators cannot contribute to their own project
            if (userIsInitiator) {
                showSubmitMilestoneComponent = userIsInitiator;
                if (projectInVotingRound) {
                    showWithdrawComponent = userIsInitiator;
                    finalState = "pending_milestone_approval";
                } else if (projectInContributionRound) {
                    finalState = "pending_contributions"
                }
            } else if (projectInVotingRound) {
                showVoteComponent = projectInVotingRound;
                finalState = "open_for_voting";
            } else {
                finalState = "pending_milestone_submission";
            }
        } else if (!userIsInitiator && projectInContributionRound) {
            showContributeComponent = projectInContributionRound;
            finalState = "pending_contributions";
        } else {
            // Project not yet open for funding
            if (projectOnChain.approvedForFunding && !projectInContributionRound) {
                finalState = "pending_funding_approval";
            } else if (userIsInitiator) {
                if (projectInContributionRound) {
                    finalState = "pending_contributions"
                } else {
                    finalState = "pending_project_approval";
                }
            } else {
                finalState = "pending_project_approval";
            }
        }

        if (this.state.projectState !== finalState) {
            this.setState({
                project: project,
                projectOnChain: projectOnChain,
                userIsInitiator: userIsInitiator,
                projectState: finalState,
                showContributeComponent: showContributeComponent,
                showVoteComponent: showVoteComponent,
                showWithdrawComponent: showWithdrawComponent,
            })
        }
    }

    async componentDidMount() {
        const project = await utils.fetchProject(this.props.projectId);
        if (!project) {
            utils.redirect("/not-found");
            location.reload();
            return;
        }
        this.setProjectState(project);
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
                    id="project-name">{this.state.project.name}</span></h1></header>
                <img id="project-logo" loading="lazy"
                    srcSet="https://uploads-ssl.webflow.com/6269d876b0577cd24ebce942/626f2cc6ce0d710373645931_6269d876b0577c5f59bceab2_imbue-web-image%5B1%5D-p-800.jpeg" />
            </div>

            {this.showProjectStateHeading()}

            <div className="action-buttons">
                {this.state.showContributeComponent ?
                    <Contribute
                        projectOnChain={this.state.projectOnChain}
                        user={this.props.user}
                        imbueApi={this.props.imbueApi}
                    ></Contribute>
                    : null
                }
            </div>

            <TabBar activeTabIndex={this.state.activeTabIndex}
                onActivate={(evt) => this.setActiveTab(evt.detail.index)}>
                <Tab icon="description" label="About" />
                <Tab icon="list" label="Milestones" />
            </TabBar>

            <div id="tab-content-container">
                <div className={`tab-content ${this.state.activeTabIndex === 0 ? "active" : ""}`}>
                    <div id="project-description"
                        dangerouslySetInnerHTML={{ __html: marked.parse(`${this.state.project.description}`) }}>
                    </div>
                    <ul className="project-details">
                        <li className="project-detail"><span className="detail-value hidden" id="in-block"></span></li>
                        <li className="project-detail">
                            <span className="detail-label"></span>
                            <span id="project-detail-currency"
                                className="imbu-currency-label">${this.state.projectOnChain.currencyId as Currency}</span>{' '}
                            <span id="funds-required">{String(this.state.project.required_funds / 1e12)}</span>
                            <span className="imbu-currency-label fraction">.00</span>{' '}
                            <span className="detail-label">required</span>
                        </li>
                        <li className="project-detail">
                            <span className="detail-value" id="project-website">
                                <a href={this.state.project.website} target="_blank">{this.state.project.website}</a>
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
    ReactDOMClient.createRoot(document.getElementById('project-body')!)
        .render(<Details imbueApi={imbueApi} projectId={projectId} user={user} />);
});