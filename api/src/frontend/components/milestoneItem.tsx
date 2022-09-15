import React, { Component } from "react";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import {  BsCircleFill } from "react-icons/bs";
import { Currency, Milestone, ProjectOnChain, ProjectState } from "../models";


export type MilestonesItemProps = {
  milestone: Milestone,
  projectOnChain: ProjectOnChain,
  toggleMilestone: (milestoneKey: number) => void,
  isInVotingRound: boolean,
  toggleActive: boolean
}

type MilestonesState = {
  formattedMilestoneValue: string
}

class MilestoneItem extends React.Component<MilestonesItemProps, MilestonesState> {

  state: MilestonesState = {
    formattedMilestoneValue: "0"
  }

  componentDidMount() {
    if (this.props.milestone) {
      const milestoneValue = Number((this.props.milestone.percentageToUnlock / 100) * this.props.projectOnChain.requiredFundsFormatted);
      this.setState({
        formattedMilestoneValue: milestoneValue.toLocaleString()
      });
    }
  }



  displayMilestoneToggle(): JSX.Element {
    if (this.props.milestone.isApproved) {
      if (this.props.toggleActive) {
        return <div> <BsCircleFill className="milestone-status-icon"/>  <span className="milestone-status approved"> Approved </span>  <AiFillMinusCircle /></div>
      } else {
        return <div> <BsCircleFill className="milestone-status-icon"/>  <span className="milestone-status approved"> Approved </span> <AiFillPlusCircle /></div>
      }
    } else if (this.props.isInVotingRound) {
      if (this.props.toggleActive) {
        return <div> <BsCircleFill className="milestone-status-icon active"/>  <span className="milestone-status active"> Active </span>  <AiFillMinusCircle /></div>
      } else {
        return <div> <BsCircleFill className="milestone-status-icon active"/>  <span className="milestone-status active"> Active </span> <AiFillPlusCircle /></div>
      }

    } else {
      if (this.props.toggleActive) {
        return <div> <span className="milestone-status not-started">Not Started </span> <AiFillMinusCircle /></div>
      } else {
        return <div> <span className="milestone-status not-started">Not Started  </span><AiFillPlusCircle /></div>
      }
    }
  }


  render() {
    return (
      <div className="main">
        <div
          className="milestone-row"
          onClick={() => {
            this.props.toggleMilestone(this.props.milestone.milestoneKey);
          }}
        >
          <span>{this.props.milestone.name}</span>
          {this.displayMilestoneToggle()}
        </div>
        <div className={this.props.toggleActive ? "content show" : "content hide"}>
          <div className="milestone-details-info">
            <div>
              <span className="detail-label">Percentage of funds released</span>
              <span className="funds-required">{this.props.milestone.percentageToUnlock}%</span>
            </div>

            <div>
              <span className="detail-label">Funding Released</span>
              <span className="funds-required">{this.state.formattedMilestoneValue} ${this.props.projectOnChain.currencyId as Currency}</span>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default MilestoneItem;
