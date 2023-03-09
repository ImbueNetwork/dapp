import React, { useState, useEffect } from "react";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import { BsCircleFill } from "react-icons/bs";
import { Currency, Milestone, ProjectOnChain, ProjectState } from "../models";


export type MilestonesItemProps = {
  milestone: Milestone,
  projectOnChain: ProjectOnChain,
  toggleMilestone: (milestoneKey: number) => void,
  isInVotingRound: boolean,
  toggleActive: boolean
}

const MilestoneItem = ({ milestone, projectOnChain, toggleActive, toggleMilestone, isInVotingRound }: MilestonesItemProps): JSX.Element => {

  const [formattedMilestoneValue, setFormattedMilestoneValue] = useState("0");

  useEffect(() => {
    if (milestone) {
      const milestoneValue = Number((milestone.percentage_to_unlock / 100) * projectOnChain.requiredFundsFormatted);
      setFormattedMilestoneValue(milestoneValue.toLocaleString());
    }
  }, []);



  const displayMilestoneToggle = (): JSX.Element => {
    if (milestone.isApproved) {
      if (toggleActive) {
        return <div> <BsCircleFill className="milestone-status-icon" />  <span className="milestone-status approved"> Approved </span>  <AiFillMinusCircle /></div>
      } else {
        return <div> <BsCircleFill className="milestone-status-icon" />  <span className="milestone-status approved"> Approved </span> <AiFillPlusCircle /></div>
      }
    } else if (isInVotingRound) {
      if (toggleActive) {
        return <div> <BsCircleFill className="milestone-status-icon active" />  <span className="milestone-status active"> Active </span>  <AiFillMinusCircle /></div>
      } else {
        return <div> <BsCircleFill className="milestone-status-icon active" />  <span className="milestone-status active"> Active </span> <AiFillPlusCircle /></div>
      }

    } else {
      if (toggleActive) {
        return <div> <span className="milestone-status not-started">Not Started </span> <AiFillMinusCircle /></div>
      } else {
        return <div> <span className="milestone-status not-started">Not Started  </span><AiFillPlusCircle /></div>
      }
    }
  }


  return (
    <div className="main">
      <div
        className="milestone-row"
        onClick={() => {
          toggleMilestone(milestone.milestone_key);
        }}
      >
        <span>{milestone.name}</span>
        {displayMilestoneToggle()}
      </div>
      <div className={toggleActive ? "content show" : "content hide"}>
        <div className="milestone-details-info">
          <div>
            <span className="detail-label">Percentage of funds released</span>
            <span className="funds-required">{milestone.percentage_to_unlock}%</span>
          </div>

          <div>
            <span className="detail-label">Funding Released</span>
            <span className="funds-required">{formattedMilestoneValue} ${projectOnChain.currencyId as Currency}</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MilestoneItem;
