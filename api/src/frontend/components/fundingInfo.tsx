import React, { useState, useEffect } from 'react';
import { ProgressBar, Step } from "react-step-progress-bar";
import { LinearProgress } from "@rmwc/linear-progress";
import '@rmwc/linear-progress/styles';
import "react-step-progress-bar/styles.css";

import { Currency, ProjectOnChain, ProjectState, User } from "../models";

export type FundingInfoProps = {
    projectOnChain: ProjectOnChain,
    lastApprovedMilestoneIndex: number,
}

export const FundingInfo = ({ projectOnChain, lastApprovedMilestoneIndex }: FundingInfoProps): JSX.Element => {
    const [percentageFunded, setPercentageFunded] = useState<number>();

    useEffect(() => {
        if (projectOnChain.milestones && !percentageFunded) {
            const funded = (projectOnChain.raisedFundsFormatted / projectOnChain.requiredFundsFormatted) * 100;
            if (Number(funded.toFixed(1)) != percentageFunded) {
                setPercentageFunded(Number(funded.toFixed(1)));
            }
        }
    }, [projectOnChain, percentageFunded]);

    return projectOnChain.milestones ?
        <div>
            <div id="funding-info">
                <div className="progress-info">
                    <LinearProgress progress={(percentageFunded ?? 0) / 100} buffer={projectOnChain.projectState == ProjectState.OpenForContribution ? 0.1 : 1} />
                    <span>{percentageFunded}% Funded</span>
                    <div className="funding-goal">
                        <span className="detail-label">Funding Goal</span>
                        <span className="funds-required">{projectOnChain.requiredFundsFormatted.toLocaleString()}</span>
                        <span id="project-detail-currency"
                            className="funds-required">${projectOnChain.currencyId as Currency}</span>{' '}
                    </div>
                </div>

                <div className="progress-info">
                    <ProgressBar percent={100 * ((lastApprovedMilestoneIndex + 1) / projectOnChain.milestones.length)}>
                        {projectOnChain.milestones.map((milestone, index, arr) => {
                            return (
                                <Step
                                    position={100 * (index / arr.length)}
                                    transition="scale"
                                    key={milestone.milestone_key}
                                    children={({ }) => (
                                        <div className={milestone.isApproved ? "progress-dot completed" : "progress-dot"} title={milestone.name}>
                                        </div>
                                    )}
                                />
                            );
                        })}
                    </ProgressBar>
                    <span>{projectOnChain.milestones.length} Milestones</span> {''}
                </div>

            </div>

        </div> : <></>
}