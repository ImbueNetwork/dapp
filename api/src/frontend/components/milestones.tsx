import React, { useState } from "react";
import { type ProjectOnChain, ProjectState } from "../models";
import MilestoneItem from "./milestoneItem";

export interface MilestonesProps {
  projectOnChain: ProjectOnChain;
  firstPendingMilestoneIndex: number;
}

export const Milestones = ({
  projectOnChain,
  firstPendingMilestoneIndex,
}: MilestonesProps): JSX.Element => {
  const [activeMilestone, setActiveMilestone] = useState(0);

  const toggleMilestone = (milestoneKey: number) => {
    setActiveMilestone(milestoneKey != activeMilestone ? milestoneKey : -1);
  };

  return projectOnChain.milestones ? (
    <div className="container accordion">
      {projectOnChain.milestones.map((milestone, index) => (
        <MilestoneItem
          key={milestone.milestone_key}
          projectOnChain={projectOnChain}
          milestone={milestone}
          isInVotingRound={
            milestone.milestone_key === firstPendingMilestoneIndex &&
            projectOnChain.projectState === ProjectState.OpenForVoting
          }
          toggleActive={activeMilestone === milestone.milestone_key}
          toggleMilestone={toggleMilestone}
        />
      ))}
    </div>
  ) : (
    <></>
  );
};
