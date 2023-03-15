import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { Brief, Currency, Project, User } from "../../models";
import { getCurrentUser, redirect } from "../../utils";
import "../../../../public/hirer-dashboard.css";
import { getUserBriefs } from "../../services/briefsService";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

export type HirerDashboardProps = {
    user: User;
};

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

export const HirerDashboard = ({ user }: HirerDashboardProps): JSX.Element => {
    const [briefsUnderReview, setBriefsUnderReview] = useState<any[]>([]);
    const [acceptedBriefs, setAcceptedBriefs] = useState<any[]>([]);

    const redirectToApplications = (brief_id) => {
        redirect(`briefs/${brief_id}/applications/`);
    };

    const redirectToProjectDetails = async (project_id) => {
        // TODO: redirect to details page
    };

    useEffect(() => {
        const setup = async () => {
            const userBriefs = await getUserBriefs(user.id);
            setBriefsUnderReview(userBriefs.briefsUnderReview);
            setAcceptedBriefs(userBriefs.acceptedBriefs);
        }
        setup();
    }, []);

    return (
        <div className="application-container">

            <div className="section">
                <div className="container">
                    <div className="brief-info">
                        <div className="brief-description">
                            <h3>Open Briefs</h3>
                        </div>
                        <div className="brief-proposals">
                                <h3>Proposals</h3>
                        </div>

                    </div>
                    <hr className="separator" />
                    {briefsUnderReview.map((brief) => {
                        const timePosted = timeAgo.format(new Date(brief.created));

                        return (
                            <>
                                <div className="brief-info">
                                    <div className="brief-description">
                                        <h3>{brief.headline}</h3>
                                        <span>${Number(brief.budget).toLocaleString()}</span>
                                        <span>Created {timePosted}</span>
                                    </div>
                                    <div className="project-milestones">
                                        <div className="milestone-header">
                                            <h3>{brief.number_of_applications}</h3>
                                        </div>
                                    </div>
                                    <div className="brief-button">
                                        <button className="primary-btn in-dark w-button" onClick={() => redirectToApplications(brief.id)}>View Status</button>
                                    </div>
                                </div>
                            </>
                        )
                    })}
                </div>
            </div>

            <div className="section">
                <div className="container">
                    <div className="brief-info">
                        <div className="brief-description">
                            <h3>Projects</h3>
                        </div>
                    </div>
                    <hr className="separator" />
                    {acceptedBriefs.map((brief) => {
                        const numberOfApprovedMilestones = brief.milestones.filter(milestone => milestone.is_approved).length;
                        const totalMilestoneCount = brief.milestones.length;
                        const percent = ((numberOfApprovedMilestones / totalMilestoneCount) ?? 0) * 100;
                        const timePosted = timeAgo.format(new Date(brief.created));
                        return (
                            <>
                                <div className="brief-info">
                                    <div className="brief-description">
                                        <h3>{brief.headline}</h3>
                                        <span>{Number(brief.project.required_funds).toLocaleString()} ${Currency[brief.project.currency_id]}</span>
                                        <span>Created {timePosted}</span>
                                    </div>
                                    <div className="project-milestones">
                                        <div className="milestone-header">
                                            <h3>Milestones</h3>
                                            <h3 className="milestones-info">{numberOfApprovedMilestones}/{totalMilestoneCount}</h3>
                                        </div>

                                        <div className="project-progress">
                                            <div
                                                className="project-progress-indicator"
                                                style={{
                                                    width: `${percent}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="brief-button">
                                        <button className="primary-btn in-dark w-button" onClick={() => redirectToProjectDetails(brief.project_id)}>View Status</button>
                                    </div>
                                </div>
                            </>
                        )
                    })}
                </div>
            </div>
        </div >
    );
};

document.addEventListener("DOMContentLoaded", async (event) => {
    const user = await getCurrentUser();
    if (user) {
        ReactDOMClient.createRoot(
            document.getElementById("hirer-dashboard")!
        ).render(<HirerDashboard user={user} />);
    }
});