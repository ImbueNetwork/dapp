import React from "react";
import {AiFillPlusCircle, AiFillMinusCircle} from "react-icons/ai";
import {BsCircleFill} from "react-icons/bs";
import {Currency, Milestone, ProjectOnChain, ProjectState, User} from "../models";
import {Button} from "@rmwc/button";
import * as config from "../config";
import ChainService from "../services/chainService";


export type MilestonesItemProps = {
    milestone: Milestone,
    projectOnChain: ProjectOnChain,
    toggleMilestone: (milestoneKey: number) => void,
    isInVotingRound: boolean,
    toggleActive: boolean,
    user: User,
    chainService: ChainService
}

type MilestonesState = {
    formattedMilestoneValue: string
    detailsValue: string
    isUserInitiator: boolean
    valueExist: boolean
    dbProjectId: number
}

class MilestoneItem extends React.Component<MilestonesItemProps, MilestonesState> {

    state: MilestonesState = {
        formattedMilestoneValue: "0",
        detailsValue: "",
        isUserInitiator: false,
        valueExist: false,
        dbProjectId: 0
    }

    handleChange(event: any) {
        this.setState({detailsValue: event.target.value});
    }

    handleSubmit(details: any, projectId: any, milestoneId: any) {
        const jsonData = {
            "milestoneDetails": {
                "project_id": projectId,
                "details": details,
                "milestone_id": milestoneId
            }
        }

        fetch(`${config.apiBase}/milestones`, {  // Enter your IP address here
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            mode: 'cors',
            body: JSON.stringify(jsonData)
        })
        console.log("The details have been successfully added to milsetone_details");

        this.setState({valueExist: true});
    }

    componentDidMount() {
        if (this.props.milestone) {
            const milestoneValue = Number((this.props.milestone.percentageToUnlock / 100) * this.props.projectOnChain.requiredFundsFormatted);
            this.setState({
                formattedMilestoneValue: milestoneValue.toLocaleString()
            });
            this.setState({detailsValue: ""});
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.props.chainService.isUserInitiator(this.props.user, this.props.projectOnChain).then(x => {
            this.setState({isUserInitiator: x});
        })

        fetch(
            `${config.apiBase}/milestones/1/milestone/${this.props.milestone.milestoneKey}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("This is the json", data)
                if (data.length > 0 && data !== undefined) {
                    this.setState({
                        detailsValue: data[0].details
                    });
                    this.setState({valueExist: true});
                }
            })

        fetch(`${config.apiBase}/users/${this.props.user.id}/project`)
            .then((res) => {
                if (res.ok) return res.json();
                else if (res.status === 404) {
                    throw new Error('Project not found for the user')
                }
                else throw new Error("Status code error :" + res.status)
            })
            .then((data) => {
                if (data !== null && data.id !== null) this.setState({dbProjectId: data.id});
            })
            .catch(error => console.log(error));
    }


    displayMilestoneToggle(): JSX.Element {
        if (this.props.milestone.isApproved) {
            if (this.props.toggleActive) {
                return <div><BsCircleFill className="milestone-status-icon"/> <span
                    className="milestone-status approved"> Approved </span> <AiFillMinusCircle/></div>
            } else {
                return <div><BsCircleFill className="milestone-status-icon"/> <span
                    className="milestone-status approved"> Approved </span> <AiFillPlusCircle/></div>
            }
        } else if (this.props.isInVotingRound) {
            if (this.props.toggleActive) {
                return <div><BsCircleFill className="milestone-status-icon active"/> <span
                    className="milestone-status active"> Active </span> <AiFillMinusCircle/></div>
            } else {
                return <div><BsCircleFill className="milestone-status-icon active"/> <span
                    className="milestone-status active"> Active </span> <AiFillPlusCircle/></div>
            }

        } else {
            if (this.props.toggleActive) {
                return <div><span className="milestone-status not-started">Not Started </span> <AiFillMinusCircle/>
                </div>
            } else {
                return <div><span className="milestone-status not-started">Not Started  </span><AiFillPlusCircle/></div>
            }
        }
    }

    displayDetailsField(): JSX.Element {
        if (this.state.isUserInitiator && !this.state.valueExist) {
            return (<div style={{display: "flex", marginLeft: "60vw"}}>
              <textarea value={this.state.detailsValue} onChange={this.handleChange}
                        placeholder={"add details to your milestone"}/>
                <Button outlined onClick={() => {
                    this.handleSubmit(this.state.detailsValue, this.state.dbProjectId, this.props.milestone.milestoneKey);
                }}>
                    Add
                </Button>
            </div>)
        } else return (
            <div>
                <span className="detail-label">Details</span>
                <span className="funds-required"> {this.state.detailsValue}</span>
            </div>)
    }


    render() {
        return (
            <div className="main">
                <div
                    className="milestone-row"
                    onClick={() => {
                        this.props.toggleMilestone(this.props.milestone.milestoneKey);
                    }}>
                    <span>{this.props.milestone.name}</span>
                    {this.displayMilestoneToggle()}
                </div>

                <div className={this.props.toggleActive ? "content show" : "content hide"}>
                    <div className="milestone-details-info">
                        <div>
                            <span className="detail-label">Percentage of funds released</span>
                            <span className="funds-required">{this.props.milestone.percentageToUnlock}%</span>
                        </div>
                        {this.displayDetailsField()}
                        <div>
                            <span className="detail-label">Funding Released</span>
                            <span
                                className="funds-required">{this.state.formattedMilestoneValue} ${this.props.projectOnChain.currencyId as Currency}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default MilestoneItem;
