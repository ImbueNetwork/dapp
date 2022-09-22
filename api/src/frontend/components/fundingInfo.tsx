import * as React from 'react';
import { LinearProgress } from "@rmwc/linear-progress";

// @ts-ignore
import { ProgressBar, Step } from "react-step-progress-bar";

import "react-step-progress-bar/styles.css";
import '@rmwc/linear-progress/styles';
import { Currency, ProjectOnChain, ProjectState, User } from "../models";

export type FundingInfoProps = {
    projectOnChain: ProjectOnChain,
    lastApprovedMilestoneIndex: number,
}

type FundingInfoState = {
    percentageFunded: number | undefined,
}

export class FundingInfo extends React.Component<FundingInfoProps> {
    state: FundingInfoState = {
        percentageFunded: undefined,
    }

    async componentDidUpdate() {
        if (this.props.projectOnChain.milestones && !this.state.percentageFunded) {
            this.setProjectState();
        }
    }

    async setProjectState() {
        const totalContributions = this.props.projectOnChain.contributions.reduce((sum: bigint, contribution) => sum + contribution.value, BigInt(0))
        const percentageFunded = Number(totalContributions / BigInt(1e12)) / Number((this.props.projectOnChain.requiredFunds / BigInt(1e12))) * 100;
        if (Number(percentageFunded.toFixed(2)) != this.state.percentageFunded) {
            this.setState({
                percentageFunded: percentageFunded.toFixed(1),
            })
        }
    }

    render() {
        if (this.props.projectOnChain.milestones) {
            return (
                <div>
                    <div id="funding-info">
                        <div className="progress-info">
                            <LinearProgress progress={this.state.percentageFunded/100} buffer={this.props.projectOnChain.projectState == ProjectState.OpenForContribution ? 0.1 : 1} ></LinearProgress>
                            <span>{this.state.percentageFunded}% Funded</span>
                            <div className="funding-goal">
                                <span className="detail-label">Funding Goal</span>
                                <span className="funds-required">{this.props.projectOnChain.requiredFundsFormatted.toLocaleString()}</span>
                                <span id="project-detail-currency"
                                    className="funds-required">${this.props.projectOnChain.currencyId as Currency}</span>{' '}
                            </div>
                        </div>

                        <div className="progress-info">
                            <ProgressBar percent={100 * ((this.props.lastApprovedMilestoneIndex + 1) / this.props.projectOnChain.milestones.length)}>
                                {this.props.projectOnChain.milestones.map((milestone, index, arr) => {
                                    return (
                                        <Step
                                            position={100 * (index / arr.length)}
                                            transition="scale"
                                            key={milestone.milestoneKey}
                                            children={({ }) => (
                                                <div className={milestone.isApproved ? "progress-dot completed" : "progress-dot"} title={milestone.name}>
                                                </div>
                                            )}
                                        />
                                    );
                                })}
                            </ProgressBar>
                            <span>{this.props.projectOnChain.milestones.length} Milestones</span> {''}
                        </div>

                    </div>

                </div>
            );
        }
    }
}