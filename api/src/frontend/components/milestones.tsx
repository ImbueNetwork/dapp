import React from 'react';
import { Milestone, ProjectOnChain, ProjectState } from "../models";
import MilestoneItem from './milestoneItem';

export type MilestonesProps = {
    projectOnChain: ProjectOnChain,
    firstPendingMilestoneIndex: number
}

type MilestonesState = {
    activeMilestone: number
}

export class Milestones extends React.Component<MilestonesProps, MilestonesState> {

    state: MilestonesState = {
        activeMilestone: 0,
    }

    toggleMilestone = (milestoneKey: number) => {
        this.setState({
            activeMilestone: milestoneKey != this.state.activeMilestone ? milestoneKey : -1
        })
    };


    render() {
        if (this.props.projectOnChain.milestones) {
            return (
                <div className="container accordion">
                    {this.props.projectOnChain.milestones.map((milestone, index) => (
                        <MilestoneItem
                            key={milestone.milestoneKey}
                            projectOnChain={this.props.projectOnChain}
                            milestone={milestone}
                            isInVotingRound={milestone.milestoneKey === this.props.firstPendingMilestoneIndex && this.props.projectOnChain.projectState === ProjectState.OpenForVoting}
                            toggleActive={this.state.activeMilestone === (milestone.milestoneKey)}
                            toggleMilestone={this.toggleMilestone}
                        />
                    ))}
                </div>
            );
        }
    }
}